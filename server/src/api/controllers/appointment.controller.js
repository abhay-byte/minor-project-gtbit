// src/api/controllers/appointment.controller.js
const db = require('../../config/db');

// Creates a new appointment (booking)
const createAppointment = async (req, res) => {
    // userId and role are attached by the authMiddleware
    const { userId, userUUID, role } = req.user;
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

        // Step 1: Find the patient_id from the user_id or user_id_uuid
        let patientResult;
        if (userUUID) {
            patientResult = await client.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await client.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
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
        const { appointmentCode, patientNotes, durationMinutes } = req.body;
        const appointmentInsertQuery = `
            INSERT INTO appointments (patient_id, professional_id, appointment_time, status, appointment_type, consultation_link, appointment_code, patient_notes, duration_minutes)
            VALUES ($1, $2, $3, 'Scheduled'::appointment_status, 'Virtual'::appointment_type_enum, $4, $5, $6, $7)
            RETURNING appointment_id;
        `;
        const consultationLink = `https://meet.clinico.app/${Date.now()}-${slotId}`;
        const appointmentResult = await client.query(appointmentInsertQuery, [patientId, professional_id, start_time, consultationLink, appointmentCode || null, patientNotes || null, durationMinutes || null]);
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
    const { userId, userUUID, role } = req.user;
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
            if (userUUID) {
                queryText = `
                    SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, a.appointment_code, a.patient_notes, a.scheduled_at, a.completed_at, a.duration_minutes, prof_user.full_name as professional_name, prof.specialty
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    JOIN professionals prof ON a.professional_id = prof.professional_id
                    JOIN users prof_user ON prof.user_id = prof_user.user_id
                    WHERE p.user_id_uuid = $1 ${timeFilter}
                    ORDER BY a.appointment_time DESC;
                `;
                queryParams = [userUUID];
            } else {
                queryText = `
                    SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, a.appointment_code, a.patient_notes, a.scheduled_at, a.completed_at, a.duration_minutes, prof_user.full_name as professional_name, prof.specialty
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    JOIN professionals prof ON a.professional_id = prof.professional_id
                    JOIN users prof_user ON prof.user_id = prof_user.user_id
                    WHERE p.user_id = $1 ${timeFilter}
                    ORDER BY a.appointment_time DESC;
                `;
                queryParams = [userId];
            }
        } else if (role === 'Professional') {
            if (userUUID) {
                queryText = `
                    SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, a.appointment_code, a.patient_notes, a.scheduled_at, a.completed_at, a.duration_minutes, p_user.full_name as patient_name
                    FROM appointments a
                    JOIN professionals prof ON a.professional_id = prof.professional_id
                    JOIN patients p ON a.patient_id = p.patient_id
                    JOIN users p_user ON p.user_id = p_user.user_id
                    WHERE prof.user_id_uuid = $1 ${timeFilter}
                    ORDER BY a.appointment_time DESC;
                `;
                queryParams = [userUUID];
            } else {
                queryText = `
                    SELECT a.appointment_id, a.appointment_time, a.status, a.appointment_type, a.appointment_code, a.patient_notes, a.scheduled_at, a.completed_at, a.duration_minutes, p_user.full_name as patient_name
                    FROM appointments a
                    JOIN professionals prof ON a.professional_id = prof.professional_id
                    JOIN patients p ON a.patient_id = p.patient_id
                    JOIN users p_user ON p.user_id = p_user.user_id
                    WHERE prof.user_id = $1 ${timeFilter}
                    ORDER BY a.appointment_time DESC;
                `;
                queryParams = [userId];
            }
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

// Cancel an appointment
const cancelAppointment = async (req, res) => {
    const { userId, userUUID, role } = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    // Validate appointment ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Valid appointment ID is required' });
    }

    const appointmentId = parseInt(id);

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Get the appointment details to check ownership and status
        let appointmentQuery;
        let appointmentParams;
        
        if (userUUID) {
            if (role === 'Patient') {
                // Patient request - only return appointments belonging to this patient
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    WHERE a.appointment_id = $1 AND p.user_id_uuid = $2
                `;
                appointmentParams = [appointmentId, userUUID];
            } else if (role === 'Professional') {
                // Professional request - only return appointments assigned to this professional
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    WHERE a.appointment_id = $1 AND a.professional_id IN (
                        SELECT professional_id FROM professionals WHERE user_id_uuid = $2
                    )
                `;
                appointmentParams = [appointmentId, userUUID];
            } else {
                // Other roles - restrict appropriately
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    WHERE a.appointment_id = $1 AND p.user_id_uuid = $2
                `;
                appointmentParams = [appointmentId, userUUID];
            }
        } else {
            if (role === 'Patient') {
                // Patient request - only return appointments belonging to this patient
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    WHERE a.appointment_id = $1 AND p.user_id = $2
                `;
                appointmentParams = [appointmentId, userId];
            } else if (role === 'Professional') {
                // Professional request - only return appointments assigned to this professional
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    WHERE a.appointment_id = $1 AND a.professional_id IN (
                        SELECT professional_id FROM professionals WHERE user_id = $2
                    )
                `;
                appointmentParams = [appointmentId, userId];
            } else {
                // Other roles - restrict appropriately
                appointmentQuery = `
                    SELECT a.appointment_id, a.appointment_id_uuid, a.patient_id, a.professional_id, a.status, a.appointment_time
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.patient_id
                    WHERE a.appointment_id = $1 AND p.user_id = $2
                `;
                appointmentParams = [appointmentId, userId];
            }
        }

        const appointmentResult = await client.query(appointmentQuery, appointmentParams);
        
        if (appointmentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = appointmentResult.rows[0];

        // Check if appointment is already cancelled or completed
        if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Appointment is already cancelled or completed' });
        }

        // Update appointment status to 'Cancelled'
        const updateAppointmentQuery = `
            UPDATE appointments
            SET status = 'Cancelled'::appointment_status
            WHERE appointment_id = $1
            RETURNING appointment_id, appointment_id_uuid, status
        `;
        const updateResult = await client.query(updateAppointmentQuery, [appointmentId]);
        
        // Check if the update affected any rows
        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Appointment not found or could not be updated' });
        }
        
        const updatedAppointment = updateResult.rows[0];
        
        // Commit the transaction
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment: {
                appointment_id: updatedAppointment.appointment_id,
                appointment_id_uuid: updatedAppointment.appointment_id_uuid,
                status: updatedAppointment.status,
                cancelled_at: new Date().toISOString(),  // Adding current time for response
                cancellation_reason: reason || null,
                slot_released: false  // Skipping slot release for stability
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'An error occurred while cancelling the appointment' });
    } finally {
        client.release();
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    cancelAppointment
};
