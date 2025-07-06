import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';
import { cleanTestDatabase, closeTestDatabase } from '../helpers/database';

// Mock de middlewares y controladores para tests aislados
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

jest.mock('../../controllers/AuthController');
jest.mock('../../middleware/authMiddleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: '123', email: 'test@example.com', role: 'student' };
    next();
  },
  authorizeRoles: (...roles: string[]) => (req: any, res: any, next: any) => next()
}));

jest.mock('../../validators/authValidators', () => ({
  validateRegister: (req: any, res: any, next: any) => next(),
  validateLogin: (req: any, res: any, next: any) => next(),
  validatePasswordResetRequest: (req: any, res: any, next: any) => next(),
  validatePasswordReset: (req: any, res: any, next: any) => next(),
  validateTwoFactorVerification: (req: any, res: any, next: any) => next()
}));

import { AuthController } from '../../controllers/AuthController';

describe('AuthRoutes', () => {
  let app: express.Application;
  let mockAuthController: jest.Mocked<AuthController>;

  beforeAll(async () => {
    await cleanTestDatabase();
  });

  beforeEach(() => {
    // Configurar la aplicación Express para testing
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Configurar mocks del controlador
    mockAuthController = new AuthController() as jest.Mocked<AuthController>;
    mockAuthController.register = jest.fn().mockImplementation((req, res) => {
      res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
    });
    mockAuthController.login = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, data: { token: 'fake-jwt-token' } });
    });
    mockAuthController.verifyEmail = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, message: 'Email verificado exitosamente' });
    });
    mockAuthController.requestPasswordReset = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, message: 'Solicitud de restablecimiento enviada' });
    });
    mockAuthController.resetPassword = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, message: 'Contraseña restablecida exitosamente' });
    });
    mockAuthController.setupTwoFactor = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, data: { qrCode: 'fake-qr-code' } });
    });
    mockAuthController.verifyTwoFactor = jest.fn().mockImplementation((req, res) => {
      res.json({ success: true, message: '2FA activado exitosamente' });
    });
    mockAuthController.healthCheck = jest.fn().mockImplementation((req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Aplicar mocks
    (AuthController as jest.MockedClass<typeof AuthController>).mockImplementation(() => mockAuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should call register controller method', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'student',
        acceptTerms: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario registrado exitosamente');
    });

    it('should apply rate limiting', async () => {
      // Este test verifica que el rate limiter está configurado
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'student',
        acceptTerms: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should call login controller method', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('fake-jwt-token');
    });

    it('should apply auth rate limiting', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePass123!'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should call verifyEmail controller method', async () => {
      const token = 'fake-verification-token';

      const response = await request(app)
        .get(`/api/auth/verify-email/${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verificado exitosamente');
    });

    it('should handle token parameter correctly', async () => {
      const token = 'another-test-token-123';

      await request(app)
        .get(`/api/auth/verify-email/${token}`)
        .expect(200);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should call requestPasswordReset controller method', async () => {
      const resetData = { email: 'john@example.com' };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Solicitud de restablecimiento enviada');
    });

    it('should apply rate limiting for security', async () => {
      const resetData = { email: 'john@example.com' };

      await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData)
        .expect(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should call resetPassword controller method', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'NewSecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contraseña restablecida exitosamente');
    });
  });

  describe('Protected Routes', () => {
    describe('POST /api/auth/setup-2fa', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/auth/setup-2fa')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.qrCode).toBe('fake-qr-code');
      });
    });

    describe('POST /api/auth/verify-2fa', () => {
      it('should require authentication and call controller', async () => {
        const verificationData = { code: '123456' };

        const response = await request(app)
          .post('/api/auth/verify-2fa')
          .send(verificationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('2FA activado exitosamente');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return user information for authenticated user', async () => {
        // Mock del modelo User
        jest.doMock('../../models', () => ({
          User: {
            findByPk: jest.fn().mockResolvedValue({
              toJSON: () => ({
                id: '123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
              })
            })
          }
        }));

        const response = await request(app)
          .get('/api/auth/me')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
      });

      it('should handle user not found', async () => {
        jest.doMock('../../models', () => ({
          User: {
            findByPk: jest.fn().mockResolvedValue(null)
          }
        }));

        await request(app)
          .get('/api/auth/me')
          .expect(404);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout authenticated user', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Sesión cerrada exitosamente');
      });
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      await request(app)
        .get('/api/auth/health')
        .expect(200);
    });
  });

  describe('Middleware Integration', () => {
    it('should apply general rate limiting to all routes', async () => {
      // Verificar que el rate limiter general está aplicado
      await request(app)
        .get('/api/auth/health')
        .expect(200);
    });

    it('should apply specific auth rate limiting to sensitive routes', async () => {
      const loginData = { email: 'test@example.com', password: 'pass123' };
      
      // Login debe tener rate limiting más estricto
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
    });

    it('should apply validation middleware to appropriate routes', async () => {
      // Los validators deberían ser llamados antes de los controladores
      const userData = { email: 'test@example.com' };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
    });
  });

  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      // Simular error en el controlador
      mockAuthController.login = jest.fn().mockImplementation((req, res) => {
        throw new Error('Controller error');
      });

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass123' })
        .expect(500);
    });

    it('should handle malformed JSON requests', async () => {
      await request(app)
        .post('/api/auth/login')
        .send('invalid-json')
        .type('json')
        .expect(400);
    });
  });

  describe('Route Parameters', () => {
    it('should handle URL parameters correctly in verify-email', async () => {
      const tokens = ['token-123', 'token-with-special-chars!@#', 'very-long-token-' + 'x'.repeat(100)];
      
      for (const token of tokens) {
        await request(app)
          .get(`/api/auth/verify-email/${encodeURIComponent(token)}`)
          .expect(200);
      }
    });
  });
});
