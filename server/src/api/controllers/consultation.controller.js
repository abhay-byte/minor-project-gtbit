const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

const createConsultation = async (req, res, next) => {
  try {
    const { appointment_id, diagnosis, doctor_recommendations, follow_up_instructions, notes, ai_briefing } = req.body;

    // Validate required fields
    if (!appointment_id || !diagnosis || !doctor_recommendations) {
      return res.status(400).json({
        error: 'Appointment ID, diagnosis, and doctor recommendations are required'
      });
    }

    // Check if appointment exists and belongs to the professional
    const appointmentQuery = `
      SELECT a.*, u.user_id as professional_id 
      FROM appointments a 
      JOIN professionals p ON p.professional_id = a.professional_id 
      JOIN users u ON u.user_id = p.user_id 
      WHERE a.appointment_id = $1 AND u.user_id = $2
    `;
    const appointmentResult = await db.query(appointmentQuery, [appointment_id, req.user.userId]);

    if (appointmentResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Appointment not found or not completed'
      });
    }

    const appointment = appointmentResult.rows[0];

    // Check if a consultation already exists for this appointment
    const existingConsultationQuery = 'SELECT consultation_id FROM consultations WHERE appointment_id = $1';
    const existingConsultationResult = await db.query(existingConsultationQuery, [appointment_id]);

    if (existingConsultationResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Consultation record already exists for this appointment'
      });
    }

    // Create the consultation record
    const consultationQuery = `
      INSERT INTO consultations (
        consultation_id_uuid, 
        appointment_id, 
        appointment_id_uuid, 
        notes, 
        ai_briefing, 
        diagnosis, 
        doctor_recommendations, 
        follow_up_instructions,
        prescription_attached
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const consultationResult = await db.query(consultationQuery, [
      uuidv4(),
      appointment_id,
      appointment.appointment_id_uuid,
      notes || null,
      ai_briefing || null,
      diagnosis,
      doctor_recommendations,
      follow_up_instructions || null,
      false // Initially no prescription attached
    ]);

    const consultation = consultationResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Consultation record created successfully',
      consultation: {
        consultation_id: consultation.consultation_id,
        consultation_id_uuid: consultation.consultation_id_uuid,
        appointment_id: consultation.appointment_id,
        diagnosis: consultation.diagnosis,
        doctor_recommendations: consultation.doctor_recommendations,
        follow_up_instructions: consultation.follow_up_instructions,
        notes: consultation.notes,
        prescription_attached: consultation.prescription_attached,
        created_at: consultation.created_at
      }
    });

  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: error.message });
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const { 
      consultation_id, 
      medication_name, 
      dosage, 
      frequency, 
      duration, 
      medication_category, 
      instructions, 
      doctor_notes, 
      important_notes 
    } = req.body;

    // Validate required fields
    if (!consultation_id || !medication_name || !dosage || !frequency || !duration || !instructions) {
      return res.status(400).json({
        error: 'Consultation ID, medication name, dosage, frequency, duration, and instructions are required'
      });
    }

    // Check if consultation exists and belongs to the professional's patient
    const consultationQuery = `
      SELECT c.*, a.professional_id, p.user_id as professional_user_id
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.appointment_id
      JOIN professionals p ON a.professional_id = p.professional_id
      WHERE c.consultation_id = $1 AND p.user_id = $2
    `;
    const consultationResult = await db.query(consultationQuery, [consultation_id, req.user.userId]);

    if (consultationResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Consultation not found'
      });
    }

    const consultation = consultationResult.rows[0];

    // Get professional details to include in the prescription
    const professionalQuery = `
      SELECT full_name, specialty
      FROM professionals p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = $1
    `;
    const professionalResult = await db.query(professionalQuery, [req.user.userId]);
    const professional = professionalResult.rows[0];

    // Create the prescription record
    const prescriptionQuery = `
      INSERT INTO prescriptions (
        prescription_id_uuid,
        consultation_id,
        consultation_id_uuid,
        medication_name,
        dosage,
        instructions,
        prescription_code,
        frequency,
        duration,
        medication_category,
        doctor_notes,
        prescribed_date,
        is_active,
        prescribed_by_doctor_id,
        doctor_name,
        doctor_specialty,
        important_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const prescriptionResult = await db.query(prescriptionQuery, [
      uuidv4(),
      consultation_id,
      consultation.consultation_id_uuid,
      medication_name,
      dosage,
      instructions,
      `PRE-${Date.now()}`, // Generate prescription code
      frequency,
      duration,
      medication_category || null,
      doctor_notes || null,
      new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      true, // is_active
      req.user.userId,
      professional.full_name,
      professional.specialty,
      important_notes || null
    ]);

    const prescription = prescriptionResult.rows[0];

    // Update the consultation to indicate that a prescription is attached
    await db.query(
      'UPDATE consultations SET prescription_attached = true WHERE consultation_id = $1',
      [consultation_id]
    );

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: {
        prescription_id: prescription.prescription_id,
        prescription_id_uuid: prescription.prescription_id_uuid,
        consultation_id: prescription.consultation_id,
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        medication_category: prescription.medication_category,
        doctor_notes: prescription.doctor_notes,
        important_notes: prescription.important_notes,
        prescribed_date: prescription.prescribed_date,
        is_active: prescription.is_active,
        prescribed_by_doctor_id: prescription.prescribed_by_doctor_id,
        doctor_name: prescription.doctor_name,
        doctor_specialty: prescription.doctor_specialty
      }
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: error.message });
  }
};

const requestLabReportUpload = async (req, res, next) => {
  try {
    const { patient_id, consultation_id, requested_tests, due_date, additional_notes } = req.body;

    // Validate required fields
    if (!patient_id || !consultation_id || !requested_tests || !due_date) {
      return res.status(400).json({
        error: 'Patient ID, consultation ID, requested tests, and due date are required'
      });
    }

    // Validate due date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      return res.status(400).json({
        error: 'Invalid due date format. Use YYYY-MM-DD'
      });
    }

    // Check if patient exists
    const patientQuery = 'SELECT patient_id FROM patients WHERE patient_id = $1';
    const patientResult = await db.query(patientQuery, [patient_id]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    // Check if consultation exists and belongs to the professional's patient
    const consultationQuery = `
      SELECT c.*, a.professional_id, p.user_id as professional_user_id
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.appointment_id
      JOIN professionals p ON a.professional_id = p.professional_id
      WHERE c.consultation_id = $1 AND p.user_id = $2
    `;
    const consultationResult = await db.query(consultationQuery, [consultation_id, req.user.userId]);

    if (consultationResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Consultation not found or not accessible'
      });
    }

    // Generate request code
    const requestCode = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the upload report request
    const requestQuery = `
      INSERT INTO upload_report_requests (
        request_id,
        patient_id,
        professional_id,
        request_code,
        requested_tests,
        due_date,
        additional_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const requestResult = await db.query(requestQuery, [
      uuidv4(),
      patient_id,
      req.user.userId, // professional_id
      requestCode,
      requested_tests,
      due_date,
      additional_notes || null
    ]);

    const request = requestResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Report request sent to patient',
      request: {
        request_id: request.request_id,
        request_code: request.request_code,
        patient_id: request.patient_id,
        professional_id: request.professional_id,
        requested_tests: request.requested_tests,
        due_date: request.due_date,
        status: request.status,
        additional_notes: request.additional_notes,
        created_at: request.created_at
      }
    });

 } catch (error) {
    console.error('Error requesting lab report upload:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createConsultation,
  createPrescription,
  requestLabReportUpload
};