const reviewController = require('../api/controllers/review.controller');
const {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getReviewById
} = reviewController;
const db = require('../config/db');

// Mock the db module
jest.mock('../config/db');

describe('Review Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset the mock to a clean state before each test
    db.query = jest.fn();
    
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 } // Mock user
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      req.body = {
        target_type: 'Professional',
        target_id: 1,
        rating: 5,
        comment: 'Great service!',
        appreciated_aspects: 'Punctuality',
        feedback_suggestions: 'Nothing',
        is_verified_visit: true
      };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] }); // Check if patient exists
      db.query.mockResolvedValueOnce({ rows: [{ professional_id: 1 }] }); // Check if professional exists
      db.query.mockResolvedValueOnce({ rows: [] }); // Check if patient is not the professional
      db.query.mockResolvedValueOnce({ rows: [] }); // Check if no existing review
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // Get professional user_id
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // Get patient user_id
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, created_at: new Date() }] }); // Insert review
      db.query.mockResolvedValueOnce({ rows: [{ name: 'Dr. John' }] }); // Get target name

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Review submitted successfully'
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        target_type: 'Professional'
        // Missing target_id and rating
      };

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'target_type, target_id, and rating are required'
        })
      );
    });

    it('should return 400 if rating is invalid', async () => {
      req.body = {
        target_type: 'Professional',
        target_id: 1,
        rating: 6 // Invalid rating
      };

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        })
      );
    });

    it('should return 403 if user is not a patient', async () => {
      req.body = {
        target_type: 'Professional',
        target_id: 1,
        rating: 5
      };

      // Mock database responses in sequence for this specific test:
      db.query.mockResolvedValueOnce({ rows: [] }); // Check if patient exists - return empty (not a patient)

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Only patients can submit reviews'
        })
      );
    });

    it('should return 404 if target entity does not exist', async () => {
      req.body = {
        target_type: 'Professional',
        target_id: 1,
        rating: 5
      };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] }); // Patient exists
      db.query.mockResolvedValueOnce({ rows: [] }); // Professional does not exist

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Professional not found'
        })
      );
    });

    it('should return 409 if user has already reviewed the entity', async () => {
      req.body = {
        target_type: 'Professional',
        target_id: 1,
        rating: 5
      };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] }); // Patient exists
      db.query.mockResolvedValueOnce({ rows: [{ professional_id: 1 }] }); // Professional exists
      db.query.mockResolvedValueOnce({ rows: [] }); // Check if patient is not the professional
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1 }] }); // Existing review found

      await createReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'You have already reviewed this entity'
        })
      );
    });
  });

  describe('updateReview', () => {
    it('should update a review successfully', async () => {
      req.params = { reviewId: 1 };
      req.body = { rating: 4, comment: 'Updated comment' };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, patient_id: 1, target_type: 'Professional', target_id: 1 }] }); // Check if review exists and belongs to user
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, review_id_uuid: 'uuid', patient_id: 1, target_type: 'Professional', target_id: 1, rating: 4, comment: 'Updated comment', appreciated_aspects: null, feedback_suggestions: null, is_verified_visit: false, created_at: new Date(), updated_at: new Date() }] }); // Update review
      db.query.mockResolvedValueOnce({ rows: [] }); // Update target ratings

      await updateReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Review updated successfully'
        })
      );
    });

    it('should return 400 if no update fields are provided', async () => {
      req.params = { reviewId: 1 };
      req.body = {}; // No update fields

      await updateReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'At least one field must be provided for update'
        })
      );
    });

    it('should return 400 if rating is invalid', async () => {
      req.params = { reviewId: 1 };
      req.body = { rating: 6 }; // Invalid rating

      await updateReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Rating must be an integer between 1 and 5'
        })
      );
    });

    it('should return 404 if review does not exist', async () => {
      req.params = { reviewId: 1 };
      req.body = { rating: 4 };

      // Mock database response: review not found
      db.query.mockResolvedValueOnce({ rows: [] });

      await updateReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Review not found'
        })
      );
    });

    it('should return 403 if review does not belong to user', async () => {
      req.params = { reviewId: 1 };
      req.body = { rating: 4 };

      // Mock database response: review exists but belongs to another user
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, patient_id: 2, target_type: 'Professional', target_id: 1 }] });

      await updateReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'You can only update your own reviews'
        })
      );
    });
  });

  describe('deleteReview', () => {
    it('should delete a review successfully', async () => {
      req.params = { reviewId: 1 };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, target_type: 'Professional', target_id: 1 }] }); // Check if review exists and belongs to user
      db.query.mockResolvedValueOnce(); // Delete review
      db.query.mockResolvedValueOnce(); // Update target ratings

      await deleteReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Review deleted successfully'
        })
      );
    });

    it('should return 404 if review does not exist or does not belong to user', async () => {
      req.params = { reviewId: 1 };

      // Mock database response: review not found or doesn't belong to user
      db.query.mockResolvedValueOnce({ rows: [] });

      await deleteReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Review not found or does not belong to you'
        })
      );
    });
  });

  describe('getMyReviews', () => {
    it('should get user reviews successfully', async () => {
      req.query = { limit: 10, offset: 0 };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // Get total count
      db.query.mockResolvedValueOnce({ rows: [
        { review_id: 1, review_id_uuid: 'uuid1', target_type: 'Professional', target_id: 1, rating: 5, comment: 'Great!', appreciated_aspects: 'Punctuality', feedback_suggestions: 'Nothing', is_verified_visit: true, created_at: new Date(), updated_at: new Date() },
        { review_id: 2, review_id_uuid: 'uuid2', target_type: 'Clinic', target_id: 1, rating: 4, comment: 'Good', appreciated_aspects: 'Facility', feedback_suggestions: 'More staff', is_verified_visit: false, created_at: new Date(), updated_at: new Date() }
      ] }); // Get reviews
      db.query.mockResolvedValueOnce({ rows: [{ name: 'Dr. John' }] }); // Get target name for first review
      db.query.mockResolvedValueOnce({ rows: [{ name: 'City Clinic' }] }); // Get target name for second review

      await getMyReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: 5
        })
      );
    });

    it('should return 400 for invalid limit', async () => {
      req.query = { limit: 150 }; // Invalid limit (> 100)

      await getMyReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Limit must be a number between 1 and 100'
        })
      );
    });

    it('should return 400 for invalid offset', async () => {
      req.query = { limit: 10, offset: -5 }; // Invalid offset (< 0)

      await getMyReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Offset must be a non-negative number'
        })
      );
    });

    it('should return 400 for invalid order_by', async () => {
      req.query = { limit: 10, offset: 0, order_by: 'invalid_field' }; // Invalid order_by

      await getMyReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid order_by parameter. Must be one of: created_at, rating'
        })
      );
    });

    it('should return 400 for invalid order_direction', async () => {
      req.query = { limit: 10, offset: 0, order_direction: 'invalid_direction' }; // Invalid order_direction

      await getMyReviews(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid order_direction parameter. Must be one of: ASC, DESC'
        })
      );
    });
  });

 describe('getReviewById', () => {
    it('should get a review by ID successfully', async () => {
      req.params = { reviewId: 1 };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [{ review_id: 1, review_id_uuid: 'uuid', patient_id: 1, target_type: 'Professional', target_id: 1, rating: 5, comment: 'Great!', appreciated_aspects: 'Punctuality', feedback_suggestions: 'Nothing', is_verified_visit: true, created_at: new Date(), updated_at: new Date() }] }); // Get review
      db.query.mockResolvedValueOnce({ rows: [{ full_name: 'John Doe' }] }); // Get patient name
      db.query.mockResolvedValueOnce({ rows: [{ name: 'Dr. John' }] }); // Get target name

      await getReviewById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });

    it('should return 404 if review does not exist', async () => {
      req.params = { reviewId: 1 };

      // Mock database response: review not found
      db.query.mockResolvedValueOnce({ rows: [] });

      await getReviewById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Review not found'
        })
      );
    });
  });
});