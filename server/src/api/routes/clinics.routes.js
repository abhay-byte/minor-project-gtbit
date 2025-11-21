// src/api/routes/clinics.routes.js
const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const verifyToken = require('../middleware/auth.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware');

// Approach: Use a more specific middleware that checks the exact path
// before deciding whether to apply authentication

// First, add public routes
router.get('/search', clinicController.searchClinics);

// For the specific issue we're solving, let's make sure /search-history is handled correctly
// by having authenticated routes in a separate router that's processed first for matching

// Create a special middleware that only applies auth to specific paths
const authForSpecificPaths = (req, res, next) => {
  const path = req.path;
  const method = req.method;
  
  // Define which routes need authentication
  const needsAuth = 
    path === '/search-history' ||  // GET /search-history
    (path === '/search-history' && method === 'POST') ||  // POST /search-history
    path.includes('/doctors');      // Any route with /doctors
  
  if (needsAuth) {
    // Apply rate limiting and authentication
    userLimiter(req, res, () => {
      verifyToken(req, res, next);
    });
  } else {
    // Continue without authentication
    next();
  }
};

// Apply the conditional auth middleware
router.use(authForSpecificPaths);

// Add the authenticated routes
router.post('/search-history', clinicController.saveSearchHistory);
router.get('/search-history', clinicController.getSearchHistory);
router.post('/doctors/:doctorId/reviews', clinicController.submitClinicDoctorReview);
router.get('/doctors/:doctorId/reviews', clinicController.getClinicDoctorReviews);
router.get('/doctors/:doctorId/reviews/stats', clinicController.getClinicDoctorReviewStats);
router.get('/:id/doctors', clinicController.getDoctorsByClinic);

// The :id route will now be public since it doesn't match our auth conditions
router.get('/:id', clinicController.getClinicById);

module.exports = router;