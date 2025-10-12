const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');

router.get('/search', clinicController.searchClinics);
router.get('/:id', clinicController.getClinicById);

module.exports = router;
