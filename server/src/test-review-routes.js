// Test script for review routes using Supertest
const request = require('supertest');
const app = require('./app');

describe('Review Routes', () => {
  // Test authentication required
  test('POST /api/reviews should require authentication', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send({
        target_type: 'Professional',
        target_id: 1,
        rating: 5
      });
    
    expect(response.status).toBe(403); // Should require auth token
    expect(response.body.message).toBe('A token is required for authentication.');
  });

 test('GET /api/reviews/me should require authentication', async () => {
    const response = await request(app)
      .get('/api/reviews/me');
    
    expect(response.status).toBe(403); // Should require auth token
    expect(response.body.message).toBe('A token is required for authentication.');
  });

  test('GET /api/reviews/:id should require authentication', async () => {
    const response = await request(app)
      .get('/api/reviews/1');
    
    expect(response.status).toBe(403); // Should require auth token
    expect(response.body.message).toBe('A token is required for authentication.');
  });

  test('PUT /api/reviews/:id should require authentication', async () => {
    const response = await request(app)
      .put('/api/reviews/1')
      .send({ rating: 4 });
    
    expect(response.status).toBe(403); // Should require auth token
    expect(response.body.message).toBe('A token is required for authentication.');
  });

  test('DELETE /api/reviews/:id should require authentication', async () => {
    const response = await request(app)
      .delete('/api/reviews/1');
    
    expect(response.status).toBe(403); // Should require auth token
    expect(response.body.message).toBe('A token is required for authentication.');
  });
});

// Run the tests if this file is executed directly
if (require.main === module) {
  const runTests = async () => {
    try {
      await request(app)
        .post('/api/reviews')
        .send({
          target_type: 'Professional',
          target_id: 1,
          rating: 5
        })
        .then(response => {
          console.log('POST /api/reviews without auth - Status:', response.status);
          console.log('Response:', response.body);
        });
    } catch (error) {
      console.error('Error testing routes:', error);
    }
  };

  runTests();
}