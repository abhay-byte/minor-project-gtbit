// src/api/controllers/professional.controller.js
const db = require('../../config/db');

// Fetches all verified professionals, with optional filtering by specialty
const getAllProfessionals = async (req, res) => {
    const { specialty } = req.query;

    let queryText = `
        SELECT
            p.professional_id,
            u.full_name,
            p.specialty,
            p.credentials,
            p.years_of_experience,
            p.rating,
            p.total_reviews,
            p.patients_treated,
            p.languages_spoken,
            p.working_hours,
            p.is_volunteer
        FROM professionals p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.verification_status = 'Verified'::verification_status_enum
    `;
    const queryParams = [];

    if (specialty) {
        queryParams.push(specialty);
        queryText += ` AND p.specialty = $${queryParams.length}`;
    }

    queryText += ' ORDER BY u.full_name;';

    try {
        const result = await db.query(queryText, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching professionals:', error);
        res.status(500).json({ message: 'An error occurred while fetching professionals.' });
    }
};

// Fetches available (not booked) time slots for a specific professional
const getProfessionalAvailability = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid professional ID.' });
    }

    try {
        const queryText = `
            SELECT
                slot_id,
                start_time,
                end_time
            FROM availability_slots
            WHERE professional_id = $1 AND is_booked = false
            ORDER BY start_time ASC;
        `;
        const result = await db.query(queryText, [id]);

        if (result.rows.length === 0) {
            // This isn't an error, the professional just may have no available slots.
            // A 200 response with an empty array is appropriate.
            return res.status(200).json([]);
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching availability for professional %s:', id, error);
        res.status(500).json({ message: 'An error occurred while fetching availability.' });
    }
};

// Fetches aggregated statistics for the logged-in professional's dashboard
const getProfessionalDashboard = async (req, res) => {
    // Assuming auth middleware has attached the user object to req
    // If your middleware uses a different property (e.g. req.userId), adjust accordingly
    const userId = req.user.userId;

    try {
        // 1. Fetch basic professional stats
        const profQuery = `
            SELECT
                professional_id,
                rating,
                total_reviews,
                patients_treated,
                verification_status,
                is_volunteer
            FROM professionals
            WHERE user_id = $1
        `;
        const profResult = await db.query(profQuery, [userId]);

        if (profResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professional profile not found for this user.' });
        }

        const professional = profResult.rows[0];
        const professionalId = professional.professional_id;

        // 2. Count appointments scheduled for today
        // Uses Postgres CURRENT_DATE to compare against the appointment timestamp
        const apptQuery = `
            SELECT COUNT(*)
            FROM appointments
            WHERE professional_id = $1
            AND appointment_time::DATE = CURRENT_DATE
            AND status != 'Cancelled'
        `;
        const apptResult = await db.query(apptQuery, [professionalId]);

        // 3. Count pending report requests
        const reportQuery = `
            SELECT COUNT(*)
            FROM upload_report_requests
            WHERE professional_id = $1
            AND status = 'Pending'
        `;
        const reportResult = await db.query(reportQuery, [professionalId]);

        // Construct the response object matching the requirement
        const dashboardData = {
            rating: parseFloat(professional.rating), // Ensure decimal is parsed as number if needed
            total_reviews: professional.total_reviews,
            patients_treated: professional.patients_treated,
            verification_status: professional.verification_status,
            is_volunteer: professional.is_volunteer,
            appointments_today_count: parseInt(apptResult.rows[0].count, 10),
            pending_reports_count: parseInt(reportResult.rows[0].count, 10)
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Error fetching professional dashboard:', error);
        res.status(500).json({ message: 'An error occurred while fetching dashboard stats.' });
    }
};

// Helper function to create a default professional profile if none exists
const createDefaultProfessionalProfile = async (userId, userFullName) => {
    // First, check if a professional profile already exists for this user
    const checkQuery = 'SELECT professional_id FROM professionals WHERE user_id = $1';
    const checkResult = await db.query(checkQuery, [userId]);
    
    if (checkResult.rows.length > 0) {
        // Profile already exists, return the existing profile
        return checkResult.rows[0].professional_id;
    }
    
    // Create a default professional profile
    const insertQuery = `
        INSERT INTO professionals (
            user_id,
            user_id_uuid,
            specialty,
            credentials,
            years_of_experience,
            verification_status,
            rating,
            total_reviews,
            patients_treated,
            languages_spoken,
            working_hours,
            is_volunteer
        ) VALUES ($1, (SELECT user_id_uuid FROM users WHERE user_id = $1), '', '', 0, 'Pending', 0.00, 0, 0, '', '', false)
        RETURNING professional_id
    `;
    const insertResult = await db.query(insertQuery, [userId]);
    return insertResult.rows[0].professional_id;
};

// Creates or updates a professional's profile
const createOrUpdateProfessionalProfile = async (req, res) => {
    // Assuming auth middleware has attached the user object to req
    const userId = req.user.userId;
    const {
        specialty,
        credentials,
        years_of_experience,
        languages_spoken,
        working_hours,
        is_volunteer
    } = req.body;

    try {
        // Check if a professional profile already exists for this user
        const checkQuery = 'SELECT professional_id FROM professionals WHERE user_id = $1';
        const checkResult = await db.query(checkQuery, [userId]);
        
        if (checkResult.rows.length > 0) {
            // Update existing profile
            const updateQuery = `
                UPDATE professionals
                SET
                    specialty = COALESCE($1, specialty),
                    credentials = COALESCE($2, credentials),
                    years_of_experience = COALESCE($3, years_of_experience),
                    languages_spoken = COALESCE($4, languages_spoken),
                    working_hours = COALESCE($5, working_hours),
                    is_volunteer = COALESCE($6, is_volunteer),
                    verification_status = CASE
                        WHEN specialty IS NOT NULL AND specialty != '' THEN verification_status
                        ELSE 'Pending'
                    END
                WHERE user_id = $7
                RETURNING professional_id
            `;
            const updateResult = await db.query(updateQuery, [
                specialty,
                credentials,
                years_of_experience,
                languages_spoken,
                working_hours,
                is_volunteer,
                userId
            ]);
            
            res.status(200).json({
                message: 'Professional profile updated successfully.',
                professional_id: updateResult.rows[0].professional_id
            });
        } else {
            // Get user's full name for creating the professional profile
            const userQuery = 'SELECT full_name FROM users WHERE user_id = $1';
            const userResult = await db.query(userQuery, [userId]);
            const userFullName = userResult.rows[0]?.full_name || '';

            // Create new professional profile
            const insertQuery = `
                INSERT INTO professionals (
                    user_id,
                    user_id_uuid,
                    specialty,
                    credentials,
                    years_of_experience,
                    verification_status,
                    rating,
                    total_reviews,
                    patients_treated,
                    languages_spoken,
                    working_hours,
                    is_volunteer
                ) VALUES ($1, (SELECT user_id_uuid FROM users WHERE user_id = $1), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING professional_id
            `;
            const insertResult = await db.query(insertQuery, [
                userId,
                specialty || '',
                credentials || '',
                years_of_experience || 0,
                'Pending', // verification_status
                0.00, // rating
                0, // total_reviews
                0, // patients_treated
                languages_spoken || '',
                working_hours || '',
                is_volunteer || false
            ]);
            
            res.status(201).json({
                message: 'Professional profile created successfully.',
                professional_id: insertResult.rows[0].professional_id
            });
        }
    } catch (error) {
        console.error('Error creating/updating professional profile:', error);
        res.status(500).json({ message: 'An error occurred while creating/updating professional profile.' });
    }
};

module.exports = {
    getAllProfessionals,
    getProfessionalAvailability,
    getProfessionalDashboard,
    createOrUpdateProfessionalProfile // Export the new function
};

// No duplicate export - the function is already exported above in the first module.exports
