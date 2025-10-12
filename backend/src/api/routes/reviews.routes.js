const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const reviewController = require('../controllers/review.controller');

router.post('/', auth, reviewController.createReview);
router.get('/', reviewController.getReviews);

module.exports = router;
