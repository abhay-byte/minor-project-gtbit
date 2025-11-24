const request = require('supertest');
const express = require('express');
const { getConversations, getMessages, sendMessage } = require('../api/controllers/conversation.controller');

// Mock the database before importing the controller
jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn()
}));

const db = require('../config/db');

// Mock express app for testing
const app = express();
app.use(express.json());

// Mock user authentication middleware for testing
const mockAuth = (req, res, next) => {
  req.user = { userId: 1, role: 'Patient' }; // Mock user
  next();
};

// Apply mock auth middleware to test routes
app.get('/api/conversations', mockAuth, getConversations);
app.get('/api/conversations/:id/messages', mockAuth, getMessages);
app.post('/api/conversations/:id/messages', mockAuth, sendMessage);

describe('Conversation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  // Mock data for testing
  const mockConversation = {
    conversation_id: '123e4567-e89b-12d3-a456-426614174000',
    other_user_name: 'Dr. Sharma',
    last_message_at: new Date(),
    is_active: true,
    conversation_type: 'Appointment'
  };

  const mockMessage = {
    message_id: '123e4567-e89b-12d3-a456-426614174999',
    sender_type: 'Patient',
    message_content: 'Hello, doctor!',
    message_type: 'Text',
    attachment_url: null,
    sent_at: new Date(),
    is_read: false
  };

  describe('getConversations', () => {
    it('should return conversations for a patient', async () => {
      // Mock the database query for patient role
      db.query
        .mockResolvedValueOnce({ // Check user role
          rows: [{
            role: 'Patient'
          }]
        })
        .mockResolvedValueOnce({ // Get patient conversations
          rows: [mockConversation]
        });

      const response = await request(app)
        .get('/api/conversations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('conversation_id');
      expect(response.body.data[0]).toHaveProperty('other_user_name');
      expect(response.body.data[0]).toHaveProperty('last_message_at');
      expect(response.body.data[0]).toHaveProperty('is_active');
      expect(response.body.data[0]).toHaveProperty('conversation_type');
    });

    it('should return conversations for a professional', async () => {
      // Mock the database query for professional role
      db.query
        .mockResolvedValueOnce({ // Check user role
          rows: [{
            role: 'Professional'
          }]
        })
        .mockResolvedValueOnce({ // Get professional conversations
          rows: [mockConversation]
        });

      const response = await request(app)
        .get('/api/conversations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return 404 if user not found', async () => {
      // Mock the database query to return no user
      db.query
        .mockResolvedValueOnce({ // Check user role
          rows: []
        });

      const response = await request(app)
        .get('/api/conversations')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 403 for unauthorized user roles', async () => {
      // Mock the database query for an unauthorized role
      db.query
        .mockResolvedValueOnce({ // Check user role
          rows: [{
            role: 'Admin' // Not Patient or Professional
          }]
        });

      const response = await request(app)
        .get('/api/conversations')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only patients and professionals can access conversations');
    });
  });

  describe('getMessages', () => {
    it('should return messages for a valid conversation', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock database queries
      db.query
        .mockResolvedValueOnce({ // Check conversation access
          rows: [{
            conversation_id: conversationId,
            patient_id: 1,
            professional_id: 1
          }]
        })
        .mockResolvedValueOnce({ // Check user role
          rows: [{
            role: 'Patient'
          }]
        })
        .mockResolvedValueOnce({ // Get patient ID
          rows: [{
            patient_id: 1
          }]
        })
        .mockResolvedValueOnce({ // Get messages
          rows: [mockMessage]
        });

      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('message_id');
      expect(response.body.data[0]).toHaveProperty('sender_type');
      expect(response.body.data[0]).toHaveProperty('message_content');
      expect(response.body.data[0]).toHaveProperty('message_type');
      expect(response.body.data[0]).toHaveProperty('attachment_url');
      expect(response.body.data[0]).toHaveProperty('sent_at');
      expect(response.body.data[0]).toHaveProperty('is_read');
    });

    it('should return 400 if conversation ID is invalid format', async () => {
      const invalidConversationId = 'test-id'; // Invalid UUID format

      const response = await request(app)
        .get(`/api/conversations/${invalidConversationId}/messages`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid conversation ID format');
    });
    
    it('should return 404 if conversation not found', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174001';

      // Mock database query to return no conversation
      db.query
        .mockResolvedValueOnce({ // Check conversation access
          rows: [] // Empty result simulates conversation not found
        });

      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Conversation not found');
    });

    it('should return 403 if user does not have access to conversation', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock database queries
      db.query
        .mockResolvedValueOnce({ // Check conversation access
          rows: [{
            conversation_id: conversationId,
            patient_id: 1,
            professional_id: 1
          }]
        })
        .mockResolvedValueOnce({ // Check user role
          rows: [{
            role: 'Patient'
          }]
        })
        .mockResolvedValueOnce({ // Get patient ID (different from conversation)
          rows: [{
            patient_id: 99 // Different from conversation's patient_id
          }]
        });

      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You do not have access to this conversation');
    });
  });

  describe('sendMessage', () => {
    it('should send a new message successfully', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const messageData = {
        message_content: 'Test message content',
        message_type: 'Text'
      };

      // Mock database queries
      db.query
        .mockResolvedValueOnce({ // Check conversation exists
          rows: [{
            conversation_id: conversationId,
            patient_id: 1,
            professional_id: 1
          }]
        })
        .mockResolvedValueOnce({ // Check user role and IDs
          rows: [{
            role: 'Patient',
            patient_id: 1,
            professional_id: null
          }]
        })
        .mockResolvedValueOnce({ // Insert message
          rows: [{
            message_id: 'new-message-uuid',
            sent_at: new Date()
          }]
        })
        .mockResolvedValueOnce({}); // Update conversation last_message_at

      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message_id');
      expect(response.body.data).toHaveProperty('sent_at');
    });

    it('should return 400 if message content is missing', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const messageData = {
        message_type: 'Text'
        // message_content is missing
      };

      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send(messageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Message content is required');
    });

    it('should return 404 if conversation not found', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174001';
      const messageData = {
        message_content: 'Test message content',
        message_type: 'Text'
      };

      // Mock database query to return no conversation
      db.query
        .mockResolvedValueOnce({ // Check conversation exists
          rows: []
        });

      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send(messageData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Conversation not found');
    });

    it('should return 400 if conversation ID is invalid format', async () => {
      const invalidConversationId = 'test-id'; // Invalid UUID format
      const messageData = {
        message_content: 'Test message content',
        message_type: 'Text'
      };

      const response = await request(app)
        .post(`/api/conversations/${invalidConversationId}/messages`)
        .send(messageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid conversation ID format');
    });
    
    it('should return 403 if user does not have access to conversation', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const messageData = {
        message_content: 'Test message content',
        message_type: 'Text'
      };

      // Mock database queries
      db.query
        .mockResolvedValueOnce({ // Check conversation exists
          rows: [{
            conversation_id: conversationId,
            patient_id: 1,
            professional_id: 1
          }]
        })
        .mockResolvedValueOnce({ // Check user role and IDs
          rows: [{
            role: 'Patient',
            patient_id: 999, // Different from conversation's patient_id
            professional_id: null
          }]
        });

      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send(messageData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You do not have access to this conversation');
    });
  });

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});