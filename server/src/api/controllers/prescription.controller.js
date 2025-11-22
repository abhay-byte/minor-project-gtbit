// src/api/controllers/prescription.controller.js
const db = require('../../config/db');

/**
 * Get all prescriptions for the logged-in patient
 */
exports.getMyPrescriptions = async (req, res) => {
    const { userId, userUUID, role } = req.user;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view prescriptions.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT
                p.prescription_id,
                p.prescription_code,
                p.medication_name,
                p.dosage,
                p.frequency,
                p.duration,
                p.medication_category,
                p.doctor_notes,
                p.prescribed_date,
                p.is_active,
                p.prescribed_by_doctor_id,
                p.doctor_name,
                p.doctor_specialty,
                p.clinic_name,
                p.important_notes
            FROM prescriptions p
            JOIN consultations c ON p.consultation_id = c.consultation_id
            JOIN appointments a ON c.appointment_id = a.appointment_id
            WHERE a.patient_id = $1
            ORDER BY p.prescribed_date DESC;
        `;

        const result = await db.query(query, [patientId]);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'An error occurred while fetching prescriptions.', error: error.message });
    }
};

/**
 * Get a specific prescription by ID
 */
exports.getPrescriptionById = async (req, res) => {
    const { userId, userUUID, role } = req.user;
    const { prescriptionId } = req.params;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view prescriptions.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT
                p.prescription_id,
                p.prescription_code,
                p.medication_name,
                p.dosage,
                p.frequency,
                p.duration,
                p.medication_category,
                p.doctor_notes,
                p.prescribed_date,
                p.is_active,
                p.prescribed_by_doctor_id,
                p.doctor_name,
                p.doctor_specialty,
                p.clinic_name,
                p.important_notes
            FROM prescriptions p
            JOIN consultations c ON p.consultation_id = c.consultation_id
            JOIN appointments a ON c.appointment_id = a.appointment_id
            WHERE p.prescription_id = $1 AND a.patient_id = $2
        `;

        const result = await db.query(query, [prescriptionId, patientId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found.' });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error fetching prescription:', error);
        res.status(500).json({ message: 'An error occurred while fetching prescription.', error: error.message });
    }
};

/**
 * Get prescription list for the logged-in patient
 */
exports.getPrescriptionList = async (req, res) => {
    const { userId, userUUID, role } = req.user;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view prescription lists.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT
                pl.list_id,
                pl.prescription_id,
                pl.condition_treated,
                pl.medicines_count,
                pl.next_followup,
                pl.prescription_status,
                pl.last_viewed,
                p.medication_name,
                p.dosage,
                p.frequency
            FROM prescription_list pl
            JOIN prescriptions p ON pl.prescription_id = p.prescription_id
            WHERE pl.patient_id = $1
            ORDER BY pl.list_id DESC;
        `;

        const result = await db.query(query, [patientId]);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching prescription list:', error);
        res.status(500).json({ message: 'An error occurred while fetching prescription list.', error: error.message });
    }
};

/**
 * Get medicine reminders for the logged-in patient
 */
exports.getMedicineReminders = async (req, res) => {
    const { userId, userUUID, role } = req.user;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view medicine reminders.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT
                mr.reminder_id,
                mr.prescription_id,
                mr.medication_name,
                mr.dosage_form,
                mr.timing_schedule,
                mr.how_to_take,
                mr.duration,
                mr.doctor_note,
                mr.start_date,
                mr.end_date,
                mr.is_active,
                mr.next_reminder_time
            FROM medicine_reminders mr
            WHERE mr.patient_id = $1
            ORDER BY mr.reminder_id DESC;
        `;

        const result = await db.query(query, [patientId]);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching medicine reminders:', error);
        res.status(500).json({ message: 'An error occurred while fetching medicine reminders.', error: error.message });
    }
};

/**
 * Get reminder logs for a specific medicine reminder
 */
exports.getReminderLogs = async (req, res) => {
    const { userId, userUUID, role } = req.user;
    const { reminderId } = req.params;

    if (role !== 'Patient') {
        return res.status(403).json({ message: 'Forbidden: Only patients can view reminder logs.' });
    }

    try {
        let patientResult;
        if (userUUID) {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1', [userUUID]);
        } else {
            patientResult = await db.query('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id = $1', [userId]);
        }
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        const patientId = patientResult.rows[0].patient_id;

        const query = `
            SELECT
                rl.log_id,
                rl.scheduled_time,
                rl.taken_time,
                rl.status,
                rl.notes,
                rl.scheduled_time as created_at
            FROM reminder_logs rl
            JOIN medicine_reminders mr ON rl.reminder_id = mr.reminder_id
            WHERE mr.patient_id = $1 AND rl.reminder_id = $2
            ORDER BY rl.scheduled_time DESC;
        `;

        const result = await db.query(query, [patientId, reminderId]);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching reminder logs:', error);
        res.status(500).json({ message: 'An error occurred while fetching reminder logs.', error: error.message });
    }
};