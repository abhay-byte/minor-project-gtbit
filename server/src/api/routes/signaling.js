const express = require('express');
const router = express.Router();
const signalingController = require('../controllers/signalingController');
const verifyToken = require('../middleware/auth.middleware'); // Adjust as needed

// Create video room
router.post('/room', verifyToken, signalingController.createRoom);

// Validate room access
router.get('/validate/:roomId', verifyToken, signalingController.validateRoom);

module.exports = router;