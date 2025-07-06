import request from 'supertest';
import express from 'express';
import { initTestDatabase, closeTestDatabase, cleanTestDatabase } from '../helpers/database';
import { User } from '../../models';
import { AuthController } from '../../controllers/AuthController';
import { validateRegister, validateLogin } from '../../validators/authValidators';
import { validationResult } from 'express-validator';

describe('AuthController Integration Tests - Real Database', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeAll(async () => {
    // Configurar base de datos de test
    await initTestDatabase();
    
    // Configurar aplicación Express
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
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

    // Configurar rutas
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

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    await cleanTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.');
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.user.firstName).toBe(validUser.firstName);
      expect(response.body.data.user.lastName).toBe(validUser.lastName);
      expect(response.body.data.user.passwordHash).toBeUndefined(); // No debe devolver la contraseña
      expect(response.body.data.user.emailVerificationToken).toBeUndefined(); // No debe devolver el token

      // Verificar que el usuario se guardó en la base de datos
      const savedUser = await User.findOne({ where: { email: validUser.email } });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.email).toBe(validUser.email);
      expect(savedUser?.firstName).toBe(validUser.firstName);
      expect(savedUser?.lastName).toBe(validUser.lastName);
      expect(savedUser?.emailVerified).toBe(false);
    });

    it('should not register user with duplicate email', async () => {
      // Crear usuario primero
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Intentar registrar el mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('El correo electrónico ya está registrado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de entrada inválidos');
      expect(response.body.errors).toHaveLength(9); // Con más validaciones detalladas
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
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

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'weak'
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
          ...validUser,
          firstName: 'Test123'
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

    it('should require acceptTerms to be true', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
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
    const validUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true
    };

    beforeEach(async () => {
      // Crear usuario para las pruebas de login
      await request(app)
        .post('/api/auth/register')
        .send(validUser);
      
      // Verificar email manualmente en la base de datos para poder hacer login
      const user = await User.findOne({ where: { email: validUser.email } });
      if (user) {
        await user.update({ emailVerified: true });
      }
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Inicio de sesión exitoso');
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should fail login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: validUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales incorrectas');
    });

    it('should fail login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales incorrectas');
    });

    it('should validate login fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(2); // email, password
    });

    it('should validate email format in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: validUser.password
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
