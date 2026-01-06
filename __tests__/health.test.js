const request = require('supertest');
const app = require('../index');

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should have correct content-type', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

