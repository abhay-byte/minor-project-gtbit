// src/api/controllers/__tests__/clinic.controller.test.js
const { 
    searchClinics, 
    getClinicById, 
    getDoctorsByClinic,
    submitClinicDoctorReview, 
    getClinicDoctorReviews,
    getClinicDoctorReviewStats,
    saveSearchHistory,
    getSearchHistory
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
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                clinics: mockClinics,
                count: expect.any(Number),
                location: expect.objectContaining({ lat: expect.any(Number), lon: expect.any(Number) }),
                radius_km: expect.any(String)
            }));
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
            expect(mockRes.json).toHaveBeenCalledWith({ ...mockClinic, doctors: mockDoctors, doctor_count: 1 });
        });
    });

    describe('getDoctorsByClinic', () => {
        it('should return doctors for a specific clinic', async () => {
            mockReq.params = { id: 1 };
            mockReq.query = {};
            const mockDoctors = [{ clinic_doctor_id: 1, full_name: 'Dr. Kumar', specialty: 'Cardiologist' }];
            db.query.mockResolvedValue({ rows: mockDoctors });
            
            await getDoctorsByClinic(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM clinic_doctors WHERE clinic_id = $1'), [1]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                clinic_id: 1,
                count: 1,
                doctors: mockDoctors
            });
        });
        
        it('should filter doctors by specialty', async () => {
            mockReq.params = { id: 1 };
            mockReq.query = { specialty: 'Cardiologist' };
            db.query.mockResolvedValue({ rows: [] });
            
            await getDoctorsByClinic(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE clinic_id = $1 AND specialty ILIKE $2'), [1, '%Cardiologist%']);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        
        it('should filter doctors by availability', async () => {
            mockReq.params = { id: 1 };
            mockReq.query = { available_today: 'true' };
            db.query.mockResolvedValue({ rows: [] });
            
            await getDoctorsByClinic(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE clinic_id = $1 AND available_today = true'), [1]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('submitClinicDoctorReview', () => {
        it('should submit a review for a clinic doctor', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid' };
            mockReq.params = { doctorId: 5 };
            mockReq.body = { rating: 5, comment: 'Great doctor!' };

            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 201, patient_id_uuid: 'patient-uuid' }] })
                .mockResolvedValueOnce({ rows: [{ review_id: 701, review_id_uuid: 'review-uuid' }] });
            
            await submitClinicDoctorReview(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Review submitted successfully.' });
        });
        
        it('should return 400 if rating is missing', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid' };
            mockReq.params = { doctorId: 5 };
            mockReq.body = { comment: 'Good doctor' };
            
            await submitClinicDoctorReview(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Rating is a required field.' });
        });
        
        it('should return 403 if user is not a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Professional' };
            mockReq.params = { doctorId: 5 };
            mockReq.body = { rating: 5, comment: 'Great doctor!' };
            
            db.query.mockResolvedValueOnce({ rows: [] }); // No patient found
            
            await submitClinicDoctorReview(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can submit reviews.' });
        });
    });

    describe('getClinicDoctorReviews', () => {
        it('should fetch all reviews for a clinic doctor', async () => {
            mockReq.params = { doctorId: 5 };
            const mockReviews = [
                { review_id: 1, rating: 5, comment: 'Excellent service', author: 'John Doe' }
            ];
            db.query.mockResolvedValue({ rows: mockReviews });
            
            await getClinicDoctorReviews(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM reviews r JOIN patients p ON r.patient_id = p.patient_id WHERE r.target_type = $1 AND r.target_id = $2'), ['Clinic_Doctor', 5]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
        });
    });
    
    describe('getClinicDoctorReviewStats', () => {
        it('should fetch review statistics for a clinic doctor', async () => {
            mockReq.params = { doctorId: 5 };
            const mockStats = {
                total_reviews: 10,
                average_rating: 4.5,
                five_star: 7,
                four_star: 2,
                three_star: 1,
                two_star: 0,
                one_star: 0,
                verified_reviews: 5
            };
            db.query.mockResolvedValue({ rows: [mockStats] });
            
            await getClinicDoctorReviewStats(mockReq, mockRes);
            
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM reviews'), ['Clinic_Doctor', 5]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockStats);
        });
    });
    
    describe('saveSearchHistory', () => {
        it('should save search history for a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid' };
            mockReq.body = { 
                search_query: 'cardiologist in delhi',
                search_filters: { specialty: 'cardiology', location: 'delhi' },
                location_searched: 'Delhi, India',
                results_count: 15
            };
            
            // Mock patient lookup
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // Find patient by user UUID
                .mockResolvedValueOnce({ rows: [{ search_id: 501 }] }); // Insert search history
            
            await saveSearchHistory(mockReq, mockRes);
            
            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO search_history'), [101, 'cardiologist in delhi', expect.any(Object), 'Delhi, India', 15]);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Search history saved.', search_id: 501 });
        });
        
        it('should return 403 if user is not a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid', role: 'Professional' };
            mockReq.body = { search_query: 'test', location_searched: 'test', results_count: 5 };
            
            // Mock empty patient lookup result
            db.query.mockResolvedValue({ rows: [] });
            
            await saveSearchHistory(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden: Only patients can save search history.' });
        });
    });
    
    describe('getSearchHistory', () => {
        it('should fetch search history for a patient', async () => {
            mockReq.user = { userId: 1, userUUID: 'some-uuid' };
            mockReq.query = { limit: '10' };
            const mockSearches = [
                { search_id: 1, search_query: 'cardiologist near me', searched_at: '2025-11-18T00:00:00Z' }
            ];
            db.query
                .mockResolvedValueOnce({ rows: [{ patient_id: 101, patient_id_uuid: 'patient-uuid' }] }) // Find patient
                .mockResolvedValueOnce({ rows: mockSearches }); // Get search history
            
            await getSearchHistory(mockReq, mockRes);
            
            expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT patient_id, patient_id_uuid FROM patients WHERE user_id_uuid = $1'), ['some-uuid']);
            expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('FROM search_history WHERE patient_id = $1'), [101, 10]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ count: 1, searches: mockSearches });
        });
    });
});
