// src/api/routes/users.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

// Define the routes for user profile management.
// All routes in this file are protected by the verifyToken middleware.

// GET /api/users/me
// Fetches the profile of the currently logged-in user.
router.get('/me', verifyToken, userController.getMe);

// PUT /api/users/me
// Updates the profile of the currently logged-in user.
router.put('/me', verifyToken, userController.updateMe);

module.exports = router;
