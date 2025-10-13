// src/api/controllers/user.controller.js

const db = require('../../config/db');

// Fetches the complete profile for the currently logged-in user.
exports.getMe = async (req, res) => {
    // The user's ID and role are attached to the request object by the verifyToken middleware
    const { userId, role } = req.user;

    try {
        let profileQuery;
        // Base query to get common user details
        const baseQuery = `
            SELECT u.user_id, u.email, u.full_name, u.phone_number, u.role, u.created_at
            FROM users u
            WHERE u.user_id = $1;
        `;

        // Start a transaction to fetch base user and role-specific details
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const userResult = await client.query(baseQuery, [userId]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const userProfile = userResult.rows[0];

            let roleDetails = {};
            // Fetch role-specific details
            if (role === 'Patient') {
                const patientResult = await client.query('SELECT patient_id, date_of_birth, gender, address FROM patients WHERE user_id = $1', [userId]);
                if (patientResult.rows.length > 0) roleDetails = patientResult.rows[0];
            } else if (role === 'Professional') {
                const profResult = await client.query('SELECT professional_id, specialty, credentials, years_of_experience, verification_status FROM professionals WHERE user_id = $1', [userId]);
                if (profResult.rows.length > 0) roleDetails = profResult.rows[0];
            } else if (role === 'NGO') {
                const ngoResult = await client.query('SELECT ngo_user_id, ngo_name, verification_status FROM ngo_users WHERE user_id = $1', [userId]);
                if (ngoResult.rows.length > 0) roleDetails = ngoResult.rows[0];
            }

            await client.query('COMMIT');
            
            // Combine the base user profile with role-specific details
            res.status(200).json({ ...userProfile, ...roleDetails });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Let the outer catch handle it
        } finally {
            client.release();
        }

    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the user profile.' });
    }
};

// Updates the profile for the currently logged-in user.
exports.updateMe = async (req, res) => {
    const { userId, role } = req.user;
    const { fullName, phoneNumber, ...roleSpecificData } = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Update the central 'users' table
        if (fullName || phoneNumber) {
            const userUpdateQuery = 'UPDATE users SET full_name = COALESCE($1, full_name), phone_number = COALESCE($2, phone_number) WHERE user_id = $3';
            await client.query(userUpdateQuery, [fullName, phoneNumber, userId]);
        }

        // Update the role-specific table based on the user's role
        if (role === 'Patient' && Object.keys(roleSpecificData).length > 0) {
            const { address, gender } = roleSpecificData;
            const patientUpdateQuery = 'UPDATE patients SET address = COALESCE($1, address), gender = COALESCE($2, gender) WHERE user_id = $3';
            await client.query(patientUpdateQuery, [address, gender, userId]);
        } else if (role === 'Professional' && Object.keys(roleSpecificData).length > 0) {
            const { specialty, credentials } = roleSpecificData;
            const profUpdateQuery = 'UPDATE professionals SET specialty = COALESCE($1, specialty), credentials = COALESCE($2, credentials) WHERE user_id = $3';
            await client.query(profUpdateQuery, [specialty, credentials, userId]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Profile updated successfully.' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'An error occurred while updating the profile.' });
    } finally {
        client.release();
    }
};
