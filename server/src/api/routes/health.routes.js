const express = require('express');
const { healthCheck, getApiInfo } = require('../controllers/health.controller');

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Root endpoint
router.get('/', getApiInfo);

module.exports = router;