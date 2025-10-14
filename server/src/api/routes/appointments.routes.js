// src/api/routes/appointments.routes.js
const express = require('express');
const { createAppointment, getMyAppointments } = require('../controllers/appointment.controller');
const verifyToken = require('../middleware/auth.middleware');
const { apiLimiter,createAppointmentLimiter } = require('../middleware/rateLimiter.middleware'); 
const router = express.Router();


// All routes in this file are protected by the JWT authentication middleware.
router.use(apiLimiter);
router.use(verifyToken);

// Create a new appointment
router.post('/',createAppointmentLimiter, createAppointment);

// Get appointments for the logged-in user
// Supports filtering, e.g., /api/appointments/me?status=upcoming
router.get('/me', getMyAppointments);

module.exports = router;
