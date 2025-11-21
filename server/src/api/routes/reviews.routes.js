const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authenticateToken = require('../middleware/auth.middleware');

// POST /api/reviews - Submit a new review
router.post('/', authenticateToken, reviewController.createReview);

// PUT /api/reviews/:reviewId - Update an existing review
router.put('/:reviewId', authenticateToken, reviewController.updateReview);

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', authenticateToken, reviewController.deleteReview);

// GET /api/reviews/me - Get all reviews submitted by the logged-in user
router.get('/me', authenticateToken, reviewController.getMyReviews);

// GET /api/reviews/:reviewId - Get details of a specific review
router.get('/:reviewId', authenticateToken, reviewController.getReviewById);

module.exports = router;