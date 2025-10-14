// src/api/routes/professionals.routes.js
const express = require('express');
const {
    getAllProfessionals,
    getProfessionalAvailability
} = require('../controllers/professional.controller');

const router = express.Router();

// Public route to get all verified professionals
// Can be filtered with a query param, e.g., /api/professionals?specialty=Psychiatrist
router.get('/', getAllProfessionals);

// Public route to get the availability for a specific professional
router.get('/:id/availability', getProfessionalAvailability);

module.exports = router;
