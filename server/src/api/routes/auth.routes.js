// src/api/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { loginLimiter,registerLimiter } = require('../middleware/rateLimiter.middleware'); 

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerLimiter, register);


// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginLimiter, login);

module.exports = router;
