const request = require('supertest');
const express = require('express');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create a separate test app to avoid conflicts with main server
const testApp = express();
testApp.use(express.json());

// Mock auth middleware for testing
testApp.use((req, res, next) => {
  // Simulate authenticated user
  req.user = {
    userId: 1,
    userUUID: uuidv4(),
    role: 'Patient',
    patientId: 1
  };
  next();
});

// Import and use the reminder routes
const reminderRoutes = require('../api/routes/reminders');
testApp.use('/api/reminders', reminderRoutes);

describe('POST /api/reminders/:id/log', () => {
  let testPatientId;
  let testReminderId;
  let authToken;

  beforeAll(async () => {
    // Create test user
    const userEmail = `test.reminder.${Date.now()}@example.com`;
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role, user_id_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
      [userEmail, 'hashedpassword', 'Test Patient', 'Patient', uuidv4()]
    );
    const userId = userResult.rows[0].user_id;

    const patientResult = await db.query(
      'INSERT INTO patients (user_id, date_of_birth, gender) VALUES ($1, $2, $3) RETURNING patient_id',
      [userId, '1990-01-01', 'Male']
    );
    testPatientId = patientResult.rows[0].patient_id;

    // Create test reminder directly without requiring a prescription
    testReminderId = uuidv4();
    await db.query(
      'INSERT INTO medicine_reminders (reminder_id, patient_id, medication_name, start_date, end_date) VALUES ($1, $2, $3, $4, $5)',
      [testReminderId, testPatientId, 'Test Medicine', '2025-01-01', '2025-01-31']
    );

    // Generate auth token (this is a simplified version - in real tests you'd use your actual auth mechanism)
    // For this test, we'll mock the authentication in the middleware above
    authToken = 'valid-token';
  });

  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM reminder_logs WHERE reminder_id = $1', [testReminderId]);
    await db.query('DELETE FROM medicine_reminders WHERE reminder_id = $1', [testReminderId]);
    await db.query('DELETE FROM patients WHERE patient_id = $1', [testPatientId]);
    await db.query('DELETE FROM users WHERE email LIKE $1', [`test.reminder.%@example.com`]);
  });

  test('should log reminder as Taken', async () => {
    const response = await request(testApp)
      .post(`/api/reminders/${testReminderId}/log`)
      .send({
        status: 'Taken',
        taken_time: '2025-01-15T08:05:00Z',
        notes: 'Taken with water'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('log_id');
    expect(response.body.data.status).toBe('Taken');
    expect(response.body.data.taken_time).toBe('2025-01-15T08:05:00Z');
    expect(response.body.data.notes).toBe('Taken with water');
  });

  test('should return 400 if status is missing', async () => {
    const response = await request(testApp)
      .post(`/api/reminders/${testReminderId}/log`)
      .send({
        taken_time: '2025-01-15T08:05:00Z'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Status is required');
  });

  test('should return 400 if status is invalid', async () => {
    const response = await request(testApp)
      .post(`/api/reminders/${testReminderId}/log`)
      .send({
        status: 'InvalidStatus'
      })
      .expect(400);

    expect(response.body.error).toContain('Invalid status');
  });

  test('should return 404 if reminder not found', async () => {
    const fakeReminderId = uuidv4();
    const response = await request(testApp)
      .post(`/api/reminders/${fakeReminderId}/log`)
      .send({
        status: 'Taken'
      })
      .expect(404);

    expect(response.body.error).toContain('Reminder not found');
  });
});