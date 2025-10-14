// src/api/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');


const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: 'Too many registration attempts from this IP, please try again after an hour'
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerLimiter, register);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many login attempts from this IP, please try again after a minute'
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginLimiter, login);

module.exports = router;
