const express = require('express');
const router = express.Router();
const upload = require('../../config/multer'); // Using multer for file uploads
const {
  requestLabReportUpload,
  getReportRequestsProfessional,
  getReportRequestsPatient,
  uploadTestReport
} = require('../controllers/upload-report-requests.controller');
const authenticate = require('../middleware/auth.middleware');

// Middleware to check if user is a professional
const requireProfessionalRole = (req, res, next) => {
 if (req.user.role !== 'Professional') {
    return res.status(403).json({ error: 'Only professionals can access this endpoint' });
  }
 next();
};

// Middleware to check if user is a patient
const requirePatientRole = (req, res, next) => {
 if (req.user.role !== 'Patient') {
    return res.status(403).json({ error: 'Only patients can access this endpoint' });
 }
  next();
};

// POST /api/upload-report-requests - Request patient to upload specific lab test reports
router.post('/', authenticate, requireProfessionalRole, requestLabReportUpload);

// GET /api/upload-report-requests - Get all report requests created by the logged-in professional
router.get('/', authenticate, requireProfessionalRole, getReportRequestsProfessional);

// GET /api/upload-report-requests/me - Get all report requests for the logged-in patient
router.get('/me', authenticate, requirePatientRole, getReportRequestsPatient);

// POST /api/upload-report-requests/:requestId/upload - Patient uploads requested test report
router.post('/:requestId/upload', authenticate, requirePatientRole, upload.single('reportFile'), uploadTestReport);

module.exports = router;