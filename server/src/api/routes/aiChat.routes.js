const express = require('express');
const router = express.Router();
const { 
  sendChatQuery, 
  getUserSessions, 
  getSessionMessages, 
  deleteSession 
} = require('../controllers/aiChat.controller');
const verifyToken = require('../middleware/auth.middleware');

// POST /api/ai/chat - Send a query to AI and save response
router.post('/chat', verifyToken, sendChatQuery);

// GET /api/ai/sessions - Get all past AI conversations for the authenticated user
router.get('/sessions', verifyToken, getUserSessions);

// GET /api/ai/sessions/:session_id/messages - Get conversation messages for a specific session
router.get('/sessions/:session_id/messages', verifyToken, getSessionMessages);

// DELETE /api/ai/sessions/:session_id - Soft-delete a stored conversation
router.delete('/sessions/:session_id', verifyToken, deleteSession);

module.exports = router;