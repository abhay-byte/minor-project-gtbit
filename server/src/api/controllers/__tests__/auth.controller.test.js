// src/api/controllers/__tests__/auth.controller.test.js

const { register, login } = require('../auth.controller');
const db = require('../../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the external dependencies
jest.mock('../../../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(), // Mock the connect method for transactions
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // --- REGISTRATION TESTS ---
  describe('register', () => {
    it('should successfully register a new patient', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'Patient',
        dateOfBirth: '2000-01-01',
        gender: 'Other',
        address: '123 Test St',
      };

      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      // Mock the db.connect() call to return our mock client
      db.connect.mockResolvedValue(mockClient);

      // Set up a sequence of resolutions for each step of the transaction
      mockClient.query
        .mockResolvedValueOnce({}) // For BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }] }) // For INSERT into users
        .mockResolvedValueOnce({}); // For INSERT into patients

      bcrypt.hash.mockResolvedValue('hashedpassword');
      jwt.sign.mockReturnValue('testtoken');

      await register(mockReq, mockRes);

      // Assert the sequence of calls
      expect(db.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO users'), expect.any(Array));
      expect(mockClient.query).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO patients'), expect.any(Array));
      expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
      expect(mockClient.release).toHaveBeenCalledTimes(1);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'testtoken' }));
    });

    it('should return 409 if email already exists', async () => {
        mockReq.body = { email: 'test@example.com', password: 'password123', fullName: 'Test User', role: 'Patient' };

        const mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };
        db.connect.mockResolvedValue(mockClient);
        
        // Mock the sequence for a failed transaction
        mockClient.query
          .mockResolvedValueOnce({}) // For BEGIN
          .mockRejectedValueOnce({ code: '23505' }); // INSERT into users fails

        bcrypt.hash.mockResolvedValue('hashedpassword');

        await register(mockReq, mockRes);
        
        // Assert the sequence of calls for the rollback path
        expect(db.connect).toHaveBeenCalledTimes(1);
        expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
        expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO users'), expect.any(Array));
        expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
        expect(mockClient.release).toHaveBeenCalledTimes(1);

        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'An account with this email already exists.' });
    });


    it('should return 400 for missing required fields', async () => {
      mockReq.body = { email: 'test@example.com' };
      await register(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email, password, full name, and role are required.' });
    });
  });

  // --- LOGIN TESTS (no changes needed) ---
  describe('login', () => {
    it('should successfully log in a user with correct credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = { user_id: 1, email: 'test@example.com', password_hash: 'hashedpassword', full_name: 'Test User', role: 'Patient' };
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('testtoken');

      await login(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com']);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'testtoken' }));
    });

    it('should return 401 for a non-existent user', async () => {
      mockReq.body = { email: 'nouser@example.com', password: 'password123' };
      db.query.mockResolvedValue({ rows: [] });
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });

    it('should return 401 for incorrect password', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = { user_id: 1, password_hash: 'hashedpassword' };
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });
  });
});

