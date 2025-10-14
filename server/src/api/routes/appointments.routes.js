// src/api/routes/appointments.routes.js
const express = require('express');
const { createAppointment, getMyAppointments } = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const createAppointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  message: 'Too many appointment creation requests from this IP, please try again after 15 minutes',
});

// All routes in this file are protected by the JWT authentication middleware.
router.use(authMiddleware);

const appointmentsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false, 
});
router.use(appointmentsLimiter);

// Create a new appointment
router.post('/',createAppointmentLimiter, createAppointment);

// Get appointments for the logged-in user
// Supports filtering, e.g., /api/appointments/me?status=upcoming
router.get('/me', getMyAppointments);

module.exports = router;
