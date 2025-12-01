const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock JWT token for testing
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('POST /api/signaling/room', () => {
  let validToken;
  let testAppointmentId;

  beforeAll(async () => {
    // Create a mock JWT token for testing
    const mockUser = { userId: 1, role: 'Patient' };
    validToken = jwt.sign(mockUser, JWT_SECRET);
    
    // For testing purposes, we'll use a real appointment ID from the database
    // In a real test scenario, you'd create a test appointment first
    testAppointmentId = 1; // Using a known appointment ID
  });

  test('should create room and return room_id and consultation_link', async () => {
    const response = await request(app)
      .post('/api/signaling/room')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ appointment_id: testAppointmentId })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('room_id');
    expect(response.body.data).toHaveProperty('consultation_link');
    expect(response.body.data.consultation_link).toContain('/room/');
    expect(response.body.data.room_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('should return 400 if appointment_id is missing', async () => {
    const response = await request(app)
      .post('/api/signaling/room')
      .set('Authorization', `Bearer ${validToken}`)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('appointment_id is required');
  });

  test('should return 404 if appointment does not exist', async () => {
    const response = await request(app)
      .post('/api/signaling/room')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ appointment_id: 999999 })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Appointment not found');
  });

  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .post('/api/signaling/room')
      .send({ appointment_id: testAppointmentId })
      .expect(403);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('A token is required for authentication');
  });

  test('should return 401 if invalid token is provided', async () => {
    const response = await request(app)
      .post('/api/signaling/room')
      .set('Authorization', 'Bearer invalid-token')
      .send({ appointment_id: testAppointmentId })
      .expect(401);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid Token');
  });
});