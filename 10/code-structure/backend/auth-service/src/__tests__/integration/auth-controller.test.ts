import request from 'supertest';
import express from 'express';
import { AuthController } from '../../controllers/AuthController';
import { validateRegister, validateLogin } from '../../validators/authValidators';
import { validationResult } from 'express-validator';

// Mock del User model
jest.mock('../../models', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  }
}));

// Mock de los servicios
jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Auth Controller Integration Tests', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    authController = new AuthController();

    // Middleware para manejar errores de validación
    const handleValidationErrors = (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }
      next();
    };

    // Rutas de prueba
    app.post('/api/auth/register', validateRegister, handleValidationErrors, (req, res) => {
      authController.register(req, res);
    });

    app.post('/api/auth/login', validateLogin, handleValidationErrors, (req, res) => {
      authController.login(req, res);
    });

    app.get('/api/auth/health', (req, res) => {
      res.json({
        success: true,
        message: 'Auth Service is healthy',
        timestamp: new Date().toISOString()
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de entrada inválidos');
      expect(response.body.errors).toBeDefined();
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: true
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            msg: 'Debe ser un email válido'
          })
        ])
      );
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: true
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'password'
          })
        ])
      );
    });

    it('should validate firstName format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test123', // contiene números
          lastName: 'User',
          acceptTerms: true
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'firstName',
            msg: 'El nombre solo puede contener letras'
          })
        ])
      );
    });

    it('should require acceptTerms', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'acceptTerms'
          })
        ])
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate login fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate email format in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            msg: 'Debe ser un email válido'
          })
        ])
      );
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Auth Service is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
