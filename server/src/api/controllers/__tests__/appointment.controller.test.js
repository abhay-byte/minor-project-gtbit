// src/api/controllers/__tests__/appointment.controller.test.js

const { createAppointment, getMyAppointments, cancelAppointment } = require('../appointment.controller');
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
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Patient' };
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
            mockReq.user = { userId: 4, userUUID: 'some-uuid', role: 'Professional' };
            mockReq.body = { slotId: 101 };
            await createAppointment(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can book appointments.' });
        });

        it('should return 409 if slot is already booked', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Patient' };
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
        it('should fetch appointments for a patient using serial ID', async () => {
            mockReq.user = { userId: 1, userUUID: null, role: 'Patient' };
            const mockAppointments = [{ appointment_id: 301, professional_name: 'Dr. Amit Patel' }];
            // Use db.query directly since this controller function doesn't use a transaction
            db.query.mockResolvedValue({ rows: mockAppointments });
            
            await getMyAppointments(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.user_id = $1'), [1]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });
        
        it('should fetch appointments for a patient using UUID', async () => {
            mockReq.user = { userId: 1, userUUID: 'test-uuid', role: 'Patient' };
            const mockAppointments = [{ appointment_id: 301, professional_name: 'Dr. Amit Patel' }];
            // Use db.query directly since this controller function doesn't use a transaction
            db.query.mockResolvedValue({ rows: mockAppointments });
            
            await getMyAppointments(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.user_id_uuid = $1'), ['test-uuid']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });
        
        it('should fetch appointments for a professional using serial ID', async () => {
            mockReq.user = { userId: 4, userUUID: null, role: 'Professional' };
            mockReq.query = { status: 'upcoming' };
            const mockAppointments = [{ appointment_id: 301, patient_name: 'John Doe' }];
            db.query.mockResolvedValue({ rows: mockAppointments });
            
            await getMyAppointments(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE prof.user_id = $1'), [4]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });
        
        it('should fetch appointments for a professional using UUID', async () => {
            mockReq.user = { userId: 4, userUUID: 'test-uuid-prof', role: 'Professional' };
            mockReq.query = { status: 'upcoming' };
            const mockAppointments = [{ appointment_id: 301, patient_name: 'John Doe' }];
            db.query.mockResolvedValue({ rows: mockAppointments });
            
            await getMyAppointments(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE prof.user_id_uuid = $1'), ['test-uuid-prof']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
        });
    });

    // --- cancelAppointment TESTS ---
    describe('cancelAppointment', () => {
        it('should successfully cancel an appointment for a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'patient-uuid', role: 'Patient' };
            mockReq.params = { id: '102' };
            mockReq.body = { reason: 'Emergency surgery required' };

            const mockAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                patient_id: 201,
                professional_id: 301,
                status: 'Scheduled',
                appointment_time: '2025-12-01T10:00:00Z',
                appointment_type: 'Virtual'
            };

            const mockUpdatedAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                status: 'Cancelled'
            };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [mockAppointment] }) // Get appointment details
                .mockResolvedValueOnce({ rows: [mockUpdatedAppointment] }) // Update appointment
                .mockResolvedValueOnce({ rows: [{ slot_id: 401 }] }) // Check for availability slot
                .mockResolvedValueOnce({}) // Update slot to available
                .mockResolvedValueOnce({}); // COMMIT

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Appointment cancelled successfully',
                appointment: {
                    appointment_id: 102,
                    appointment_id_uuid: 'appointment-uuid',
                    status: 'Cancelled',
                    cancellation_reason: 'Emergency surgery required',
                    slot_released: true,
                    cancelled_at: expect.any(String)
                }
            });
        });

        it('should return 400 if appointment ID is invalid', async () => {
            mockReq.user = { userId: 1, userUUID: 'patient-uuid', role: 'Patient' };
            mockReq.params = { id: 'invalid' }; // Invalid ID
            mockReq.body = { reason: 'Emergency surgery required' };

            await cancelAppointment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Valid appointment ID is required' });
        });

        it('should return 404 if appointment is not found', async () => {
            mockReq.user = { userId: 1, userUUID: 'patient-uuid', role: 'Patient' };
            mockReq.params = { id: '999' };
            mockReq.body = { reason: 'Emergency surgery required' };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [] }); // No appointment found

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Appointment not found' });
        });

        it('should return 404 if user is not authorized to cancel appointment', async () => {
            mockReq.user = { userId: 1, userUUID: 'different-patient-uuid', role: 'Patient' };
            mockReq.params = { id: '102' };
            mockReq.body = { reason: 'Emergency surgery required' };

            const mockAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                patient_id: 202, // Different patient
                professional_id: 301,
                status: 'Scheduled',
                appointment_time: '2025-12-01T10:00:00Z'
            };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [] }); // No appointment found (due to wrong user)

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Appointment not found' });
        });

        it('should return 400 if appointment is already cancelled', async () => {
            mockReq.user = { userId: 1, userUUID: 'patient-uuid', role: 'Patient' };
            mockReq.params = { id: '102' };
            mockReq.body = { reason: 'Emergency surgery required' };

            const mockAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                patient_id: 201,
                professional_id: 301,
                status: 'Cancelled', // Already cancelled
                appointment_time: '2025-12-01T10:00:00Z'
            };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [mockAppointment] }) // Get appointment
                .mockResolvedValueOnce({ rows: [{ patient_id: 201 }] }); // Check ownership

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Appointment is already cancelled or completed' });
        });

        it('should return 400 if appointment is already completed', async () => {
            mockReq.user = { userId: 1, userUUID: 'patient-uuid', role: 'Patient' };
            mockReq.params = { id: '102' };
            mockReq.body = { reason: 'Emergency surgery required' };

            const mockAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                patient_id: 201,
                professional_id: 301,
                status: 'Completed', // Already completed
                appointment_time: '2025-12-01T10:00Z'
            };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [mockAppointment] }); // Get appointment

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Appointment is already cancelled or completed' });
        });

        it('should successfully cancel an appointment for a professional', async () => {
            mockReq.user = { userId: 4, userUUID: 'professional-uuid', role: 'Professional' };
            mockReq.params = { id: '102' };
            mockReq.body = { reason: 'Emergency surgery required' };

            const mockAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                patient_id: 201,
                professional_id: 301,
                status: 'Scheduled',
                appointment_time: '2025-12-01T10:00Z',
                appointment_type: 'Virtual'
            };

            const mockUpdatedAppointment = {
                appointment_id: 102,
                appointment_id_uuid: 'appointment-uuid',
                status: 'Cancelled'
            };

            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [mockAppointment] }) // Get appointment details
                .mockResolvedValueOnce({ rows: [mockUpdatedAppointment] }) // Update appointment
                .mockResolvedValueOnce({ rows: [{ slot_id: 401 }] }) // Check for availability slot
                .mockResolvedValueOnce({}) // Update slot to available
                .mockResolvedValueOnce({}); // COMMIT

            await cancelAppointment(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Appointment cancelled successfully',
                appointment: {
                    appointment_id: 102,
                    appointment_id_uuid: 'appointment-uuid',
                    status: 'Cancelled',
                    cancellation_reason: 'Emergency surgery required',
                    slot_released: true,
                    cancelled_at: expect.any(String)
                }
            });
        });
    });
});

