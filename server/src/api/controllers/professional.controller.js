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
            p.years_of_experience
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

module.exports = {
    getAllProfessionals,
    getProfessionalAvailability,
};
