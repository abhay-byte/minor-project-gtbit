// src/api/controllers/__tests__/appointment.controller.test.js

const { createAppointment, getMyAppointments } = require('../appointment.controller');
const db = require('../../../config/db');

// Mock the entire db module
jest.mock('../../../config/db');

describe('Appointment Controller', () => {
    let mockReq, mockRes;
    // Define the mockClient in the describe block so it's accessible to all tests
    const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Set the mock for db.connect before each test
        db.connect.mockResolvedValue(mockClient);

        mockReq = {
            body: {},
            user: {},
            query: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- createAppointment TESTS ---
    describe('createAppointment', () => {
        it('should successfully book an appointment for a patient', async () => {
            mockReq.user = { userId: 1, role: 'Patient' };
            mockReq.body = { slotId: 101 };

            // FIX: Mock the DB responses in the exact sequence the controller calls them
            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [{ patient_id: 201 }] }) // Find patient_id
                .mockResolvedValueOnce({ rows: [{ professional_id: 1, start_time: '2025-12-01T10:00:00Z' }] }) // Lock slot
                .mockResolvedValueOnce({ rows: [{ appointment_id: 301 }] }) // Insert appointment
                .mockResolvedValueOnce({}) // Update slot
                .mockResolvedValueOnce({}); // COMMIT

            await createAppointment(mockReq, mockRes);

            // FIX: Assert against the correctly scoped 'mockClient' variable
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Appointment booked successfully!',
            }));
        });

        it('should return 403 if user is not a patient', async () => {
            mockReq.user = { userId: 4, role: 'Professional' };
            mockReq.body = { slotId: 101 };
            await createAppointment(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can book appointments.' });
        });

        it('should return 409 if slot is already booked', async () => {
            mockReq.user = { userId: 1, role: 'Patient' };
            mockReq.body = { slotId: 101 };
            
            // Silence the expected error log for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [{ patient_id: 201 }] }) // Find patient
                .mockResolvedValueOnce({ rows: [] }) // Simulate slot not found/locked
                .mockResolvedValueOnce({}); // ROLLBACK

            await createAppointment(mockReq, mockRes);
            
            // FIX: Assert against the correctly scoped 'mockClient' variable
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'This appointment slot is no longer available.' });
            
            consoleErrorSpy.mockRestore();
        });
    });

    // --- getMyAppointments TESTS ---
    describe('getMyAppointments', () => {
        it('should fetch appointments for a patient', async () => {
            mockReq.user = { userId: 1, role: 'Patient' };
            const mockAppointments = [{ appointment_id: 301, professional_name: 'Dr. Amit Patel' }];
            // Use db.query directly since this controller function doesn't use a transaction
            db.query.mockResolvedValue({ rows: mockAppointments });
            
            await getMyAppointments(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.user_id = $1'), [1]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });

        it('should fetch upcoming appointments for a professional', async () => {
            mockReq.user = { userId: 4, role: 'Professional' };
            mockReq.query = { status: 'upcoming' };
            db.query.mockResolvedValue({ rows: [] });

            await getMyAppointments(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE prof.user_id = $1 AND a.appointment_time >= NOW()'), [4]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});

