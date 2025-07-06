import request from 'supertest';
import express from 'express';

// Test simple para verificar que Jest funciona
describe('Jest Testing Framework', () => {
  it('should work with basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });

  it('should work with async/await', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('success'), 100);
    });

    const result = await promise;
    expect(result).toBe('success');
  });
});

// Test de integración básico para Express
describe('Express App Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Ruta de prueba simple
    app.get('/test', (req, res) => {
      res.json({ message: 'Test successful', status: 'ok' });
    });

    app.post('/test', (req, res) => {
      const { name } = req.body;
      res.json({ message: `Hello ${name}`, received: req.body });
    });
  });

  it('should respond to GET /test', async () => {
    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body).toEqual({
      message: 'Test successful',
      status: 'ok'
    });
  });

  it('should respond to POST /test', async () => {
    const testData = { name: 'Jest', version: '1.0' };

    const response = await request(app)
      .post('/test')
      .send(testData)
      .expect(200);

    expect(response.body.message).toBe('Hello Jest');
    expect(response.body.received).toEqual(testData);
  });

  it('should handle JSON parsing', async () => {
    const response = await request(app)
      .post('/test')
      .send({ name: 'TestUser' })
      .set('Content-Type', 'application/json')
      .expect(200);

    expect(response.body.message).toBe('Hello TestUser');
  });
});
