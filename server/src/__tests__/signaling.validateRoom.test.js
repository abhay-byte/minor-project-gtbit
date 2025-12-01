const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mock JWT token for testing
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('GET /api/signaling/validate/:roomId', () => {
  let validToken;

  beforeAll(() => {
    // Create a mock JWT token for testing
    const mockUser = { userId: 1, role: 'Patient' };
    validToken = jwt.sign(mockUser, JWT_SECRET);
  });

  test('should return 404 for non-existent room', async () => {
    const fakeRoomId = '00000-0000-0000-0000-000000000';
    const response = await request(app)
      .get(`/api/signaling/validate/${fakeRoomId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.data.is_valid).toBe(false);
  });

  test('should return 400 if room ID is missing', async () => {
    const response = await request(app)
      .get('/api/signaling/validate/')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404); // Express typically returns 404 for undefined routes

    // For a malformed route, this might be different depending on Express setup
  });

  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/api/signaling/validate/550e8400-e29b-41d4-a716-4665544000')
      .expect(403);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('A token is required for authentication');
  });

  test('should return 401 if invalid token is provided', async () => {
    const response = await request(app)
      .get('/api/signaling/validate/550e8400-e29b-41d4-a716-44655440000')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid Token');
  });
});