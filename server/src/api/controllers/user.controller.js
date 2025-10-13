// src/api/controllers/user.controller.js

const db = require('../../config/db');
const cloudinary = require('../../config/cloudinary');

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


// Uploads a new medical record for the logged-in patient
exports.uploadMedicalRecord = async (req, res) => {
    const { userId, role } = req.user;
    const { documentName, documentType } = req.body;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can upload medical records.' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Please include a file in the `documentFile` form field.' });
    }

    try {
        const patientResult = await db.query('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        // --- CLOUDINARY UPLOAD IMPLEMENTATION ---
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw', // Important for non-image files like PDFs
                    folder: `records/${patientId}`, // Organize files in folders by patient
                    public_id: `${Date.now()}-${req.file.originalname}`, // Create a unique public ID
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const documentUrl = uploadResult.secure_url;
        
        const insertQuery = `
            INSERT INTO medical_records (patient_id, document_name, document_type, document_url)
            VALUES ($1, $2, $3, $4)
            RETURNING record_id;
        `;
        const dbResult = await db.query(insertQuery, [patientId, documentName, documentType, documentUrl]);

        res.status(201).json({ 
            message: 'Medical record uploaded successfully.',
            record: {
                recordId: dbResult.rows[0].record_id,
                documentName,
                documentType,
                documentUrl
            }
        });

    } catch (error) {
        console.error('Error uploading medical record:', error);
        res.status(500).json({ message: 'An error occurred while uploading the medical record.' });
    }
};

// Gets all medical records for the logged-in patient
exports.getMyMedicalRecords = async (req, res) => {
    const { userId, role } = req.user;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view medical records.' });
    }

    try {
        const queryText = `
            SELECT r.record_id, r.document_name, r.document_type, r.document_url, r.uploaded_at
            FROM medical_records r
            JOIN patients p ON r.patient_id = p.patient_id
            WHERE p.user_id = $1
            ORDER BY r.uploaded_at DESC;
        `;
        const result = await db.query(queryText, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ message: 'An error occurred while fetching records.' });
    }
};

// Deletes a specific medical record
exports.deleteMedicalRecord = async (req, res) => {
    const { userId, role } = req.user;
    const { recordId } = req.params;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can delete medical records.' });
    }

    try {
        // Verify that the record belongs to the user trying to delete it
        const deleteQuery = `
            DELETE FROM medical_records
            WHERE record_id = $1 AND patient_id = (SELECT patient_id FROM patients WHERE user_id = $2)
            RETURNING record_id;
        `;
        const result = await db.query(deleteQuery, [recordId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Record not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Medical record deleted successfully.' });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({ message: 'An error occurred while deleting the record.' });
    }
};
