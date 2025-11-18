// src/api/controllers/__tests__/auth.controller.test.js
const { register, login } = require('../auth.controller');
const db = require('../../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database module
jest.mock('../../../config/db');

// Mock JWT
jest.mock('jsonwebtoken');

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          phone_number: '1234567890',
          role: 'Patient'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database responses
      db.query.mockResolvedValueOnce({ rows: [] }); // No existing user
      db.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'Patient',
          created_at: new Date(),
          user_id_uuid: 'uuid-123'
        }]
      }); // User creation
      db.query.mockResolvedValueOnce({ rows: [] }); // Patient profile creation

      // Mock bcrypt
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');

      // Mock JWT
      jwt.sign = jest.fn().mockReturnValue('mocked_jwt_token');

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        token: 'mocked_jwt_token',
        user: {
          user_id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'Patient',
          created_at: expect.any(Date)
        }
      });
    });

    it('should return error if required fields are missing', async () => {
      const req = {
        body: {
          email: 'test@example.com'
          // Missing other required fields
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, password, full name, and role are required'
      });
    });

    it('should return error if user already exists', async () => {
      const req = {
        body: {
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Existing User',
          phone_number: '1234567890',
          role: 'Patient'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database response - user already exists
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, email: 'existing@example.com' }]
      });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists'
      });
    });

    it('should return error for invalid role', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          phone_number: '1234567890',
          role: 'InvalidRole'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid role. Must be one of: Patient, Professional, NGO, Admin'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with correct credentials', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database response - user exists
      db.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          full_name: 'Test User',
          role: 'Patient',
          user_id_uuid: 'uuid-123'
        }]
      });

      // Mock bcrypt
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      // Mock JWT
      jwt.sign = jest.fn().mockReturnValue('mocked_jwt_token');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        token: 'mocked_jwt_token',
        user: {
          user_id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'Patient'
        }
      });
    });

    it('should return error if required fields are missing', async () => {
      const req = {
        body: {
          email: 'test@example.com'
          // Missing password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and password are required'
      });
    });

    it('should return error if user does not exist', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database response - no user found
      db.query.mockResolvedValueOnce({ rows: [] });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password'
      });
    });

    it('should return error if password is incorrect', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrong_password'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database response - user exists
      db.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          full_name: 'Test User',
          role: 'Patient',
          user_id_uuid: 'uuid-123'
        }]
      });

      // Mock bcrypt - password comparison fails
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password'
      });
    });
  });
});