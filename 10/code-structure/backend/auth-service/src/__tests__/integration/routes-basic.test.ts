/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';

// Mock del AuthController para evitar problemas con la base de datos
jest.mock('../../controllers/AuthController', () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Auth service is running',
        timestamp: new Date().toISOString()
      });
    }),
    register: jest.fn((req: any, res: any) => {
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente'
      });
    }),
    login: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Login exitoso'
      });
    }),
    verifyEmail: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente'
      });
    }),
    requestPasswordReset: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Email de recuperación enviado'
      });
    }),
    resetPassword: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });
    }),
    setupTwoFactor: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: '2FA configurado exitosamente'
      });
    }),
    verifyTwoFactor: jest.fn((req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: '2FA verificado exitosamente'
      });
    })
  }))
}));

// Mock de middlewares
jest.mock('../../middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 1, email: 'test@example.com', role: 'user' };
    next();
  }),
  authorizeRoles: jest.fn(() => (req, res, next) => next())
}));

// Mock de validadores
jest.mock('../../validators/authValidators', () => ({
  validateRegister: jest.fn((req, res, next) => next()),
  validateLogin: jest.fn((req, res, next) => next()),
  validatePasswordResetRequest: jest.fn((req, res, next) => next()),
  validatePasswordReset: jest.fn((req, res, next) => next()),
  validateTwoFactorVerification: jest.fn((req, res, next) => next())
}));

// Mock del rate limiter
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req, res, next) => next());
});

describe('Auth Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Auth service is running',
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Usuario registrado exitosamente'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Login exitoso'
      });
    });
  });
});
