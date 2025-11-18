// src/api/controllers/__tests__/prescription.controller.test.js
const {
    getMyPrescriptions,
    getPrescriptionById,
    getPrescriptionList,
    getMedicineReminders,
    getReminderLogs
} = require('../prescription.controller');
const db = require('../../../config/db');
const cloudinary = require('../../../config/cloudinary');

// Mock the database module
jest.mock('../../../config/db', () => ({
    query: jest.fn(),
}));

// Mock the cloudinary module
jest.mock('../../../config/cloudinary', () => ({
    uploader: {
        upload_stream: jest.fn(),
    },
}));

describe('Prescription Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            user: { userId: 1, userUUID: 'some-uuid', role: 'Patient' },
            params: {},
            query: {},
            body: {},
            file: null,
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getMyPrescriptions', () => {
        it('should fetch all prescriptions for a patient', async () => {
            const mockPrescriptions = [
                { 
                    prescription_id: 1, 
                    medication_name: 'Paracetamol', 
                    dosage: '500mg', 
                    frequency: 'Twice daily',
                    duration: '5 days',
                    prescribed_by_doctor_id: 1,
                    doctor_name: 'Dr. Smith',
                    doctor_specialty: 'General Physician',
                    clinic_name: 'City Clinic'
                }
            ];
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // First query: find patient by user UUID
                .mockResolvedValueOnce({ rows: mockPrescriptions }); // Second query: get prescriptions

            await getMyPrescriptions(mockReq, mockRes);

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM prescriptions'), [101]); // 101 is the patient_id returned from the first query
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockPrescriptions);
        });

        it('should return 403 if user is not a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Professional' };

            await getMyPrescriptions(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can view prescriptions.' });
        });
    });

    describe('getPrescriptionById', () => {
        it('should fetch a specific prescription by ID', async () => {
            const mockPrescription = {
                prescription_id: 1,
                medication_name: 'Aspirin',
                dosage: '100mg',
                frequency: 'Once daily',
                duration: '10 days'
            };
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // First query: find patient by user UUID
                .mockResolvedValueOnce({ rows: [mockPrescription] }); // Second query: get specific prescription

            mockReq.params.prescriptionId = '1';

            mockReq.params.prescriptionId = '1';

            await getPrescriptionById(mockReq, mockRes);

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM prescriptions'), ['1', 101]); // 101 is the patient_id returned from the first query
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockPrescription);
        });

        it('should return 404 if prescription not found', async () => {
            // Mock patient lookup to succeed first, then prescription lookup to fail
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // Find patient
                .mockResolvedValueOnce({ rows: [] }); // No prescription found

            mockReq.params.prescriptionId = '999';

            await getPrescriptionById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Prescription not found.' });
        });
    });

    describe('getPrescriptionList', () => {
        it('should fetch prescription list for a patient', async () => {
            const mockPrescriptionList = [
                {
                    list_id: 1,
                    prescription_id: 1,
                    condition_treated: 'Headache',
                    medicines_count: 2,
                    next_followup: '2025-12-01',
                    prescription_status: 'Active'
                }
            ];
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // First query: find patient by user UUID
                .mockResolvedValueOnce({ rows: mockPrescriptionList }); // Second query: get prescription list

            await getPrescriptionList(mockReq, mockRes);

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM prescription_list'), [101]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockPrescriptionList);
        });
    });

    describe('getMedicineReminders', () => {
        it('should fetch medicine reminders for a patient', async () => {
            const mockReminders = [
                {
                    reminder_id: 1,
                    prescription_id: 1,
                    medication_name: 'Metformin',
                    dosage_form: '1 tablet',
                    timing_schedule: 'Morning after meal',
                    how_to_take: 'After food',
                    duration: '30 days'
                }
            ];
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // First query: find patient by user UUID
                .mockResolvedValueOnce({ rows: mockReminders }); // Second query: get medicine reminders

            await getMedicineReminders(mockReq, mockRes);

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM medicine_reminders'), [101]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockReminders);
        });
    });

    describe('getReminderLogs', () => {
        it('should fetch reminder logs for a specific medicine reminder', async () => {
            const mockLogs = [
                {
                    log_id: 1,
                    scheduled_time: '2025-11-18T09:00:00Z',
                    taken_time: '2025-11-18T09:05:00Z',
                    status: 'Taken'
                }
            ];
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // First query: find patient by user UUID
                .mockResolvedValueOnce({ rows: mockLogs }); // Second query: get reminder logs

            mockReq.params.reminderId = '1';

            await getReminderLogs(mockReq, mockRes);

            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM reminder_logs'), [101, '1']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockLogs);
        });
    });
});