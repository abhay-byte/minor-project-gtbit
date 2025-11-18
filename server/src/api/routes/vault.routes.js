// src/api/routes/vault.routes.js
const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const verifyToken = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { userLimiter } = require('../middleware/rateLimiter.middleware'); 

// All routes in this file are protected by the JWT authentication middleware.
router.use(userLimiter);
router.use(verifyToken);

// Routes for medical vault
router.post('/:vaultType/upload', upload.single('documentFile'), vaultController.uploadPrescriptionToVault);
router.get('/:vaultType', vaultController.getVaultDocuments);

module.exports = router;