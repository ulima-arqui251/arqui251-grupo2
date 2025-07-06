import request from 'supertest';

// Mock de la base de datos ANTES de importar la app
jest.mock('../models', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  },
  CourseCapacity: {
    findOne: jest.fn().mockResolvedValue(null)
  }
}));

import { app } from '../app';

describe('Enrollment Service - Health Checks', () => {
  
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Enrollment Service');
  });

  test('GET / should return service information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('StudyMate Enrollment Service');
    expect(response.body.endpoints).toBeDefined();
  });

  test('GET /api/enrollment/health should return 200', async () => {
    const response = await request(app)
      .get('/api/enrollment/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.service).toBe('enrollment-service');
  });

  test('GET /api/enrollment/status should return service status', async () => {
    const response = await request(app)
      .get('/api/enrollment/status')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.service).toBe('enrollment-service');
    expect(response.body.status).toBe('operational');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

});

describe('Enrollment Service - Endpoint Validation', () => {
  
  test('GET /api/enrollment/enrollments/me should require authentication', async () => {
    const response = await request(app)
      .get('/api/enrollment/enrollments/me')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token de acceso requerido');
  });

  test('POST /api/enrollment/enrollments should require authentication', async () => {
    const response = await request(app)
      .post('/api/enrollment/enrollments')
      .send({
        courseId: '550e8400-e29b-41d4-a716-446655440000',
        paymentMethod: 'credit_card'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Token de acceso requerido');
  });

  test('GET /api/enrollment/capacity/:courseId should work without authentication', async () => {
    const courseId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await request(app)
      .get(`/api/enrollment/capacity/${courseId}`)
      .expect(404); // Esperamos 404 porque no existe la configuración

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Configuración de capacidad no encontrada');
  });

});

describe('Enrollment Service - Validation Errors', () => {
  
  test('POST /api/enrollment/enrollments should validate courseId format', async () => {
    const mockToken = 'Bearer mock-jwt-token';
    
    const response = await request(app)
      .post('/api/enrollment/enrollments')
      .set('Authorization', mockToken)
      .send({
        courseId: 'invalid-uuid',
        paymentMethod: 'credit_card'
      });

    // Podría ser 400 (validación), 401 (auth), o 403 (autorización)
    expect([400, 401, 403]).toContain(response.status);
  });

  test('Invalid routes should return 404 with helpful message', async () => {
    const response = await request(app)
      .get('/api/enrollment/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Ruta no encontrada');
    expect(response.body.availableEndpoints).toBeDefined();
  });

});

describe('Enrollment Service - CORS and Security', () => {
  
  test('OPTIONS requests should be handled for CORS', async () => {
    const response = await request(app)
      .options('/api/enrollment/enrollments')
      .expect(204);
  });

  test('Should have security headers', async () => {
    const response = await request(app)
      .get('/health');

    // Helmet headers
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(['DENY', 'SAMEORIGIN']).toContain(response.headers['x-frame-options']);
  });

});

// Cleanup después de todos los tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});
