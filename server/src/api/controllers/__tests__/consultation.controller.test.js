const { createConsultation, createPrescription, requestLabReportUpload } = require('../consultation.controller');
const db = require('../../../config/db');

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

describe('Consultation Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { userId: 1, role: 'Professional' },
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('createConsultation', () => {
    it('should create a consultation successfully', async () => {
      mockReq.body = {
        appointment_id: 102,
        diagnosis: 'Acute Bronchitis',
        doctor_recommendations: 'Steam inhalation, rest.',
        follow_up_instructions: 'Visit again if fever persists > 3 days.',
        notes: 'Patient presented with dry cough.',
        ai_briefing: 'AI summary of patient condition'
      };

      // Mock database queries
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ professional_id: 1, appointment_id_uuid: 'appointment-uuid' }] }) // appointment check
        .mockResolvedValueOnce({ rows: [] }) // check for existing consultation
        .mockResolvedValueOnce({ rows: [{ 
          consultation_id: 205,
          consultation_id_uuid: 'mock-uuid',
          appointment_id: 102,
          diagnosis: 'Acute Bronchitis',
          doctor_recommendations: 'Steam inhalation, rest.',
          follow_up_instructions: 'Visit again if fever persists > 3 days.',
          notes: 'Patient presented with dry cough.',
          prescription_attached: false,
          created_at: '2025-11-19T10:30:00Z'
        }] }); // insert consultation

      await createConsultation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Consultation record created successfully',
        consultation: {
          consultation_id: 205,
          consultation_id_uuid: 'mock-uuid',
          appointment_id: 102,
          diagnosis: 'Acute Bronchitis',
          doctor_recommendations: 'Steam inhalation, rest.',
          follow_up_instructions: 'Visit again if fever persists > 3 days.',
          notes: 'Patient presented with dry cough.',
          prescription_attached: false,
          created_at: '2025-11-19T10:30:00Z'
        }
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        appointment_id: 102,
        diagnosis: 'Acute Bronchitis'
        // Missing doctor_recommendations
      };

      await createConsultation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Appointment ID, diagnosis, and doctor recommendations are required'
      });
    });

    it('should return 400 if appointment not found', async () => {
      mockReq.body = {
        appointment_id: 102,
        diagnosis: 'Acute Bronchitis',
        doctor_recommendations: 'Steam inhalation, rest.'
      };

      // Mock appointment not found
      db.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      await createConsultation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Appointment not found or not completed'
      });
    });

    it('should return 409 if consultation already exists', async () => {
      mockReq.body = {
        appointment_id: 102,
        diagnosis: 'Acute Bronchitis',
        doctor_recommendations: 'Steam inhalation, rest.'
      };

      // Mock appointment found but consultation exists
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ professional_id: 1, appointment_id_uuid: 'appointment-uuid' }] }) // appointment check
        .mockResolvedValueOnce({ rows: [{ consultation_id: 1 }] }); // existing consultation

      await createConsultation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Consultation record already exists for this appointment'
      });
    });
  });

  describe('createPrescription', () => {
    it('should create a prescription successfully', async () => {
      mockReq.body = {
        consultation_id: 205,
        medication_name: 'Azithromycin',
        dosage: '500mg',
        frequency: 'Once daily',
        duration: '5 days',
        instructions: 'Take with food',
        medication_category: 'Antibiotic',
        doctor_notes: 'Complete the full course',
        important_notes: 'May cause slight drowsiness'
      };

      // Mock database queries
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ consultation_id: 205, consultation_id_uuid: 'consultation-uuid', appointment_id: 1, professional_id: 1 }] }) // consultation check
        .mockResolvedValueOnce({ rows: [{ full_name: 'Dr. Smith', specialty: 'General Physician' }] }) // professional details
        .mockResolvedValueOnce({ rows: [{ 
          prescription_id: 301,
          prescription_id_uuid: 'mock-uuid',
          consultation_id: 205,
          medication_name: 'Azithromycin',
          dosage: '500mg',
          instructions: 'Take with food',
          prescription_code: 'PRESCRIPTION-123456',
          frequency: 'Once daily',
          duration: '5 days',
          medication_category: 'Antibiotic',
          doctor_notes: 'Complete the full course',
          prescribed_date: '2025-1-19',
          is_active: true,
          prescribed_by_doctor_id: 1,
          doctor_name: 'Dr. Smith',
          doctor_specialty: 'General Physician',
          important_notes: 'May cause slight drowsiness'
        }] }); // insert prescription

      await createPrescription(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Prescription created successfully',
        prescription: {
          prescription_id: 301,
          prescription_id_uuid: 'mock-uuid',
          consultation_id: 205,
          medication_name: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '5 days',
          medication_category: 'Antibiotic',
          doctor_notes: 'Complete the full course',
          important_notes: 'May cause slight drowsiness',
          prescribed_date: '2025-1-19',
          is_active: true,
          prescribed_by_doctor_id: 1,
          doctor_name: 'Dr. Smith',
          doctor_specialty: 'General Physician'
        }
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        consultation_id: 205,
        medication_name: 'Azithromycin',
        dosage: '500mg'
        // Missing required fields
      };

      await createPrescription(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Consultation ID, medication name, dosage, frequency, duration, and instructions are required'
      });
    });

    it('should return 400 if consultation not found', async () => {
      mockReq.body = {
        consultation_id: 205,
        medication_name: 'Azithromycin',
        dosage: '500mg',
        frequency: 'Once daily',
        duration: '5 days',
        instructions: 'Take with food'
      };

      // Mock consultation not found
      db.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      await createPrescription(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Consultation not found'
      });
    });
  });

  describe('requestLabReportUpload', () => {
    it('should create a lab report request successfully', async () => {
      mockReq.body = {
        patient_id: 5,
        consultation_id: 205,
        requested_tests: 'CBC, Lipid Profile, HbA1c',
        due_date: '2025-11-25',
        additional_notes: 'Fasting required for 12 hours before test'
      };

      // Mock database queries
      db.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ patient_id: 55 }] }) // patient check
        .mockResolvedValueOnce({ rows: [{ consultation_id: 205, appointment_id: 1, professional_id: 1 }] }) // consultation check
        .mockResolvedValueOnce({ rows: [{ 
          request_id: 'mock-uuid',
          request_code: 'REQ-2025-1234',
          patient_id: 55,
          professional_id: 1,
          requested_tests: 'CBC, Lipid Profile, HbA1c',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required for 12 hours before test',
          created_at: '2025-11-19T10:30:00Z'
        }] }); // insert request

      await requestLabReportUpload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Report request sent to patient',
        request: {
          request_id: 'mock-uuid',
          request_code: 'REQ-2025-1234',
          patient_id: 55,
          professional_id: 1,
          requested_tests: 'CBC, Lipid Profile, HbA1c',
          due_date: '2025-11-25',
          status: 'Pending',
          additional_notes: 'Fasting required for 12 hours before test',
          created_at: '2025-11-19T10:30:00Z'
        }
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        patient_id: 55,
        consultation_id: 205
        // Missing required fields
      };

      await requestLabReportUpload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Patient ID, consultation ID, requested tests, and due date are required'
      });
    });

    it('should return 400 if due date format is invalid', async () => {
      mockReq.body = {
        patient_id: 55,
        consultation_id: 205,
        requested_tests: 'CBC, Lipid Profile, HbA1c',
        due_date: 'invalid-date-format',
        additional_notes: 'Fasting required for 12 hours before test'
      };

      await requestLabReportUpload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid due date format. Use YYYY-MM-DD'
      });
    });

    it('should return 404 if patient not found', async () => {
      mockReq.body = {
        patient_id: 55,
        consultation_id: 205,
        requested_tests: 'CBC, Lipid Profile, HbA1c',
        due_date: '2025-11-25',
        additional_notes: 'Fasting required for 12 hours before test'
      };

      // Mock patient not found
      db.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      await requestLabReportUpload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Patient not found'
      });
    });
 });
});