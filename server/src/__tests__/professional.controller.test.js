const { getAllProfessionals, getProfessionalAvailability, getProfessionalDashboard } = require('../api/controllers/professional.controller');
const db = require('../config/db');

// Mock the database module
jest.mock('../config/db');

describe('Professional Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfessionalDashboard', () => {
        const mockReq = {
            user: { user_id: 1 }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        it('should return dashboard data when professional is found', async () => {
            const mockProfessionalData = {
                rows: [{
                    professional_id: 1,
                    rating: 4.85,
                    total_reviews: 150,
                    patients_treated: 1200,
                    verification_status: 'Verified',
                    is_volunteer: true
                }]
            };

            const mockAppointmentCount = {
                rows: [{ count: 8 }]
            };

            const mockReportCount = {
                rows: [{ count: 3 }]
            };

            db.query
                .mockResolvedValueOnce(mockProfessionalData)  // For professional query
                .mockResolvedValueOnce(mockAppointmentCount)  // For appointment count query
                .mockResolvedValueOnce(mockReportCount);      // For report count query

            await getProfessionalDashboard(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(3);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                rating: 4.85,
                total_reviews: 150,
                patients_treated: 1200,
                verification_status: 'Verified',
                is_volunteer: true,
                appointments_today_count: 8,
                pending_reports_count: 3
            });
        });

        it('should return 404 when professional profile is not found', async () => {
            const mockEmptyProfessionalData = {
                rows: []
            };

            db.query.mockResolvedValueOnce(mockEmptyProfessionalData);

            await getProfessionalDashboard(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Professional profile not found for this user.' });
        });

        it('should return 500 when there is a database error', async () => {
            const error = new Error('Database error');
            db.query.mockRejectedValueOnce(error);

            await getProfessionalDashboard(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching dashboard stats.' });
        });
    });

    describe('getAllProfessionals', () => {
        const mockReq = {
            query: {}
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        it('should return all verified professionals', async () => {
            const mockProfessionals = [{
                professional_id: 1,
                full_name: 'Dr. John Doe',
                specialty: 'Cardiologist',
                credentials: 'MD',
                years_of_experience: 10,
                rating: 4.5,
                total_reviews: 50,
                patients_treated: 500,
                languages_spoken: 'English, Spanish',
                working_hours: '9AM-5PM',
                is_volunteer: false
            }];

            db.query.mockResolvedValueOnce({ rows: mockProfessionals });

            await getAllProfessionals(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProfessionals);
        });

        it('should return filtered professionals by specialty', async () => {
            const mockReqWithSpecialty = {
                query: { specialty: 'Psychiatrist' }
            };

            const mockFilteredProfessionals = [{
                professional_id: 2,
                full_name: 'Dr. Jane Smith',
                specialty: 'Psychiatrist',
                credentials: 'MD',
                years_of_experience: 8,
                rating: 4.8,
                total_reviews: 30,
                patients_treated: 300,
                languages_spoken: 'English',
                working_hours: '10AM-6PM',
                is_volunteer: true
            }];

            db.query.mockResolvedValueOnce({ rows: mockFilteredProfessionals });

            await getAllProfessionals(mockReqWithSpecialty, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockFilteredProfessionals);
        });

        it('should return 500 when there is a database error', async () => {
            const error = new Error('Database error');
            db.query.mockRejectedValueOnce(error);

            await getAllProfessionals(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching professionals.' });
        });
    });

    describe('getProfessionalAvailability', () => {
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        it('should return availability slots for a valid professional ID', async () => {
            const mockReq = {
                params: { id: '1' }
            };

            const mockAvailability = [{
                slot_id: 1,
                start_time: '2023-01-01T10:00:00Z',
                end_time: '2023-01-01T11:00:00Z'
            }];

            db.query.mockResolvedValueOnce({ rows: mockAvailability });

            await getProfessionalAvailability(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAvailability);
        });

        it('should return 400 for invalid professional ID', async () => {
            const mockReq = {
                params: { id: 'invalid' }
            };

            await getProfessionalAvailability(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid professional ID.' });
        });

        it('should return 500 when there is a database error', async () => {
            const mockReq = {
                params: { id: '1' }
            };

            const error = new Error('Database error');
            db.query.mockRejectedValueOnce(error);

            await getProfessionalAvailability(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'An error occurred while fetching availability.' });
        });
    });
});