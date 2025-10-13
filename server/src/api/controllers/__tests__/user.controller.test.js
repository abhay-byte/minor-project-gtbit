// src/api/controllers/__tests__/user.controller.test.js

const { getMe, updateMe } = require('../user.controller');
const db = require('../../../config/db');

// Mock the database module
jest.mock('../../../config/db', () => ({
    connect: jest.fn(),
}));

describe('User Controller', () => {
    let mockReq, mockRes, mockClient;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock Express request and response objects
        mockReq = {
            user: { userId: 1, role: 'Patient' }, // Simulate middleware attachment
            body: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the database client that db.connect() will return
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        db.connect.mockResolvedValue(mockClient);
    });

    // --- GET PROFILE TESTS ---
    describe('getMe', () => {
        it('should fetch a complete patient profile successfully', async () => {
            const mockUser = { user_id: 1, email: 'test@example.com', full_name: 'Test User', role: 'Patient' };
            const mockPatientDetails = { patient_id: 101, date_of_birth: '2000-01-01', gender: 'Other', address: '123 Test St' };

            // Setup mock query responses in order of execution
            mockClient.query
                .mockResolvedValueOnce({}) // For BEGIN
                .mockResolvedValueOnce({ rows: [mockUser] }) // For fetching from 'users'
                .mockResolvedValueOnce({ rows: [mockPatientDetails] }) // For fetching from 'patients'
                .mockResolvedValueOnce({}); // For COMMIT

            await getMe(mockReq, mockRes);

            // Verify transaction flow and queries
            expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM users u'), [1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(3, expect.stringContaining('FROM patients'), [1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
            expect(mockClient.release).toHaveBeenCalled();

            // Verify the final response
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ ...mockUser, ...mockPatientDetails });
        });

        it('should return 404 if user is not found', async () => {
            mockClient.query
                .mockResolvedValueOnce({}) // BEGIN
                .mockResolvedValueOnce({ rows: [] }); // Simulate user not found in 'users' table

            await getMe(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found.' });
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should handle server errors gracefully', async () => {
            mockClient.query.mockRejectedValueOnce(new Error('DB Error')); // Simulate a failure on BEGIN

            await getMe(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN'); // It will try to begin
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK'); // It should roll back on error
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching the user profile.' });
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    // --- UPDATE PROFILE TESTS ---
    describe('updateMe', () => {
        it('should update a patient profile successfully', async () => {
            mockReq.body = {
                fullName: 'Test User Updated',
                phoneNumber: '1234567890',
                address: '456 New Address St',
            };

            await updateMe(mockReq, mockRes);

            // Verify transaction flow
            expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            // Verify update on 'users' table
            expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE users'), ['Test User Updated', '1234567890', 1]);
            // Verify update on 'patients' table
            expect(mockClient.query).toHaveBeenNthCalledWith(3, expect.stringContaining('UPDATE patients'), ['456 New Address St', undefined, 1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
            expect(mockClient.release).toHaveBeenCalled();

            // Verify the final response
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Profile updated successfully.' });
        });

        it('should only update the users table if no role-specific data is provided', async () => {
            mockReq.body = { fullName: 'Just a Name Change' };

            await updateMe(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), ['Just a Name Change', undefined, 1]);
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

            // Ensure the patients table was NOT updated
            expect(mockClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE patients'));
            expect(mockClient.release).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle update errors gracefully', async () => {
            mockReq.body = { fullName: 'Error User' };
            mockClient.query.mockRejectedValueOnce(new Error('DB Update Error')); // Fail on BEGIN

            await updateMe(mockReq, mockRes);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while updating the profile.' });
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});