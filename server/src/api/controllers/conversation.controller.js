const db = require('../../config/db');

// GET /api/conversations - Fetches the list of active conversations for the user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user info is attached by auth middleware

    // First, check if the user is a patient or professional
    const userCheckQuery = `
      SELECT role 
      FROM users 
      WHERE user_id = $1
    `;
    const userResult = await db.query(userCheckQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const userRole = userResult.rows[0].role;
    let conversations = [];

    if (userRole === 'Patient') {
      // For patients, get conversations where they are the patient
      const query = `
        SELECT 
          pdc.conversation_id,
          CONCAT(p.full_name) AS other_user_name,
          pdc.last_message_at,
          pdc.is_active,
          pdc.conversation_type
        FROM patient_doctor_conversations pdc
        JOIN professionals prof ON pdc.professional_id = prof.professional_id
        JOIN users p ON prof.user_id = p.user_id
        WHERE pdc.patient_id = (
          SELECT patient_id 
          FROM patients 
          WHERE user_id = $1
        )
        ORDER BY pdc.last_message_at DESC NULLS LAST
      `;
      const result = await db.query(query, [userId]);
      conversations = result.rows.map(row => ({
        conversation_id: row.conversation_id,
        other_user_name: row.other_user_name,
        last_message_at: row.last_message_at,
        is_active: row.is_active,
        conversation_type: row.conversation_type
      }));
    } else if (userRole === 'Professional') {
      // For professionals, get conversations where they are the professional
      const query = `
        SELECT 
          pdc.conversation_id,
          CONCAT(pa.full_name) AS other_user_name,
          pdc.last_message_at,
          pdc.is_active,
          pdc.conversation_type
        FROM patient_doctor_conversations pdc
        JOIN patients pat ON pdc.patient_id = pat.patient_id
        JOIN users pa ON pat.user_id = pa.user_id
        WHERE pdc.professional_id = (
          SELECT professional_id 
          FROM professionals 
          WHERE user_id = $1
        )
        ORDER BY pdc.last_message_at DESC NULLS LAST
      `;
      const result = await db.query(query, [userId]);
      conversations = result.rows.map(row => ({
        conversation_id: row.conversation_id,
        other_user_name: row.other_user_name,
        last_message_at: row.last_message_at,
        is_active: row.is_active,
        conversation_type: row.conversation_type
      }));
    } else {
      return res.status(403).json({ 
        success: false, 
        error: 'Only patients and professionals can access conversations' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: conversations 
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// GET /api/conversations/:id/messages - Fetches the message history for a specific thread
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format'
      });
    }
    
    const userId = req.user.userId; // Assuming user info is attached by auth middleware

    // Verify that the user has access to this conversation
    const conversationCheckQuery = `
      SELECT 
        pdc.conversation_id,
        p.patient_id,
        prof.professional_id
      FROM patient_doctor_conversations pdc
      JOIN patients p ON pdc.patient_id = p.patient_id
      JOIN professionals prof ON pdc.professional_id = prof.professional_id
      WHERE pdc.conversation_id = $1
    `;
    const conversationResult = await db.query(conversationCheckQuery, [id]);

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
    }

    const conversation = conversationResult.rows[0];
    const userCheckQuery = `
      SELECT role
      FROM users
      WHERE user_id = $1
    `;
    const userResult = await db.query(userCheckQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const userRole = userResult.rows[0].role;
    let hasAccess = false;

    if (userRole === 'Patient') {
      const patientId = await db.query(
        'SELECT patient_id FROM patients WHERE user_id = $1', 
        [userId]
      );
      hasAccess = patientId.rows[0]?.patient_id === conversation.patient_id;
    } else if (userRole === 'Professional') {
      const professionalId = await db.query(
        'SELECT professional_id FROM professionals WHERE user_id = $1', 
        [userId]
      );
      hasAccess = professionalId.rows[0]?.professional_id === conversation.professional_id;
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have access to this conversation' 
      });
    }

    // Get messages for the conversation
    const query = `
      SELECT 
        m.message_id,
        m.sender_type,
        m.message_content,
        m.message_type,
        m.attachment_url,
        m.sent_at,
        m.is_read
      FROM messages m
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at ASC
    `;
    const result = await db.query(query, [id]);
    
    const messages = result.rows.map(row => ({
      message_id: row.message_id,
      sender_type: row.sender_type,
      message_content: row.message_content,
      message_type: row.message_type,
      attachment_url: row.attachment_url,
      sent_at: row.sent_at,
      is_read: row.is_read
    }));

    res.status(200).json({ 
      success: true, 
      data: messages 
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// POST /api/conversations/:id/messages - Sends a new message
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation ID format'
      });
    }
    
    const { message_content, message_type = 'Text' } = req.body;
    const userId = req.user.userId; // Assuming user info is attached by auth middleware

    // Validate required fields
    if (!message_content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message content is required' 
      });
    }

    // Verify that the user has access to this conversation
    const conversationCheckQuery = `
      SELECT 
        pdc.conversation_id,
        p.patient_id,
        prof.professional_id
      FROM patient_doctor_conversations pdc
      JOIN patients p ON pdc.patient_id = p.patient_id
      JOIN professionals prof ON pdc.professional_id = prof.professional_id
      WHERE pdc.conversation_id = $1
    `;
    const conversationResult = await db.query(conversationCheckQuery, [id]);

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
    }

    const conversation = conversationResult.rows[0];
    
    // Determine sender type based on user role
    const userCheckQuery = `
      SELECT u.role, p.patient_id, prof.professional_id
      FROM users u
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN professionals prof ON u.user_id = prof.user_id
      WHERE u.user_id = $1
    `;
    const userResult = await db.query(userCheckQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = userResult.rows[0];
    let senderType = 'User'; // Default
    let hasAccess = false;

    if (user.role === 'Patient' && user.patient_id === conversation.patient_id) {
      senderType = 'Patient';
      hasAccess = true;
    } else if (user.role === 'Professional' && user.professional_id === conversation.professional_id) {
      senderType = 'Doctor';
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have access to this conversation' 
      });
    }

    // Insert the new message
    const insertQuery = `
      INSERT INTO messages (
        conversation_id,
        sender_user_id,
        sender_type,
        message_content,
        message_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING message_id, sent_at
    `;
    const result = await db.query(insertQuery, [
      id,
      userId,
      senderType,
      message_content,
      message_type
    ]);

    // Update the last_message_at in the conversation
    const updateConversationQuery = `
      UPDATE patient_doctor_conversations
      SET last_message_at = $2
      WHERE conversation_id = $1
    `;
    await db.query(updateConversationQuery, [id, result.rows[0].sent_at]);

    res.status(201).json({ 
      success: true, 
      data: {
        message_id: result.rows[0].message_id,
        sent_at: result.rows[0].sent_at
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};