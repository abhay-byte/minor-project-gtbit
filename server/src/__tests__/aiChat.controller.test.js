const { 
  sendChatQuery, 
  getUserSessions, 
  getSessionMessages, 
  deleteSession 
} = require('../api/controllers/aiChat.controller');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Mock the pool.query method
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

// Mock fetch
global.fetch = jest.fn();

// Mock request and response objects
const createMockRequest = (body = {}, params = {}, user = { userId: 1 }) => ({
  body,
  params,
  user
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

describe('AI Chat Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendChatQuery', () => {
    it('should return 400 if query is missing', async () => {
      const req = createMockRequest({ session_id: 'session-123' });
      const res = createMockResponse();

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Query is required'
      });
    });

    it('should return 404 if patient profile not found', async () => {
      const req = createMockRequest({ 
        query: 'I have a headache', 
        session_id: 'session-123' 
      });
      const res = createMockResponse();

      // Mock patient query returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient profile not found'
      });
    });

    it('should create a new session if session_id is not provided', async () => {
      const req = createMockRequest({ 
        query: 'I have a headache', 
        image_url: '/uploads/headache.jpg'
      });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session creation
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'mock-uuid-123' }] });
      
      // Mock fetch response from AI service
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          reply: 'This might be a tension headache', 
          action: 'recommend_consultation',
          crisis_detected: false 
        })
      });
      
      // Mock inserting user message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 1 }] });
      
      // Mock inserting AI message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 2 }] });

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        session_id: 'mock-uuid-123',
        reply: 'This might be a tension headache',
        action: 'recommend_consultation',
        crisis_detected: false,
        timestamp: expect.any(String)
      });
    });

    it('should continue existing session if session_id is provided', async () => {
      const req = createMockRequest({ 
        query: 'I have a headache', 
        session_id: 'existing-session-123'
      });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session check
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'existing-session-123' }] });
      
      // Mock fetch response from AI service
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          reply: 'This might be a tension headache', 
          action: 'recommend_consultation',
          crisis_detected: false 
        })
      });
      
      // Mock inserting user message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 1 }] });
      
      // Mock inserting AI message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 2 }] });

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        session_id: 'existing-session-123',
        reply: 'This might be a tension headache',
        action: 'recommend_consultation',
        crisis_detected: false,
        timestamp: expect.any(String)
      });
    });

    it('should handle AI service errors gracefully', async () => {
      const req = createMockRequest({ 
        query: 'I have a headache' 
      });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session creation
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'mock-uuid-123' }] });
      
      // Mock fetch response failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get response from AI service'
      });
    });

    it('should handle crisis detection', async () => {
      const req = createMockRequest({ 
        query: 'I feel very hopeless', 
      });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session creation
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'mock-uuid-123' }] });
      
      // Mock fetch response with crisis detected
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          reply: 'I understand you are feeling hopeless. This is concerning and you should seek immediate help.', 
          action: 'crisis_escalation',
          crisis_detected: true,
          crisis_type: 'Severe distress'
        })
      });
      
      // Mock inserting user message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 1 }] });
      
      // Mock inserting AI message
      pool.query.mockResolvedValueOnce({ rows: [{ log_id: 2 }] });
      
      // Mock updating session with crisis
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock inserting crisis intervention
      pool.query.mockResolvedValueOnce({ rows: [{ intervention_id: 1 }] });

      await sendChatQuery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        session_id: 'mock-uuid-123',
        reply: 'I understand you are feeling hopeless. This is concerning and you should seek immediate help.',
        action: 'crisis_escalation',
        crisis_detected: true,
        timestamp: expect.any(String)
      });
    });
  });

  describe('getUserSessions', () => {
    it('should return 404 if patient profile not found', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      // Mock patient query returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await getUserSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient profile not found'
      });
    });

    it('should return user sessions', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock sessions query
      const mockSessions = [
        {
          session_id: 'session-1',
          started_at: '2023-01-01T10:00:00Z',
          session_summary: 'Headache query',
          session_type: 'Health Query',
          last_updated: '2023-01-01T10:05:00Z',
          crisis_flag: false
        }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockSessions });

      await getUserSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSessions);
    });
  });

  describe('getSessionMessages', () => {
    it('should return 404 if patient profile not found', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await getSessionMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient profile not found'
      });
    });

    it('should return 404 if session does not belong to user', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session check returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await getSessionMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Session not found or does not belong to user'
      });
    });

    it('should return session messages', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session check
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'session-123' }] });
      
      // Mock messages query
      const mockMessages = [
        {
          role: 'user',
          message: 'I have a headache',
          image_url: null,
          timestamp: '2023-01-01T10:00:00Z'
        },
        {
          role: 'assistant',
          message: 'This might be a tension headache',
          image_url: null,
          timestamp: '2023-01-01T10:01:00Z'
        }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockMessages });

      await getSessionMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });
  });

  describe('deleteSession', () => {
    it('should return 404 if patient profile not found', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await deleteSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Patient profile not found'
      });
    });

    it('should return 404 if session does not belong to user', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session check returning empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      await deleteSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Session not found or does not belong to user'
      });
    });

    it('should delete session successfully', async () => {
      const req = createMockRequest({}, { session_id: 'session-123' });
      const res = createMockResponse();

      // Mock patient query
      pool.query.mockResolvedValueOnce({ rows: [{ patient_id: 1 }] });
      
      // Mock session check
      pool.query.mockResolvedValueOnce({ rows: [{ session_id: 'session-123' }] });
      
      // Mock delete query
      pool.query.mockResolvedValueOnce({});

      await deleteSession(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Session deleted successfully'
      });
    });
  });
});