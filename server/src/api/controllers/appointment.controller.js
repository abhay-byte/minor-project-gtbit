// src/api/controllers/appointment.controller.js
const db = require('../../config/db');

// Creates a new appointment (booking)
const createAppointment = async (req, res) => {
    // userId and role are attached by the authMiddleware
    const { userId, role } = req.user;
    const { slotId } = req.body;

    // Validation: Only patients can book appointments.
    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can book appointments.' });
    }

    if (!slotId) {
        return res.status(400).json({ message: 'A slot ID is required to book an appointment.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Find the patient_id from the user_id
        const patientResult = await client.query('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
        if (patientResult.rows.length === 0) {
            throw new Error('Patient profile not found for the current user.');
        }
        const patientId = patientResult.rows[0].patient_id;

        // Step 2: Lock the slot and get its details to prevent race conditions
        const slotQuery = `
            SELECT professional_id, start_time
            FROM availability_slots
            WHERE slot_id = $1 AND is_booked = false
            FOR UPDATE;
        `;
        const slotResult = await client.query(slotQuery, [slotId]);

        if (slotResult.rows.length === 0) {
            // This means the slot is either already booked or does not exist.
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'This appointment slot is no longer available.' });
        }

        const { professional_id, start_time } = slotResult.rows[0];

        // Step 3: Create the new appointment record
        const appointmentInsertQuery = `
            INSERT INTO appointments (patient_id, professional_id, appointment_time, status, appointment_type, consultation_link)
            VALUES ($1, $2, $3, 'Scheduled'::appointment_status, 'Virtual'::appointment_type_enum, $4)
            RETURNING appointment_id;
        `;
        const consultationLink = `https://meet.clinico.app/${Date.now()}-${slotId}`;
        const appointmentResult = await client.query(appointmentInsertQuery, [patientId, professional_id, start_time, consultationLink]);
        const newAppointmentId = appointmentResult.rows[0].appointment_id;

        // Step 4: Update the availability slot to mark it as booked
        const updateSlotQuery = 'UPDATE availability_slots SET is_booked = true WHERE slot_id = $1;';
        await client.query(updateSlotQuery, [slotId]);

        // If all queries succeed, commit the transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointmentId: newAppointmentId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'An error occurred during the booking process.' });
    } finally {
        client.release();
    }
};

// Fetches appointments for the logged-in user (either patient or professional)
const getMyAppointments = async (req, res) => {
    const { userId, role } = req.user;
    const { status } = req.query; // 'upcoming' or 'past'

    let timeFilter = '';
    if (status === 'upcoming') {
        timeFilter = 'AND a.appointment_time >= NOW()';
    } else if (status === 'past') {
        timeFilter = 'AND a.appointment_time < NOW()';
    }

    try {
        let queryText;
        let queryParams;
        if (role === 'Patient') {
            queryText = `
                SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, prof_user.full_name as professional_name, prof.specialty
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN professionals prof ON a.professional_id = prof.professional_id
                JOIN users prof_user ON prof.user_id = prof_user.user_id
                WHERE p.user_id = $1 ${timeFilter}
                ORDER BY a.appointment_time DESC;
            `;
            queryParams = [userId];
        } else if (role === 'Professional') {
            queryText = `
                SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, p_user.full_name as patient_name
                FROM appointments a
                JOIN professionals prof ON a.professional_id = prof.professional_id
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN users p_user ON p.user_id = p_user.user_id
                WHERE prof.user_id = $1 ${timeFilter}
                ORDER BY a.appointment_time DESC;
            `;
            queryParams = [userId];
        } else {
            // For other roles like NGO or Admin, return an empty array or handle as needed.
            return res.status(200).json([]);
        }

        const result = await db.query(queryText, queryParams);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments
};
