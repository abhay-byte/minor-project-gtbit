// src/api/controllers/__tests__/medicalProfile.controller.test.js
const { getPatientMedicalProfile } = require('../medicalProfile.controller');
const db = require('../../../config/db');

// Mock data for testing
const mockPatient = {
    patient_id: 1,
    patient_id_uuid: '550e8400-e29b-41d4-a716-46655440000',
    user_id: 1,
    date_of_birth: '1990-01-01',
    gender: 'Female',
    address: '123 Main St',
    blood_group: 'O+',
    marital_status: 'Single',
    known_allergies: 'Peanuts',
    chronic_conditions: 'Asthma',
    current_medications: 'Inhaler',
    lifestyle_notes: 'Non-smoker',
    member_since: new Date(),
    patient_code: 'P001',
    current_location: 'New Delhi',
    current_full_address: '123 Main St, New Delhi',
    full_name: 'Test Patient',
    email: 'test.patient@example.com',
    phone_number: '9876543210'
};

const mockAppointments = [
    {
        appointment_id: 1,
        appointment_id_uuid: '550e8400-e29b-41d4-a716-46655440001',
        appointment_time: new Date(),
        status: 'Completed',
        appointment_type: 'Virtual',
        appointment_code: 'A001',
        patient_notes: 'Regular checkup',
        scheduled_at: new Date(),
        completed_at: new Date(),
        duration_minutes: 30,
        professional_name: 'Dr. Test',
        specialty: 'General Physician'
    }
];

const mockConsultations = [
    {
        consultation_id: 1,
        consultation_id_uuid: '50e8400-e29b-41d4-a716-446655440002',
        appointment_id: 1,
        notes: 'Patient is doing well',
        ai_briefing: 'Patient has asthma but well-controlled',
        created_at: new Date(),
        diagnosis: 'Well-controlled asthma',
        doctor_recommendations: 'Continue current medication',
        follow_up_instructions: 'Schedule follow-up in 3 months',
        prescription_attached: true
    }
];

const mockPrescriptions = [
    {
        prescription_id: 1,
        prescription_id_uuid: '550e8400-e29b-41d4-a716-44655440003',
        medication_name: 'Albuterol Inhaler',
        dosage: '90mcg',
        instructions: 'Use as needed for breathing problems',
        prescription_code: 'PR001',
        frequency: 'As needed',
        duration: '3 months',
        medication_category: 'Rescue Inhaler',
        doctor_notes: 'For acute asthma symptoms',
        prescribed_date: new Date(),
        is_active: true,
        doctor_name: 'Dr. Test',
        doctor_specialty: 'General Physician',
        clinic_name: 'Test Clinic',
        important_notes: 'Shake well before use',
        consultation_id: 1,
        consultation_notes: 'Patient is doing well'
    }
];

const mockMedicalRecords = [
    {
        record_id: 1,
        record_id_uuid: '550e8400-e29b-41d4-a716-4466544004',
        document_name: 'Asthma Test Results',
        document_type: 'Lab Report',
        document_url: 'https://example.com/asthma-test.pdf',
        uploaded_at: new Date(),
        comments_notes: 'Recent lung function test',
        report_date: new Date(),
        file_format: 'PDF',
        file_size_mb: 2,
        linked_appointment_code: 'A001'
    }
];

const mockMedicineReminders = [
    {
        reminder_id: '550e8400-e29b-41d4-a716-46655440005',
        medication_name: 'Albuterol Inhaler',
        dosage_form: '1 puff',
        timing_schedule: 'Twice daily',
        how_to_take: 'As needed',
        duration: '3 months',
        doctor_note: 'Use before exercise',
        start_date: new Date(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        is_active: true,
        next_reminder_time: new Date()
    }
];

const mockAiChatSessions = [
    {
        session_id: '550e8400-e29b-41d4-a716-44665540006',
        started_at: new Date(),
        ended_at: new Date(),
        session_type: 'Health Query',
        session_summary: 'Patient asked about asthma management',
        escalated_to_professional: false,
        crisis_detected: false,
        crisis_type: null
    }
];

describe('Medical Profile Controller', () => {
    describe('getPatientMedicalProfile', () => {
        let mockReq, mockRes;

        beforeEach(() => {
            mockReq = {
                params: {},
                user: {}
            };
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });

        it('should return 400 if patient ID is not provided', async () => {
            mockReq.params = { id: 'invalid' };

            await getPatientMedicalProfile(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Valid patient ID is required'
            });
        });

        it('should return 404 if patient is not found', async () => {
            mockReq.params = { id: '999' };
            
            // Mock the database query to return no results
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

            await getPatientMedicalProfile(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Patient not found'
            });
        });

        it('should return complete medical profile for a valid patient', async () => {
            mockReq.params = { id: '1' };
            
            // Mock the database queries to return test data
            jest.spyOn(db, 'query')
                .mockResolvedValueOnce({ rows: [mockPatient] }) // Patient query
                .mockResolvedValueOnce({ rows: mockAppointments }) // Appointments query
                .mockResolvedValueOnce({ rows: mockConsultations }) // Consultations query
                .mockResolvedValueOnce({ rows: mockPrescriptions }) // Prescriptions query
                .mockResolvedValueOnce({ rows: mockMedicalRecords }) // Medical records query
                .mockResolvedValueOnce({ rows: mockMedicineReminders }) // Medicine reminders query
                .mockResolvedValueOnce({ rows: mockAiChatSessions }); // AI chat sessions query

            await getPatientMedicalProfile(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    patient: {
                        patient_id: mockPatient.patient_id,
                        patient_id_uuid: mockPatient.patient_id_uuid,
                        user_id: mockPatient.user_id,
                        full_name: mockPatient.full_name,
                        email: mockPatient.email,
                        phone_number: mockPatient.phone_number,
                        date_of_birth: mockPatient.date_of_birth,
                        gender: mockPatient.gender,
                        address: mockPatient.address,
                        blood_group: mockPatient.blood_group,
                        marital_status: mockPatient.marital_status,
                        known_allergies: mockPatient.known_allergies,
                        chronic_conditions: mockPatient.chronic_conditions,
                        current_medications: mockPatient.current_medications,
                        lifestyle_notes: mockPatient.lifestyle_notes,
                        member_since: mockPatient.member_since,
                        patient_code: mockPatient.patient_code,
                        current_location: mockPatient.current_location,
                        current_full_address: mockPatient.current_full_address
                    },
                    appointments: mockAppointments,
                    consultations: mockConsultations,
                    prescriptions: mockPrescriptions,
                    medical_records: mockMedicalRecords,
                    medicine_reminders: mockMedicineReminders,
                    ai_chat_sessions: mockAiChatSessions
                })
            });
        });

        it('should handle database errors gracefully', async () => {
            mockReq.params = { id: '1' };
            
            // Mock the database to throw an error
            jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('Database error'));

            await getPatientMedicalProfile(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred while fetching the patient medical profile.',
                error: 'Database error'
            });
        });
    });
});