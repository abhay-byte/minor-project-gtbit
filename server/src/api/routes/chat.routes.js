// api/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); 
const verifyToken = require('../middleware/auth.middleware');

/**
 * Internal middleware to verify requests from AI service
 */
const verifyInternalService = (req, res, next) => {
    const internalToken = req.headers['x-internal-service'];
    
    if (!internalToken || internalToken !== process.env.AI_SERVICE_AUTH_TOKEN) {
        return res.status(403).json({ 
            message: 'Forbidden: Invalid internal service token' 
        });
    }
    
    next();
};

/**
 * POST /api/chat/log
 * Log a chat message to the database (called by AI service)
 * Protected: Internal service only
 */
router.post('/log', verifyInternalService, async (req, res) => {
    const { user_id, message_content, sender } = req.body;
    
    // Validate input
    if (!user_id || !message_content || !sender) {
        return res.status(400).json({ 
            message: 'user_id, message_content, and sender are required' 
        });
    }
    
    // Validate sender type
    if (!['User', 'AI'].includes(sender)) {
        return res.status(400).json({ 
            message: 'sender must be either "User" or "AI"' 
        });
    }
    
    try {
        const query = `
            INSERT INTO ai_chat_logs (user_id, message_content, sender, timestamp)
            VALUES ($1, $2, $3, NOW())
            RETURNING log_id, user_id, message_content, sender, timestamp
        `;
        
        const result = await pool.query(query, [user_id, message_content, sender]);
        
        res.status(201).json({
            message: 'Chat message logged successfully',
            log: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error logging chat message:', error);
        res.status(500).json({ 
            message: 'Failed to log chat message',
            error: error.message 
        });
    }
});

/**
 * GET /api/chat/history
 * Get chat history for the authenticated user
 * Protected: User authentication required
 */
router.get('/history', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    try {
        const query = `
            SELECT log_id, message_content, sender, timestamp
            FROM ai_chat_logs
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [userId, limit, offset]);
        
        // Also get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM ai_chat_logs
            WHERE user_id = $1
        `;
        const countResult = await pool.query(countQuery, [userId]);
        
        res.json({
            messages: result.rows.reverse(), // Reverse to show oldest first
            total: parseInt(countResult.rows[0].total),
            limit,
            offset
        });
        
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ 
            message: 'Failed to fetch chat history',
            error: error.message 
        });
    }
});

/**
 * DELETE /api/chat/history
 * Clear chat history for the authenticated user
 * Protected: User authentication required
 */
router.delete('/history', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const query = `
            DELETE FROM ai_chat_logs
            WHERE user_id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        
        res.json({
            message: 'Chat history cleared successfully',
            deleted_count: result.rowCount
        });
        
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ 
            message: 'Failed to clear chat history',
            error: error.message 
        });
    }
});

/**
 * GET /api/chat/stats
 * Get chat statistics for the authenticated user
 * Protected: User authentication required
 */
router.get('/stats', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const query = `
            SELECT 
                COUNT(*) as total_messages,
                COUNT(*) FILTER (WHERE sender = 'User') as user_messages,
                COUNT(*) FILTER (WHERE sender = 'AI') as ai_messages,
                MIN(timestamp) as first_message_at,
                MAX(timestamp) as last_message_at
            FROM ai_chat_logs
            WHERE user_id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        
        res.json({
            stats: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error fetching chat stats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch chat statistics',
            error: error.message 
        });
    }
});

module.exports = router;