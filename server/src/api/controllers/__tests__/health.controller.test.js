const { healthCheck, getApiInfo } = require('../health.controller');

// Mock the database query function
jest.mock('../../../config/db', () => ({
  query: jest.fn()
}));

const { query } = require('../../../config/db');

// Mock response object
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
};

describe('Health Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    test('should return healthy status when database connection is successful', async () => {
      // Mock successful database query
      query.mockResolvedValue({ rows: [{ '1': 1 }] });

      const req = {};
      const res = createMockResponse();

      await healthCheck(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'Clinico API',
          version: '1.0.0'
        })
      );
    });

    test('should return unhealthy status when database connection fails', async () => {
      // Mock failed database query
      query.mockRejectedValue(new Error('Database connection failed'));

      const req = {};
      const res = createMockResponse();

      await healthCheck(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should return unhealthy status when database query fails', async () => {
      // Mock failed database query
      query.mockRejectedValue(new Error('Unexpected error'));

      const req = {};
      const res = createMockResponse();

      await healthCheck(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          error: 'Database connection failed: Unexpected error'
        })
      );
    });
  });

  describe('getApiInfo', () => {
    test('should return API information and available endpoints', () => {
      const req = {};
      const res = createMockResponse();

      getApiInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Welcome to Clinico API',
          version: '1.0.0',
          status: 'running',
          timestamp: expect.any(String),
          endpoints: expect.objectContaining({
            health: expect.objectContaining({
              path: '/api/health'
            }),
            auth: expect.objectContaining({
              path: '/api/auth'
            }),
            users: expect.objectContaining({
              path: '/api/users'
            }),
            professionals: expect.objectContaining({
              path: '/api/professionals'
            }),
            appointments: expect.objectContaining({
              path: '/api/appointments'
            }),
            clinics: expect.objectContaining({
              path: '/api/clinics'
            }),
            prescriptions: expect.objectContaining({
              path: '/api/prescriptions'
            }),
            reviews: expect.objectContaining({
              path: '/api/reviews'
            }),
            vault: expect.objectContaining({
              path: '/api/vault'
            }),
            chat: expect.objectContaining({
              path: '/api/chat'
            })
          }),
          documentation: 'https://github.com/abhay-byte/minor-project-gtbit/blob/main/server/src/api.md'
        })
      );
    });
  });
});