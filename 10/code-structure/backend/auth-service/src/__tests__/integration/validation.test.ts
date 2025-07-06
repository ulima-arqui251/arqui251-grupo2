import request from 'supertest';
import express from 'express';

describe('Auth API Validation Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Endpoint simulado para probar validaciones
    app.post('/api/auth/test-validation', (req, res) => {
      const { email, password, firstName, lastName } = req.body;
      
      const errors: any[] = [];

      // Validar email
      if (!email) {
        errors.push({ field: 'email', message: 'Email es requerido' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ field: 'email', message: 'Email debe ser válido' });
      }

      // Validar password
      if (!password) {
        errors.push({ field: 'password', message: 'Password es requerido' });
      } else if (password.length < 8) {
        errors.push({ field: 'password', message: 'Password debe tener al menos 8 caracteres' });
      }

      // Validar firstName
      if (!firstName) {
        errors.push({ field: 'firstName', message: 'Nombre es requerido' });
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName)) {
        errors.push({ field: 'firstName', message: 'Nombre solo puede contener letras' });
      }

      // Validar lastName
      if (!lastName) {
        errors.push({ field: 'lastName', message: 'Apellido es requerido' });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        });
      }

      res.status(200).json({
        success: true,
        message: 'Datos válidos',
        data: { email, firstName, lastName }
      });
    });
  });

  describe('POST /api/auth/test-validation', () => {
    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/test-validation')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/test-validation')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Email debe ser válido'
          })
        ])
      );
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/test-validation')
        .send({
          email: 'test@example.com',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'Password debe tener al menos 8 caracteres'
          })
        ])
      );
    });

    it('should reject firstName with numbers', async () => {
      const response = await request(app)
        .post('/api/auth/test-validation')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          firstName: 'John123',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'firstName',
            message: 'Nombre solo puede contener letras'
          })
        ])
      );
    });

    it('should accept valid data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/test-validation')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Datos válidos');
      expect(response.body.data).toEqual({
        email: validData.email,
        firstName: validData.firstName,
        lastName: validData.lastName
      });
    });

    it('should accept special characters in names', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'José María',
        lastName: 'García-Pérez'
      };

      const response = await request(app)
        .post('/api/auth/test-validation')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
