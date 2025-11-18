// src/api/middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');

// Define a standard rate limiter for most API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many login attempts from this IP, please try again after a minute'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 25,
  message: 'Too many registration attempts from this IP, please try again after an hour'
});

const createAppointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  message: 'Too many appointment creation requests from this IP, please try again after 15 minutes',
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    createAppointmentLimiter,
    userLimiter,
};
