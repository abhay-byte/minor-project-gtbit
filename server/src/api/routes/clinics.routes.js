// src/api/routes/clinics.routes.js
const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const verifyToken = require('../middleware/auth.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware'); 

// Public endpoints for clinic discovery (no authentication required)
router.get('/search', clinicController.searchClinics);
router.get('/:id', clinicController.getClinicById);

// Protected endpoints for clinic doctor reviews and other functionality (authentication required)
router.use(userLimiter);
router.use(verifyToken);

// Endpoints for clinic doctor reviews
router.post('/doctors/:doctorId/reviews', clinicController.submitClinicDoctorReview);
router.get('/doctors/:doctorId/reviews', clinicController.getClinicDoctorReviews);
router.get('/doctors/:doctorId/reviews/stats', clinicController.getClinicDoctorReviewStats);

// Endpoints for clinic doctors
router.get('/:id/doctors', clinicController.getDoctorsByClinic);

// Endpoints for search history
router.post('/search-history', clinicController.saveSearchHistory);
router.get('/search-history', clinicController.getSearchHistory);

module.exports = router;