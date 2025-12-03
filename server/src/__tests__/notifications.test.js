const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

describe('GET /api/notifications', () => {
  let authToken;
  let testUserId;
  let testNotificationId;

  beforeAll(async () => {
    // Create test user
    const userEmail = `test.notification.${Date.now()}@example.com`;
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role, user_id_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
      [userEmail, 'hashedpassword', 'Test User', 'Patient', uuidv4()]
    );
    testUserId = userResult.rows[0].user_id;

    // Create test notification
    testNotificationId = uuidv4();
    await db.query(
      'INSERT INTO notifications (notification_id, user_id, notification_type, title, message, is_read) VALUES ($1, $2, $3, $4, $5, $6)',
      [testNotificationId, testUserId, 'Appointment', 'Test Notification', 'Test message', false]
    );

    // Generate auth token (this is a simplified version - in real tests you'd use your actual auth mechanism)
    authToken = 'valid-token';
  });

  afterAll(async () => {
    await db.query('DELETE FROM notifications WHERE user_id = $1', [testUserId]);
    await db.query('DELETE FROM users WHERE email LIKE $1', [`test.notification.%@example.com`]);
  });

  test('should fetch notifications for user', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.metadata).toHaveProperty('unread_count');
  });

 test('should filter unread notifications', async () => {
    const response = await request(app)
      .get('/api/notifications?is_read=false')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.every(n => n.is_read === false)).toBe(true);
  });

  test('should mark notification as read', async () => {
    const response = await request(app)
      .put(`/api/notifications/${testNotificationId}/read`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

describe('PUT /api/notifications/:id/read', () => {
  let authToken;
  let testUserId;
  let testNotificationId;

  beforeAll(async () => {
    // Create test user
    const userEmail = `test.notification.read.${Date.now()}@example.com`;
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role, user_id_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
      [userEmail, 'hashedpassword', 'Test User Read', 'Patient', uuidv4()]
    );
    testUserId = userResult.rows[0].user_id;

    // Create test notification
    testNotificationId = uuidv4();
    await db.query(
      'INSERT INTO notifications (notification_id, user_id, notification_type, title, message, is_read) VALUES ($1, $2, $3, $4, $5, $6)',
      [testNotificationId, testUserId, 'Appointment', 'Test Notification Read', 'Test message read', false]
    );

    // Generate auth token
    authToken = 'valid-token';
  });

  afterAll(async () => {
    await db.query('DELETE FROM notifications WHERE user_id = $1', [testUserId]);
    await db.query('DELETE FROM users WHERE email LIKE $1', [`test.notification.read.%@example.com`]);
  });

  test('should mark notification as read', async () => {
    const response = await request(app)
      .put(`/api/notifications/${testNotificationId}/read`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Notification marked as read');
  });

  test('should return 404 if notification not found', async () => {
    const fakeNotificationId = uuidv4();
    const response = await request(app)
      .put(`/api/notifications/${fakeNotificationId}/read`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Notification not found');
  });
});