import { Express } from 'express';
import request from 'supertest';

/**
 * Helper para crear usuarios de prueba
 */
export const createTestUser = async (app: Express, userData?: Partial<any>) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    acceptTerms: true
  };

  const user = { ...defaultUser, ...userData };
  
  const response = await request(app)
    .post('/api/auth/register')
    .send(user);

  return response;
};

/**
 * Helper para login de usuarios de prueba
 */
export const loginTestUser = async (app: Express, credentials?: { email: string; password: string }) => {
  const defaultCredentials = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  };

  const loginData = { ...defaultCredentials, ...credentials };
  
  const response = await request(app)
    .post('/api/auth/login')
    .send(loginData);

  return response;
};

/**
 * Helper para obtener token de autorización
 */
export const getAuthToken = async (app: Express, credentials?: { email: string; password: string }) => {
  const loginResponse = await loginTestUser(app, credentials);
  return loginResponse.body.data?.accessToken;
};

/**
 * Helper para crear requests autenticados
 */
export const authenticatedRequest = (app: Express, token: string) => {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`)
  };
};

/**
 * Helper para generar datos de usuario aleatorios
 */
export const generateRandomUser = () => {
  const randomId = Math.random().toString(36).substring(7);
  return {
    email: `test${randomId}@example.com`,
    password: 'TestPassword123!',
    firstName: `Test${randomId}`,
    lastName: 'User',
    acceptTerms: true
  };
};

/**
 * Matcher personalizado para Jest - verificar estructura de respuesta
 */
export const expectSuccessResponse = (response: any, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message');
};

export const expectErrorResponse = (response: any, expectedStatus = 400) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
};
