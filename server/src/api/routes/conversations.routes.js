const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/conversation.controller');
const authenticate = require('../../api/middleware/auth.middleware');

// GET /api/conversations - Fetches the list of active conversations for the user
router.get('/', authenticate, getConversations);

// GET /api/conversations/:id/messages - Fetches the message history for a specific thread
router.get('/:id/messages', authenticate, getMessages);

// POST /api/conversations/:id/messages - Sends a new message
router.post('/:id/messages', authenticate, sendMessage);

module.exports = router;