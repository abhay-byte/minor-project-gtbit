// src/api/routes/professionals.routes.js
const express = require('express');
const {
    getAllProfessionals,
    getProfessionalAvailability,
    getProfessionalDashboard,
    createOrUpdateProfessionalProfile,
    createBatchAvailability,
    getDoctorProfile // <--- Import the new function
} = require('../controllers/professional.controller');

// Assuming you have an authentication middleware to get req.user
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get all verified professionals
// Can be filtered with a query param, e.g., /api/professionals?specialty=Psychiatrist
router.get('/', getAllProfessionals);

// Private route for Doctor Dashboard stats
// This must be defined BEFORE /:id routes to avoid conflict
// Add your auth middleware here, e.g., router.get('/me/dashboard', authenticate, getProfessionalDashboard);
router.get('/me/dashboard', authenticate, getProfessionalDashboard);

// Public route to get the availability for a specific professional
router.get('/:id/availability', getProfessionalAvailability);

// Public route to get complete profile information for a specific doctor
router.get('/:id/profile', getDoctorProfile);

// Private route to create or update professional profile
router.put('/me/profile', authenticate, createOrUpdateProfessionalProfile);

// Private route to create batch availability slots
router.post('/availability/batch', authenticate, createBatchAvailability);

module.exports = router;
