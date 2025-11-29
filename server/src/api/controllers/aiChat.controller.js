const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/db');
const verifyToken = require('../middleware/auth.middleware');

/**
 * POST /api/ai/chat
 * Send a query to AI and save response
 */
const sendChatQuery = async (req, res) => {
  try {
    // Validate request body
    const { query, session_id, image_url } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Get user from token
    const userId = req.user.userId;
    
    // Get user's patient profile
    const patientQuery = 'SELECT patient_id FROM patients WHERE user_id = $1';
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }
    
    const patientId = patientResult.rows[0].patient_id;

    // Generate or use session_id
    let sessionId = session_id;
    if (!sessionId) {
      sessionId = uuidv4();
      
      // Create new session
      const sessionQuery = `
        INSERT INTO ai_chat_sessions (session_id, patient_id, session_type, session_summary)
        VALUES ($1, $2, 'Health Query', $3)
        RETURNING *
      `;
      await pool.query(sessionQuery, [sessionId, patientId, query.substring(0, 100)]);
    } else {
      // Validate session exists and belongs to user
      const sessionCheckQuery = `
        SELECT session_id FROM ai_chat_sessions 
        WHERE session_id = $1 AND patient_id = $2
      `;
      const sessionCheckResult = await pool.query(sessionCheckQuery, [sessionId, patientId]);
      
      if (sessionCheckResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found or does not belong to user'
        });
      }
    }

    // Prepare request to AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const aiRequestBody = {
      query: query,
      session_id: sessionId
    };

    // Add image if provided
    if (image_url) {
      aiRequestBody.image_url = image_url;
    }

    // Call AI service with user's authentication token
    let aiResponse;
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : '';
      
      const response = await fetch(`${aiServiceUrl}/v1/agent/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aiRequestBody)
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      aiResponse = await response.json();
    } catch (error) {
      console.error('Error calling AI service:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get response from AI service'
      });
    }

    // Extract response data
    const {
      reply = 'I encountered an issue processing your request. Please try again.',
      action = 'general_response',
      crisis_detected = false,
      crisis_type = null
    } = aiResponse;

    // Save user message to chat logs
    const userMessageQuery = `
      INSERT INTO ai_chat_logs (user_id, user_id_uuid, message_content, sender, timestamp, media_attachments, session_id)
      VALUES ($1, (SELECT user_id_uuid FROM users WHERE user_id = $1), $2, 'User', NOW(), $3, $4)
      RETURNING log_id
    `;
    await pool.query(userMessageQuery, [userId, query, image_url || null, sessionId]);
    

    // Save AI response to chat logs
    const aiMessageQuery = `
      INSERT INTO ai_chat_logs (user_id, user_id_uuid, message_content, sender, timestamp, ai_metadata, session_id)
      VALUES ($1, (SELECT user_id_uuid FROM users WHERE user_id = $1), $2, 'AI', NOW(), $3, $4)
      RETURNING log_id
    `;
    
    const aiMetadata = JSON.stringify({
      action: action,
      crisis_detected: crisis_detected,
      crisis_type: crisis_type
    });
    
    await pool.query(aiMessageQuery, [userId, reply, aiMetadata, sessionId]);

    // Update session with crisis flag if detected
    if (crisis_detected) {
      const crisisQuery = `
        UPDATE ai_chat_sessions
        SET crisis_detected = true, crisis_type = $1
        WHERE session_id = $2
      `;
      await pool.query(crisisQuery, [crisis_type, sessionId]);

      // Create crisis intervention record
      const interventionQuery = `
        INSERT INTO crisis_interventions (session_id, patient_id, crisis_level, crisis_keywords, action_taken)
        VALUES ($1, $2, 'High', $3, 'Automated detection and response')
        RETURNING intervention_id
      `;
      await pool.query(interventionQuery, [sessionId, patientId, 'crisis detected']);
    }

    // Return response
    res.status(200).json({
      session_id: sessionId,
      reply: reply,
      action: action,
      crisis_detected: crisis_detected,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in sendChatQuery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/ai/sessions
 * Get all past AI conversations for the authenticated user
 */
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get patient ID
    const patientQuery = 'SELECT patient_id FROM patients WHERE user_id = $1';
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }
    
    const patientId = patientResult.rows[0].patient_id;

    // Get all sessions for the patient
    const sessionsQuery = `
      SELECT 
        session_id,
        started_at,
        session_summary,
        session_type,
        started_at as last_updated,
        crisis_detected as crisis_flag
      FROM ai_chat_sessions
      WHERE patient_id = $1
      ORDER BY started_at DESC
    `;
    
    const sessionsResult = await pool.query(sessionsQuery, [patientId]);
    
    res.status(200).json(sessionsResult.rows);
    
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
 }
};

/**
 * GET /api/ai/sessions/:session_id/messages
 * Get conversation messages for a specific session
 */
const getSessionMessages = async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = req.user.userId;
    
    // Validate session belongs to user
    const patientQuery = 'SELECT patient_id FROM patients WHERE user_id = $1';
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }
    
    const patientId = patientResult.rows[0].patient_id;
    
    // Check if session belongs to user
    const sessionCheckQuery = `
      SELECT session_id FROM ai_chat_sessions 
      WHERE session_id = $1 AND patient_id = $2
    `;
    const sessionCheckResult = await pool.query(sessionCheckQuery, [session_id, patientId]);
    
    if (sessionCheckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or does not belong to user'
      });
    }

    // Get messages for the session
    const messagesQuery = `
      SELECT
        sender as role,
        message_content as message,
        media_attachments as image_url,
        timestamp
      FROM ai_chat_logs
      WHERE session_id = $1
      ORDER BY timestamp ASC
    `;
    
    const messagesResult = await pool.query(messagesQuery, [session_id]);
    
    res.status(200).json(messagesResult.rows);
  } catch (error) {
    console.error('Error in getSessionMessages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/ai/sessions/:session_id
 * Soft-delete a stored conversation
 */
const deleteSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = req.user.userId;
    
    // Get patient ID
    const patientQuery = 'SELECT patient_id FROM patients WHERE user_id = $1';
    const patientResult = await pool.query(patientQuery, [userId]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }
    
    const patientId = patientResult.rows[0].patient_id;
    
    // Check if session belongs to user
    const sessionCheckQuery = `
      SELECT session_id FROM ai_chat_sessions 
      WHERE session_id = $1 AND patient_id = $2
    `;
    const sessionCheckResult = await pool.query(sessionCheckQuery, [session_id, patientId]);
    
    if (sessionCheckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or does not belong to user'
      });
    }

    // Soft delete: Update session to mark as deleted (using ended_at)
    const deleteQuery = `
      UPDATE ai_chat_sessions 
      SET ended_at = NOW()
      WHERE session_id = $1 AND patient_id = $2
    `;
    
    await pool.query(deleteQuery, [session_id, patientId]);
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
    
  } catch (error) {
    console.error('Error in deleteSession:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  sendChatQuery,
  getUserSessions,
  getSessionMessages,
  deleteSession
};