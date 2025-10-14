// src/api/routes/clinics.routes.js
const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const verifyToken = require('../middleware/auth.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware'); 

router.use(userLimiter);
router.use(verifyToken);

// Public endpoints for clinic discovery
router.get('/search', clinicController.searchClinics);
router.get('/:id', clinicController.getClinicById);

// Endpoints for clinic doctor reviews
router.post('/doctors/:doctorId/reviews', clinicController.getClinicDoctorReviews);
router.get('/doctors/:doctorId/reviews', clinicController.getClinicDoctorReviews);

module.exports = router;