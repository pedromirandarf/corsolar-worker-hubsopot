const request = require('supertest');
const app = require('./app');

describe('App', () => {
  describe('GET /', () => {
    it('deve retornar informações da API', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('documentation');
      expect(response.body).toHaveProperty('docs');
      expect(response.body).toHaveProperty('health');
    });
  });

  describe('GET /health', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('GET /api-docs.json', () => {
    it('deve retornar documentação Swagger', async () => {
      const response = await request(app).get('/api-docs.json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });
  });

  describe('404 Handler', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app).get('/rota-inexistente');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
