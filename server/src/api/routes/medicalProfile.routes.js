// src/api/routes/medicalProfile.routes.js
const express = require('express');
const router = express.Router();
const medicalProfileController = require('../controllers/medicalProfile.controller');
const authenticate = require('../middleware/auth.middleware');

// Route: GET /api/patients/:id/medical-profile
// Description: Retrieve complete medical history for consultation reference
// Access: Professional (for consultation) or Admin
router.get('/patients/:id/medical-profile', authenticate, medicalProfileController.getPatientMedicalProfile);

module.exports = router;