const express = require('express');
const router = express.Router();
const { requestLabReportUpload } = require('../controllers/consultation.controller');
const authenticate = require('../middleware/auth.middleware');

// Middleware to check if user is a professional
const requireProfessionalRole = (req, res, next) => {
  if (req.user.role !== 'Professional') {
    return res.status(403).json({ error: 'Only professionals can access this endpoint' });
  }
 next();
};

// POST /api/upload-report-requests - Request patient to upload specific lab test reports
router.post('/', authenticate, requireProfessionalRole, requestLabReportUpload);

module.exports = router;