const { query } = require('../../config/db');
const os = require('os');

/**
 * Health Check Endpoint
 * GET /api/health
 * Check if the API server is running and healthy.
 */
const healthCheck = async (req, res) => {
 try {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Check database connection by running a simple query
    let dbHealthy = false;
    let dbError = null;
    
    try {
      await query('SELECT 1');
      dbHealthy = true;
    } catch (error) {
      dbError = error.message;
      dbHealthy = false;
    }
    
    // Calculate uptime in seconds
    const uptime = Math.floor(process.uptime());
    
    // Prepare response based on health status
    if (dbHealthy) {
      return res.status(200).json({
        status: 'healthy',
        timestamp,
        uptime,
        service: 'Clinico API',
        version: '1.0.0'
      });
    } else {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp,
        error: `Database connection failed: ${dbError}`
      });
    }
  } catch (error) {
    // If there's an error in the health check itself
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
 }
};

/**
 * Root Endpoint
 * GET /api
 * Get API information and available routes.
 */
const getApiInfo = (req, res) => {
  const timestamp = new Date().toISOString();
  
  return res.status(200).json({
    message: 'Welcome to Clinico API',
    version: '1.0.0',
    status: 'running',
    timestamp,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      professionals: '/api/professionals',
      appointments: '/api/appointments',
      clinics: '/api/clinics',
      prescriptions: '/api/prescriptions',
      reviews: '/api/reviews',
      vault: '/api/vault'
    },
    documentation: 'https://docs.clinico.com/api'
  });
};

module.exports = {
  healthCheck,
  getApiInfo
};