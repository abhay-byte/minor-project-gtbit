// src/api/routes/prescriptions.routes.js
const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const verifyToken = require('../middleware/auth.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware'); 

// All routes in this file are protected by the JWT authentication middleware.
router.use(userLimiter);
router.use(verifyToken);

// Routes for prescriptions
router.get('/me', prescriptionController.getMyPrescriptions);
router.get('/me/:prescriptionId', prescriptionController.getPrescriptionById);

// Routes for prescription lists
router.get('/lists', prescriptionController.getPrescriptionList);

// Routes for medicine reminders
router.get('/reminders', prescriptionController.getMedicineReminders);
router.get('/reminders/:reminderId/logs', prescriptionController.getReminderLogs);

// Middleware to check if user is a professional
const requireProfessionalRole = (req, res, next) => {
  if (req.user.role !== 'Professional') {
    return res.status(403).json({ error: 'Only professionals can access this endpoint' });
  }
 next();
};

// POST /api/prescriptions - Issue a new prescription during or after consultation (for professionals)
router.post('/', requireProfessionalRole, (req, res, next) => {
  // Delegate to the consultation controller's createPrescription function
  const { createPrescription } = require('../controllers/consultation.controller');
  createPrescription(req, res, next);
});

module.exports = router;