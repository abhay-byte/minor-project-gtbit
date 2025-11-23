const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Import the app with CORS configuration
const app = require('../app');

describe('CORS Configuration', () => {
  test('should allow requests from frontend origin', async () => {
    // Test preflight OPTIONS request
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Content-Type, Authorization');
    
    expect(response.status).toBe(204); // No content for preflight
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  test('should allow requests with proper headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('should handle requests without origin header', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
 });
});