// src/api/controllers/clinic.controller.js
const db = require('../../config/db');

// --- Geospatial and Clinic Search Functions ---

/**
 * Search for clinics based on geolocation and optional filters
 * Query params: lat, lon, radius (default 5km), specialty, type, available_today, min_rating
 */
exports.searchClinics = async (req, res) => {
    const { 
        lat, 
        lon, 
        radius = 5, 
        specialty, 
        type, 
        available_today,
        min_rating,
        city,
        area
    } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ 
            message: 'Latitude (lat) and longitude (lon) are required query parameters.' 
        });
    }

    try {
        // Build dynamic query with filters
        let conditions = [];
        let params = [lat, lon, radius];
        let paramIndex = 4;

        // Base query with new columns from ER diagram
        let searchQuery = `
            SELECT DISTINCT
                c.clinic_id,
                c.clinic_id_uuid,
                c.name,
                c.address,
                c.latitude,
                c.longitude,
                c.phone_number,
                c.type,
                c.facilities,
                c.operating_hours,
                c.average_rating,
                c.total_reviews,
                c.city,
                c.area,
                c.pincode,
                -- Haversine formula to calculate distance in kilometers
                ( 6371 * acos( 
                    cos( radians($1) ) * cos( radians( c.latitude ) ) * 
                    cos( radians( c.longitude ) - radians($2) ) + 
                    sin( radians($1) ) * sin( radians( c.latitude ) ) 
                ) ) AS distance,
                COUNT(DISTINCT cd.clinic_doctor_id) as doctor_count
            FROM clinics c
            LEFT JOIN clinic_doctors cd ON c.clinic_id = cd.clinic_id
            WHERE ( 6371 * acos( 
                cos( radians($1) ) * cos( radians( c.latitude ) ) * 
                cos( radians( c.longitude ) - radians($2) ) + 
                sin( radians($1) ) * sin( radians( c.latitude ) ) 
            ) ) <= $3
        `;

        // Add specialty filter
        if (specialty) {
            conditions.push(`cd.specialty ILIKE $${paramIndex}`);
            params.push(`%${specialty}%`);
            paramIndex++;
        }

        // Add clinic type filter (Clinic or Hospital)
        if (type) {
            conditions.push(`c.type = $${paramIndex}`);
            params.push(type);
            paramIndex++;
        }

        // Add available_today filter
        if (available_today === 'true') {
            conditions.push(`cd.available_today = true`);
        }

        // Add minimum rating filter
        if (min_rating) {
            conditions.push(`c.average_rating >= $${paramIndex}`);
            params.push(parseFloat(min_rating));
            paramIndex++;
        }

        // Add city filter
        if (city) {
            conditions.push(`c.city ILIKE $${paramIndex}`);
            params.push(`%${city}%`);
            paramIndex++;
        }

        // Add area filter
        if (area) {
            conditions.push(`c.area ILIKE $${paramIndex}`);
            params.push(`%${area}%`);
            paramIndex++;
        }

        // Append conditions to query
        if (conditions.length > 0) {
            searchQuery += ' AND ' + conditions.join(' AND ');
        }

        searchQuery += `
            GROUP BY c.clinic_id, c.clinic_id_uuid, c.name, c.address, c.latitude, 
                     c.longitude, c.phone_number, c.type, c.facilities, c.operating_hours,
                     c.average_rating, c.total_reviews, c.city, c.area, c.pincode
            ORDER BY distance;
        `;

        const result = await db.query(searchQuery, params);
        
        res.status(200).json({
            count: result.rows.length,
            radius_km: radius,
            location: { lat: parseFloat(lat), lon: parseFloat(lon) },
            clinics: result.rows
        });

    } catch (error) {
        console.error('Error searching for clinics:', error);
        res.status(500).json({ 
            message: 'An error occurred while searching for clinics.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get detailed information about a specific clinic including all doctors
 */
exports.getClinicById = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Validate that id is a valid positive integer
        const clinicId = parseInt(id);
        if (!id || isNaN(clinicId) || clinicId <= 0) {
            return res.status(400).json({ message: 'Invalid clinic ID provided.' });
        }

        // Updated query with new columns from ER diagram
        const clinicQuery = `
            SELECT
                clinic_id,
                clinic_id_uuid,
                name,
                address,
                latitude,
                longitude,
                phone_number,
                type,
                facilities,
                operating_hours,
                average_rating,
                total_reviews,
                city,
                area,
                pincode
            FROM clinics
            WHERE clinic_id = $1
        `;
        
        // Updated doctors query with new columns
        const doctorsQuery = `
            SELECT
                clinic_doctor_id,
                clinic_doctor_id_uuid,
                full_name,
                specialty,
                consultation_fee,
                qualifications,
                available_days,
                available_hours,
                rating,
                review_count,
                languages,
                distance_km,
                hospital_affiliation,
                is_volunteer,
                available_today,
                available_tomorrow,
                available_this_week
            FROM clinic_doctors
            WHERE clinic_id = $1
            ORDER BY rating DESC, review_count DESC
        `;

        const clinicResult = await db.query(clinicQuery, [id]);
        
        if (clinicResult.rows.length === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }

        const doctorsResult = await db.query(doctorsQuery, [id]);

        const clinicData = clinicResult.rows[0];
        clinicData.doctors = doctorsResult.rows;
        clinicData.doctor_count = doctorsResult.rows.length;

        res.status(200).json(clinicData);
        
    } catch (error) {
        console.error('Error fetching clinic with ID %s:', id, error);
        res.status(500).json({
            message: 'An error occurred while fetching clinic details.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get doctors by clinic ID with optional filters
 */
exports.getDoctorsByClinic = async (req, res) => {
    const { id } = req.params;
    const { specialty, available_today, min_rating } = req.query;

    try {
        let conditions = ['clinic_id = $1'];
        let params = [id];
        let paramIndex = 2;

        // Add specialty filter
        if (specialty) {
            conditions.push(`specialty ILIKE $${paramIndex}`);
            params.push(`%${specialty}%`);
            paramIndex++;
        }

        // Add available_today filter
        if (available_today === 'true') {
            conditions.push(`available_today = true`);
        }

        // Add minimum rating filter
        if (min_rating) {
            conditions.push(`rating >= $${paramIndex}`);
            params.push(parseFloat(min_rating));
            paramIndex++;
        }

        let selectFields = `
            clinic_doctor_id,
            clinic_doctor_id_uuid,
            full_name,
            specialty,
            consultation_fee,
            qualifications,
            available_days,
            available_hours,
            rating,
            review_count,
            languages,
            distance_km,
            hospital_affiliation,
            is_volunteer,
            available_today,
            available_tomorrow,
            available_this_week
        `;
        
        const query = `
            SELECT
                ${selectFields}
            FROM clinic_doctors
            WHERE ${conditions.join(' AND ')}
            ORDER BY rating DESC, review_count DESC
        `;

        const result = await db.query(query, params);
        
        res.status(200).json({
            clinic_id: parseInt(id),
            count: result.rows.length,
            doctors: result.rows
        });

    } catch (error) {
        console.error('Error fetching doctors for clinic:', error);
        res.status(500).json({
            message: 'An error occurred while fetching doctors.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// --- Review Management Functions ---

/**
 * Submit a review for a clinic doctor
 * Updated with new columns: appreciated_aspects, feedback_suggestions, is_verified_visit
 */
exports.submitClinicDoctorReview = async (req, res) => {
    const { userId, userUUID } = req.user;
    const { doctorId } = req.params;
    const {
        rating,
        comment,
        appreciated_aspects,
        feedback_suggestions,
        is_verified_visit = false
    } = req.body;

    if (!rating) {
        return res.status(400).json({ message: 'Rating is a required field.' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    try {
        // Get patient_id from user_id or user_id_uuid
        let patientResult;
        if (userUUID) {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1',
                [userUUID]
            );
        } else {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1',
                [userId]
            );
        }
        
        if (patientResult.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Forbidden: Only patients can submit reviews.' 
            });
        }
        
        const patientId = patientResult.rows[0].patient_id;

        // Verify clinic doctor exists
        const doctorCheck = await db.query(
            'SELECT clinic_doctor_id FROM clinic_doctors WHERE clinic_doctor_id = $1',
            [doctorId]
        );

        if (doctorCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Clinic doctor not found.' });
        }

        // Insert review with new columns
        const insertQuery = `
            INSERT INTO reviews (
                patient_id,
                rating,
                comment,
                target_type,
                target_id,
                appreciated_aspects,
                feedback_suggestions,
                is_verified_visit
            )
            VALUES ($1, $2, $3, 'ClinicDoctor', $4, $5, $6, $7)
            RETURNING review_id, review_id_uuid, created_at;
        `;
        
        const result = await db.query(insertQuery, [
            patientId, 
            rating, 
            comment, 
            doctorId,
            appreciated_aspects,
            feedback_suggestions,
            is_verified_visit
        ]);

        // Update clinic doctor's rating and review count
        await db.query(`
            UPDATE clinic_doctors
            SET
                rating = (
                    SELECT AVG(rating)::NUMERIC(3,2)
                    FROM reviews
                    WHERE target_type = 'ClinicDoctor' AND target_id = $1
                ),
                review_count = (
                    SELECT COUNT(*)
                    FROM reviews
                    WHERE target_type = 'ClinicDoctor' AND target_id = $1
                )
            WHERE clinic_doctor_id = $1
        `, [doctorId]);

        res.status(201).json({ 
            message: 'Review submitted successfully.',
            review: result.rows[0]
        });

    } catch (error) {
        console.error('Error submitting clinic doctor review:', error);
        res.status(500).json({ 
            message: 'An error occurred while submitting the review.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all reviews for a clinic doctor
 * Updated with new review columns
 */
exports.getClinicDoctorReviews = async (req, res) => {
    const { doctorId } = req.params;
    const { limit = 50, offset = 0, min_rating } = req.query;

    try {
        const params = ['ClinicDoctor', doctorId, parseInt(limit), parseInt(offset)];

        const query = `
            SELECT
                r.review_id,
                r.review_id_uuid,
                r.patient_id,
                r.rating,
                r.comment,
                r.appreciated_aspects,
                r.feedback_suggestions,
                r.is_verified_visit,
                r.created_at,
                u.full_name as author
            FROM reviews r
            JOIN patients p ON r.patient_id = p.patient_id
            JOIN users u ON p.user_id = u.user_id
            WHERE r.target_type = $1 AND r.target_id = $2
            ORDER BY r.created_at DESC
            LIMIT $3 OFFSET $4;
        `;

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM reviews r
            WHERE r.target_type = $1 AND r.target_id = $2;
        `;

        const [reviewsResult, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, ['ClinicDoctor', doctorId])
        ]);

        // Calculate average rating
        const avgQuery = `
            SELECT AVG(rating)::NUMERIC(3,2) as average_rating
            FROM reviews
            WHERE target_type = $1 AND target_id = $2;
        `;
        const avgResult = await db.query(avgQuery, ['ClinicDoctor', doctorId]);

        res.status(200).json({
            total: parseInt(countResult.rows[0].total),
            average_rating: parseFloat(avgResult.rows[0].average_rating) || 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
            reviews: reviewsResult.rows
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            message: 'An error occurred while fetching reviews.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get review statistics for a clinic doctor
 */
exports.getClinicDoctorReviewStats = async (req, res) => {
    const { doctorId } = req.params;

    try {
        const query = `
            SELECT
                COUNT(*) as total_reviews,
                AVG(rating)::NUMERIC(3,2) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
                COUNT(CASE WHEN is_verified_visit = true THEN 1 END) as verified_reviews
            FROM reviews
            WHERE target_type = $1 AND target_id = $2;
        `;
        
        const result = await db.query(query, ['ClinicDoctor', doctorId]);

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error fetching review statistics:', error);
        res.status(500).json({ 
            message: 'An error occurred while fetching review statistics.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Save search history for a patient
 */
exports.saveSearchHistory = async (req, res) => {
    const { userId, userUUID } = req.user;
    const { search_query, search_filters, location_searched, results_count } = req.body;

    try {
        // Get patient_id from user_id or user_id_uuid
        let patientResult;
        if (userUUID) {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1',
                [userUUID]
            );
        } else {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1',
                [userId]
            );
        }
        
        if (patientResult.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Forbidden: Only patients can save search history.' 
            });
        }
        
        const patientId = patientResult.rows[0].patient_id;

        const insertQuery = `
            INSERT INTO search_history (
                patient_id, 
                search_query, 
                search_filters, 
                location_searched, 
                results_count,
                searched_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING search_id;
        `;

        const result = await db.query(insertQuery, [
            patientId,
            search_query,
            search_filters,
            location_searched,
            results_count
        ]);

        res.status(201).json({ 
            message: 'Search history saved.',
            search_id: result.rows[0].search_id
        });

    } catch (error) {
        console.error('Error saving search history:', error);
        res.status(500).json({ 
            message: 'An error occurred while saving search history.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get patient's search history
 */
exports.getSearchHistory = async (req, res) => {
    const { userId, userUUID } = req.user;
    const { limit = 20 } = req.query;

    try {
        // Get patient_id from user_id or user_id_uuid
        let patientResult;
        if (userUUID) {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1',
                [userUUID]
            );
        } else {
            patientResult = await db.query(
                'SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1',
                [userId]
            );
        }
        
        if (patientResult.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Forbidden: Only patients can view search history.' 
            });
        }
        
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT 
                search_id,
                search_query,
                search_filters,
                location_searched,
                results_count,
                searched_at
            FROM search_history
            WHERE patient_id = $1
            ORDER BY searched_at DESC
            LIMIT $2;
        `;

        const result = await db.query(query, [patientId, parseInt(limit)]);

        res.status(200).json({
            count: result.rows.length,
            searches: result.rows
        });

    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).json({ 
            message: 'An error occurred while fetching search history.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};