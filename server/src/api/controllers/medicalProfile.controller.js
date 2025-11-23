// src/api/controllers/medicalProfile.controller.js
const db = require('../../config/db');

/**
 * Get complete medical profile for a patient by patient ID
 * This includes patient details, appointments, consultations, prescriptions, medical records, and reminders
 */
exports.getPatientMedicalProfile = async (req, res) => {
    const { id } = req.params;

    // Validate patient ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false,
            message: 'Valid patient ID is required' 
        });
    }

    const patientId = parseInt(id);

    try {
        // First, verify that the patient exists
        const patientQuery = `
            SELECT 
                p.patient_id,
                p.patient_id_uuid,
                p.user_id,
                p.date_of_birth,
                p.gender,
                p.address,
                p.blood_group,
                p.marital_status,
                p.known_allergies,
                p.chronic_conditions,
                p.current_medications,
                p.lifestyle_notes,
                p.member_since,
                p.patient_code,
                p.current_location,
                p.current_full_address,
                u.full_name,
                u.email,
                u.phone_number
            FROM patients p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.patient_id = $1
        `;
        
        const patientResult = await db.query(patientQuery, [patientId]);
        
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Patient not found' 
            });
        }

        const patient = patientResult.rows[0];

        // Fetch appointments for the patient
        const appointmentsQuery = `
            SELECT 
                a.appointment_id,
                a.appointment_id_uuid,
                a.appointment_time,
                a.status,
                a.appointment_type,
                a.appointment_code,
                a.patient_notes,
                a.scheduled_at,
                a.completed_at,
                a.duration_minutes,
                u.full_name as professional_name,
                prof.specialty
            FROM appointments a
            LEFT JOIN professionals prof ON a.professional_id = prof.professional_id
            LEFT JOIN users u ON prof.user_id = u.user_id
            WHERE a.patient_id = $1
            ORDER BY a.appointment_time DESC
        `;
        
        const appointmentsResult = await db.query(appointmentsQuery, [patientId]);
        const appointments = appointmentsResult.rows;

        // Fetch consultations for the patient's appointments
        const consultationsQuery = `
            SELECT 
                c.consultation_id,
                c.consultation_id_uuid,
                c.appointment_id,
                c.notes,
                c.ai_briefing,
                c.created_at,
                c.diagnosis,
                c.doctor_recommendations,
                c.follow_up_instructions,
                c.prescription_attached
            FROM consultations c
            JOIN appointments a ON c.appointment_id = a.appointment_id
            WHERE a.patient_id = $1
            ORDER BY c.created_at DESC
        `;
        
        const consultationsResult = await db.query(consultationsQuery, [patientId]);
        const consultations = consultationsResult.rows;

        // Fetch prescriptions for the patient
        const prescriptionsQuery = `
            SELECT 
                p.prescription_id,
                p.prescription_id_uuid,
                p.medication_name,
                p.dosage,
                p.instructions,
                p.prescription_code,
                p.frequency,
                p.duration,
                p.medication_category,
                p.doctor_notes,
                p.prescribed_date,
                p.is_active,
                p.doctor_name,
                p.doctor_specialty,
                p.clinic_name,
                p.important_notes,
                c.consultation_id,
                c.notes as consultation_notes
            FROM prescriptions p
            JOIN consultations c ON p.consultation_id = c.consultation_id
            JOIN appointments a ON c.appointment_id = a.appointment_id
            WHERE a.patient_id = $1
            ORDER BY p.prescribed_date DESC
        `;
        
        const prescriptionsResult = await db.query(prescriptionsQuery, [patientId]);
        const prescriptions = prescriptionsResult.rows;

        // Fetch medical records for the patient
        const medicalRecordsQuery = `
            SELECT 
                r.record_id,
                r.record_id_uuid,
                r.document_name,
                r.document_type,
                r.document_url,
                r.uploaded_at,
                r.comments_notes,
                r.report_date,
                r.file_format,
                r.file_size_mb,
                a.appointment_code as linked_appointment_code
            FROM medical_records r
            LEFT JOIN appointments a ON r.linked_appointment_id = a.appointment_id
            WHERE r.patient_id = $1
            ORDER BY r.uploaded_at DESC
        `;
        
        const medicalRecordsResult = await db.query(medicalRecordsQuery, [patientId]);
        const medicalRecords = medicalRecordsResult.rows;

        // Fetch medicine reminders for the patient
        const remindersQuery = `
            SELECT 
                mr.reminder_id,
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
            ORDER BY mr.start_date DESC
        `;
        
        const remindersResult = await db.query(remindersQuery, [patientId]);
        const medicineReminders = remindersResult.rows;

        // Fetch AI chat sessions for the patient
        const aiSessionsQuery = `
            SELECT 
                acs.session_id,
                acs.started_at,
                acs.ended_at,
                acs.session_type,
                acs.session_summary,
                acs.escalated_to_professional,
                acs.crisis_detected,
                acs.crisis_type
            FROM ai_chat_sessions acs
            WHERE acs.patient_id = $1
            ORDER BY acs.started_at DESC
        `;
        
        const aiSessionsResult = await db.query(aiSessionsQuery, [patientId]);
        const aiChatSessions = aiSessionsResult.rows;

        // Compile the complete medical profile
        const medicalProfile = {
            patient: {
                patient_id: patient.patient_id,
                patient_id_uuid: patient.patient_id_uuid,
                user_id: patient.user_id,
                full_name: patient.full_name,
                email: patient.email,
                phone_number: patient.phone_number,
                date_of_birth: patient.date_of_birth,
                gender: patient.gender,
                address: patient.address,
                blood_group: patient.blood_group,
                marital_status: patient.marital_status,
                known_allergies: patient.known_allergies,
                chronic_conditions: patient.chronic_conditions,
                current_medications: patient.current_medications,
                lifestyle_notes: patient.lifestyle_notes,
                member_since: patient.member_since,
                patient_code: patient.patient_code,
                current_location: patient.current_location,
                current_full_address: patient.current_full_address
            },
            appointments: appointments,
            consultations: consultations,
            prescriptions: prescriptions,
            medical_records: medicalRecords,
            medicine_reminders: medicineReminders,
            ai_chat_sessions: aiChatSessions
        };

        res.status(200).json({
            success: true,
            data: medicalProfile
        });

    } catch (error) {
        console.error('Error fetching patient medical profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while fetching the patient medical profile.',
            error: error.message 
        });
    }
};