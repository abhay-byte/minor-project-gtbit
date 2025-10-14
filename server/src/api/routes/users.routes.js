// src/api/routes/users.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware'); 

// GET /api/users/me
// Fetches the profile of the currently logged-in user.
router.get('/me', userLimiter, verifyToken, userController.getMe);

// PUT /api/users/me
// Updates the profile of the currently logged-in user.
router.put('/me', userLimiter, verifyToken, userController.updateMe);

// Routes for the user's medical records
router.post('/me/records', userLimiter, verifyToken, upload.single('documentFile'), userController.uploadMedicalRecord);
router.get('/me/records', userLimiter, verifyToken, userController.getMyMedicalRecords);
router.delete('/me/records/:recordId', userLimiter, verifyToken, userController.deleteMedicalRecord);

module.exports = router;
