const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');

router.get('/', professionalController.getProfessionals);
router.get('/:id/availability', professionalController.getAvailability);

module.exports = router;
