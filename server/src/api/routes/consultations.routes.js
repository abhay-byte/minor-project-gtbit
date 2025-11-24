const express = require('express');
const router = express.Router();
const { createConsultation, createPrescription, requestLabReportUpload } = require('../controllers/consultation.controller');
const authenticate = require('../middleware/auth.middleware');

// Middleware to check if user is a professional
const requireProfessionalRole = (req, res, next) => {
  if (req.user.role !== 'Professional') {
    return res.status(403).json({ error: 'Only professionals can access this endpoint' });
  }
  next();
};

// POST /api/consultations - Create consultation record after appointment completion
router.post('/', authenticate, requireProfessionalRole, createConsultation);

// POST /api/consultations/prescriptions - Issue a new prescription during or after consultation
router.post('/prescriptions', authenticate, requireProfessionalRole, createPrescription);

// POST /api/consultations/upload-report-requests - Request patient to upload specific lab test reports
router.post('/upload-report-requests', authenticate, requireProfessionalRole, requestLabReportUpload);

module.exports = router;