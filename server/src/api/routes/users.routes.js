// src/api/routes/users.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Define the routes for user profile management.
// All routes in this file are protected by the verifyToken middleware.

// GET /api/users/me
// Fetches the profile of the currently logged-in user.
router.get('/me', verifyToken, userController.getMe);

// PUT /api/users/me
// Updates the profile of the currently logged-in user.
router.put('/me', verifyToken, userController.updateMe);

// Routes for the user's medical records
router.post('/me/records',verifyToken,upload.single('documentFile'),userController.uploadMedicalRecord);
router.get('/me/records',verifyToken, userController.getMyMedicalRecords);
router.delete('/me/records/:recordId',verifyToken, userController.deleteMedicalRecord);

module.exports = router;
