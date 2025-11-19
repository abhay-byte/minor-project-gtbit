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

// Creates recurring availability slots for a professional based on provided parameters
const createBatchAvailability = async (req, res) => {
    const { days_of_week, start_time, end_time, slot_duration_minutes } = req.body;

    // Validate request body
    if (!days_of_week || !Array.isArray(days_of_week) || days_of_week.length === 0) {
        return res.status(400).json({ 
            success: false,
            error: 'days_of_week is required and must be a non-empty array' 
        });
    }

    if (!start_time || !end_time) {
        return res.status(400).json({ 
            success: false,
            error: 'start_time and end_time are required' 
        });
    }

    if (!slot_duration_minutes || typeof slot_duration_minutes !== 'number' || slot_duration_minutes <= 0) {
        return res.status(400).json({ 
            success: false,
            error: 'slot_duration_minutes is required and must be a positive number' 
        });
    }

    // Validate day names
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days_of_week) {
        if (!validDays.includes(day)) {
            return res.status(400).json({ 
                success: false,
                error: `Invalid day of week: ${day}. Must be one of: ${validDays.join(', ')}` 
            });
        }
    }

    // Validate time format (HH:MM:SS)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({ 
            success: false,
            error: 'start_time and end_time must be in HH:MM:SS format' 
        });
    }

    // Parse start and end times
    const [startHour, startMinute, startSecond] = start_time.split(':').map(Number);
    const [endHour, endMinute, endSecond] = end_time.split(':').map(Number);

    // Calculate total minutes for validation
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    if (startTimeInMinutes >= endTimeInMinutes) {
        return res.status(400).json({ 
            success: false,
            error: 'start_time must be before end_time' 
        });
    }

    if (slot_duration_minutes <= 0 || slot_duration_minutes > 1440) { // 1440 = 24 hours in minutes
        return res.status(400).json({ 
            success: false,
            error: 'slot_duration_minutes must be a positive number not exceeding 1440 (24 hours)' 
        });
    }

    try {
        // Get the professional ID from the authenticated user
        const profQuery = 'SELECT professional_id FROM professionals WHERE user_id = $1';
        const profResult = await db.query(profQuery, [req.user.userId]);
        
        if (profResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Professional profile not found for this user.' 
            });
        }

        const professionalId = profResult.rows[0].professional_id;

        // Calculate slots for the next 4 weeks (28 days)
        const slotsCreated = [];
        const today = new Date();
        const fourWeeksFromNow = new Date();
        fourWeeksFromNow.setDate(today.getDate() + 28);

        // Generate dates for the next 4 weeks that match the requested days of the week
        const targetDates = [];
        const currentDate = new Date(today);
        currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

        while (currentDate <= fourWeeksFromNow) {
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            if (days_of_week.includes(dayOfWeek)) {
                targetDates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Begin database transaction
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // For each target date, generate time slots
            for (const date of targetDates) {
                // Set the date with the start time
                const slotDate = new Date(date);
                slotDate.setHours(startHour, startMinute, startSecond, 0);

                // Calculate end time for this date
                const dayEndTime = new Date(date);
                dayEndTime.setHours(endHour, endMinute, endSecond, 0);

                // Generate slots for the day
                while (slotDate < dayEndTime) {
                    // Calculate end time for this specific slot
                    const slotEndTime = new Date(slotDate);
                    slotEndTime.setMinutes(slotDate.getMinutes() + slot_duration_minutes);

                    // Check if this slot extends beyond the day's end time
                    if (slotEndTime > dayEndTime) {
                        break;
                    }

                    // Insert the availability slot
                    const insertQuery = `
                        INSERT INTO availability_slots (professional_id, start_time, end_time, is_booked, slot_date)
                        VALUES ($1, $2, $3, FALSE, $4)
                        RETURNING slot_id
                    `;
                    
                    const result = await client.query(insertQuery, [
                        professionalId,
                        slotDate,
                        slotEndTime,
                        date.toISOString().split('T')[0] // The date part only in YYYY-MM-DD format
                    ]);
                    
                    if (result.rows.length > 0) {
                        slotsCreated.push(result.rows[0].slot_id);
                    }

                    // Move to next slot
                    slotDate.setMinutes(slotDate.getMinutes() + slot_duration_minutes);
                }
            }

            // Commit transaction
            await client.query('COMMIT');
            client.release();

            res.status(200).json({
                success: true,
                message: 'Slots generated successfully',
                slots_created: slotsCreated.length
            });
        } catch (error) {
            // Rollback transaction in case of error
            await client.query('ROLLBACK');
            client.release();
            throw error;
        }
    } catch (error) {
        console.error('Error creating batch availability:', error);
        res.status(500).json({ 
            success: false,
            error: 'An error occurred while creating batch availability.' 
        });
    }
};

// Gets complete profile information for a specific doctor by ID
const getDoctorProfile = async (req, res) => {
    const { id } = req.params;

    // Validate the doctor ID parameter
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ 
            success: false,
            message: 'Valid doctor ID is required.' 
        });
    }

    try {
        // Query to fetch comprehensive doctor profile information
        const query = `
            SELECT 
                p.professional_id,
                u.full_name,
                u.email,
                u.phone_number,
                p.specialty,
                p.credentials,
                p.years_of_experience,
                p.verification_status,
                p.rating,
                p.total_reviews,
                p.patients_treated,
                p.languages_spoken,
                p.working_hours,
                p.is_volunteer,
                -- Get average rating from reviews
                (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE target_id = p.professional_id AND target_type = 'Professional') as avg_rating,
                -- Get total number of reviews
                (SELECT COUNT(*) FROM reviews WHERE target_id = p.professional_id AND target_type = 'Professional') as total_review_count,
                -- Get upcoming appointments count for this doctor
                (SELECT COUNT(*) FROM appointments WHERE professional_id = p.professional_id AND appointment_time > NOW() AND status != 'Cancelled') as upcoming_appointments_count,
                -- Get today's appointments count
                (SELECT COUNT(*) FROM appointments WHERE professional_id = p.professional_id AND appointment_time::DATE = CURRENT_DATE AND status != 'Cancelled') as today_appointments_count,
                -- Get consultation statistics
                (SELECT COUNT(*) FROM appointments WHERE professional_id = p.professional_id AND status = 'Completed') as completed_appointments_count,
                -- Get availability information (slots for next 7 days)
                (SELECT json_agg(json_build_object(
                    'slot_id', slot_id,
                    'start_time', start_time,
                    'end_time', end_time,
                    'is_booked', is_booked,
                    'slot_date', slot_date
                )) FROM availability_slots WHERE professional_id = p.professional_id AND slot_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' LIMIT 10) as availability_slots
            FROM professionals p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.professional_id = $1;
        `;

        const result = await db.query(query, [parseInt(id)]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Doctor profile not found.' 
            });
        }

        const doctorProfile = result.rows[0];

        // Format the response to include comprehensive doctor information
        const profileResponse = {
            doctor: {
                id: doctorProfile.professional_id,
                full_name: doctorProfile.full_name,
                email: doctorProfile.email,
                phone_number: doctorProfile.phone_number,
                specialty: doctorProfile.specialty,
                credentials: doctorProfile.credentials,
                years_of_experience: doctorProfile.years_of_experience,
                verification_status: doctorProfile.verification_status,
                is_volunteer: doctorProfile.is_volunteer,
                languages_spoken: doctorProfile.languages_spoken ? doctorProfile.languages_spoken.split(',') : [],
                working_hours: doctorProfile.working_hours,
                // Rating information
                rating: parseFloat(doctorProfile.avg_rating || 0),
                total_reviews: parseInt(doctorProfile.total_review_count || 0),
                patients_treated: doctorProfile.patients_treated,
                // Statistics
                completed_appointments: parseInt(doctorProfile.completed_appointments_count || 0),
                upcoming_appointments: parseInt(doctorProfile.upcoming_appointments_count || 0),
                today_appointments: parseInt(doctorProfile.today_appointments_count || 0),
                // Availability
                availability: doctorProfile.availability_slots || []
            }
        };

        res.status(200).json({
            success: true,
            data: profileResponse
        });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while fetching doctor profile.' 
        });
    }
};

module.exports = {
    getAllProfessionals,
    getProfessionalAvailability,
    getProfessionalDashboard,
    createOrUpdateProfessionalProfile,
    createBatchAvailability,
    getDoctorProfile
};
