// src/api/controllers/__tests__/professional.controller.test.js

const { getAllProfessionals, getProfessionalAvailability } = require('../professional.controller');
const db = require('../../../config/db');

// Mock the database module
jest.mock('../../../config/db', () => ({
    query: jest.fn(),
}));

describe('Professional Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // --- getAllProfessionals TESTS ---
    describe('getAllProfessionals', () => {
        it('should fetch all verified professionals without a filter', async () => {
            const mockProfessionals = [{ professional_id: 1, full_name: 'Dr. Amit Patel', specialty: 'Psychiatrist' }];
            db.query.mockResolvedValue({ rows: mockProfessionals });

            await getAllProfessionals(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE p.verification_status = 'Verified'::verification_status_enum"), []);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProfessionals);
        });

        it('should fetch verified professionals filtered by specialty', async () => {
            mockReq.query.specialty = 'Cardiologist';
            const mockProfessionals = [{ professional_id: 3, full_name: 'Dr. Vikram Verma', specialty: 'Cardiologist' }];
            db.query.mockResolvedValue({ rows: mockProfessionals });

            await getAllProfessionals(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('AND p.specialty = $1'), ['Cardiologist']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProfessionals);
        });

        it('should handle database errors gracefully', async () => {
            // FIX: Temporarily spy on console.error and mock its implementation to prevent logging
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            db.query.mockRejectedValue(new Error('DB Error'));

            await getAllProfessionals(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching professionals.' });

            // FIX: Restore the original console.error implementation
            consoleErrorSpy.mockRestore();
        });
    });

    // --- getProfessionalAvailability TESTS ---
    describe('getProfessionalAvailability', () => {
        it('should fetch available slots for a given professional ID', async () => {
            mockReq.params.id = '1';
            const mockSlots = [
                { slot_id: 101, start_time: '2025-11-20T10:00:00Z', end_time: '2025-11-20T10:30:00Z' },
                { slot_id: 102, start_time: '2025-11-20T11:00:00Z', end_time: '2025-11-20T11:30:00Z' },
            ];
            db.query.mockResolvedValue({ rows: mockSlots });

            await getProfessionalAvailability(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE professional_id = $1 AND is_booked = false'), ['1']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockSlots);
        });

        it('should return an empty array if a professional has no available slots', async () => {
            mockReq.params.id = '2';
            db.query.mockResolvedValue({ rows: [] });

            await getProfessionalAvailability(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith([]);
        });

        it('should return 400 for an invalid professional ID', async () => {
            mockReq.params.id = 'invalid';

            await getProfessionalAvailability(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid professional ID.' });
        });

        it('should handle database errors gracefully', async () => {
            // FIX: Temporarily spy on console.error and mock its implementation
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            mockReq.params.id = '1';
            db.query.mockRejectedValue(new Error('DB Error'));

            await getProfessionalAvailability(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching availability.' });

            // FIX: Restore the original console.error implementation
            consoleErrorSpy.mockRestore();
        });
    });
});

