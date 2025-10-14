// src/api/controllers/__tests__/clinic.controller.test.js
const { 
    searchClinics, 
    getClinicById, 
    submitClinicDoctorReview, 
    getClinicDoctorReviews 
} = require('../clinic.controller');
const db = require('../../../config/db');

jest.mock('../../../config/db');

describe('Clinic Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { query: {}, params: {}, body: {}, user: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('searchClinics', () => {
        it('should return clinics within a radius', async () => {
            mockReq.query = { lat: '28.6139', lon: '77.2090', radius: '10' };
            const mockClinics = [{ clinic_id: 1, name: 'City Hospital', distance: 5.2 }];
            db.query.mockResolvedValue({ rows: mockClinics });

            await searchClinics(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('Haversine formula'), ['28.6139', '77.2090', '10']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockClinics);
        });

        it('should filter clinics by specialty', async () => {
            mockReq.query = { lat: '28.6139', lon: '77.2090', specialty: 'Cardiologist' };
            db.query.mockResolvedValue({ rows: [] });

            await searchClinics(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ILIKE $4'), expect.arrayContaining(['%Cardiologist%']));
        });

        it('should return 400 if lat or lon are missing', async () => {
            mockReq.query = { lon: '77.2090' };
            await searchClinics(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Latitude (lat) and longitude (lon) are required query parameters.' });
        });
    });

    describe('getClinicById', () => {
        it('should return clinic details and its doctors', async () => {
            mockReq.params = { id: 1 };
            const mockClinic = { clinic_id: 1, name: 'City Hospital' };
            const mockDoctors = [{ full_name: 'Dr. Kumar' }];
            db.query
                .mockResolvedValueOnce({ rows: [mockClinic] })
                .mockResolvedValueOnce({ rows: mockDoctors });
            
            await getClinicById(mockReq, mockRes);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM clinics'), [1]);
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM clinic_doctors'), [1]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ ...mockClinic, doctors: mockDoctors });
        });
    });

    describe('submitClinicDoctorReview', () => {
        it('should submit a review for a clinic doctor', async () => {
            mockReq.user = { userId: 1 };
            mockReq.params = { doctorId: 5 };
            mockReq.body = { rating: 5, comment: 'Great doctor!' };

            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 201 }] })
                .mockResolvedValueOnce({ rows: [{ review_id: 701 }] });
            
            await submitClinicDoctorReview(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Review submitted successfully.' });
        });
    });
});
