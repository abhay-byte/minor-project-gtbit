// src/api/controllers/clinic.controller.js
const db = require('../../config/db');

// --- Geospatial and Clinic Search Functions ---

exports.searchClinics = async (req, res) => {
    const { lat, lon, radius = 5, specialty } = req.query; // radius in km, default 5km

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude (lat) and longitude (lon) are required query parameters.' });
    }

    try {
        // This SQL query calculates the distance between the user's location and each clinic
        // using the Haversine formula for accuracy. It then filters by the specified radius.
        // A LEFT JOIN is used to allow filtering by specialty if provided.
        let searchQuery = `
            SELECT
                c.clinic_id,
                c.name,
                c.address,
                c.latitude,
                c.longitude,
                c.phone_number,
                c.type,
                -- Haversine formula to calculate distance in kilometers
                ( 6371 * acos( cos( radians($1) ) * cos( radians( c.latitude ) ) * cos( radians( c.longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( c.latitude ) ) ) ) AS distance
            FROM clinics c
            ${specialty ? 'LEFT JOIN clinic_doctors cd ON c.clinic_id = cd.clinic_id' : ''}
            WHERE ( 6371 * acos( cos( radians($1) ) * cos( radians( c.latitude ) ) * cos( radians( c.longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( c.latitude ) ) ) ) <= $3
            ${specialty ? 'AND cd.specialty ILIKE $4' : ''}
            GROUP BY c.clinic_id
            ORDER BY distance;
        `;
        
        const params = [lat, lon, radius];
        if (specialty) {
            params.push(`%${specialty}%`);
        }

        const result = await db.query(searchQuery, params);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error searching for clinics:', error);
        res.status(500).json({ message: 'An error occurred while searching for clinics.' });
    }
};


exports.getClinicById = async (req, res) => {
    const { id } = req.params;
    try {
        const clinicQuery = 'SELECT * FROM clinics WHERE clinic_id = $1';
        const doctorsQuery = 'SELECT clinic_doctor_id, full_name, specialty, consultation_fee FROM clinic_doctors WHERE clinic_id = $1';

        const clinicResult = await db.query(clinicQuery, [id]);
        if (clinicResult.rows.length === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }

        const doctorsResult = await db.query(doctorsQuery, [id]);

        const clinicData = clinicResult.rows[0];
        clinicData.doctors = doctorsResult.rows;

        res.status(200).json(clinicData);
    } catch (error) {
        console.error(`Error fetching clinic with ID ${id}:`, error);
        res.status(500).json({ message: 'An error occurred while fetching clinic details.' });
    }
};

// --- Review Management Functions ---

exports.submitClinicDoctorReview = async (req, res) => {
    const { userId } = req.user;
    const { doctorId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
        return res.status(400).json({ message: 'Rating is a required field.' });
    }

    try {
        const patientResult = await db.query('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
        if (patientResult.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Only patients can submit reviews.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const insertQuery = `
            INSERT INTO reviews (patient_id, rating, comment, target_type, target_id)
            VALUES ($1, $2, $3, 'Clinic_Doctor', $4)
            RETURNING review_id;
        `;
        await db.query(insertQuery, [patientId, rating, comment, doctorId]);
        res.status(201).json({ message: 'Review submitted successfully.' });

    } catch (error) {
        console.error('Error submitting clinic doctor review:', error);
        res.status(500).json({ message: 'An error occurred while submitting the review.' });
    }
};

exports.getClinicDoctorReviews = async (req, res) => {
    const { doctorId } = req.params;
    try {
        const query = `
            SELECT r.review_id, r.target_id, r.target_type, r.patient_id, r.rating, r.comment, r.created_at, u.full_name as author
            FROM reviews r
            JOIN patients p ON r.patient_id = p.patient_id
            JOIN users u ON p.user_id = u.user_id
            WHERE r.target_type = 'Clinic_Doctor' AND r.target_id = $1
            ORDER BY r.created_at DESC;
        `;
        const result = await db.query(query, [doctorId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews.' });
    }
};

