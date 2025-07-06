import request from 'supertest';
import express from 'express';
import { AuthController } from '../../controllers/AuthController';
import { validatePasswordResetRequest, validatePasswordReset } from '../../validators/authValidators';
import { validationResult } from 'express-validator';
import { initTestDatabase, closeTestDatabase, cleanTestDatabase } from '../helpers/database';
import { User } from '../../models';

describe('AuthController - Password Reset Tests', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeAll(async () => {
    await initTestDatabase();
    
    app = express();
    app.use(express.json());
    authController = new AuthController();

    // Middleware para manejar errores de validación
    const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    // Configurar rutas para reset de contraseña
    app.post('/api/auth/request-password-reset', validatePasswordResetRequest, handleValidationErrors, (req, res) => {
      authController.requestPasswordReset(req, res);
    });

    app.post('/api/auth/reset-password', validatePasswordReset, handleValidationErrors, (req, res) => {
      authController.resetPassword(req, res);
    });
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('POST /api/auth/request-password-reset', () => {
    it('should accept valid email for password reset request', async () => {
      // Crear usuario primero
      await User.create({
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        emailVerified: true
      });

      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enlace de recuperación');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'nonexistent@example.com'
        });

      // Por seguridad, debería devolver el mismo mensaje
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'invalid-email'
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

  describe('POST /api/auth/reset-password', () => {
    it('should validate password reset token format', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'short',
          newPassword: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'token',
            msg: 'Token inválido'
          })
        ])
      );
    });

    it('should validate new password strength', async () => {
      const validToken = 'a'.repeat(32); // Token de 32 caracteres

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: validToken,
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'newPassword'
          })
        ])
      );
    });

    it('should reject empty token and password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(4); // token required, token invalid, password required, password weak
    });
  });
});
