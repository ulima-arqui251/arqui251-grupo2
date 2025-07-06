import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { generateTOTPSecret, verifyTOTP } from '../services/twoFactorService';

export class AuthController {
  /**
   * RF-01: Registro de Usuarios
   * Permite registro con email o Google, enviando verificación
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const { email, password, firstName, lastName, role = 'student' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
        return;
      }

      // RF-02: Generar token de verificación por email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Crear usuario
      const user = await User.create({
        email,
        passwordHash: password, // Se encriptará automáticamente en el hook
        firstName,
        lastName,
        role,
        emailVerificationToken,
        emailVerificationExpires
      });

      // RF-02: Enviar correo de verificación (opcional en desarrollo)
      try {
        await sendVerificationEmail(email, emailVerificationToken);
      } catch (emailError) {
        console.log('Warning: No se pudo enviar correo de verificación en desarrollo:', emailError);
        // En desarrollo, marcar el email como verificado automáticamente
        if (process.env.NODE_ENV === 'development') {
          await user.update({ emailVerified: true });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-02: Verificación por Correo Electrónico
   */
  public async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            $gt: new Date()
          }
        }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Token de verificación inválido o expirado'
        });
        return;
      }

      // Marcar email como verificado
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente'
      });

    } catch (error) {
      console.error('Error en verificación de email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-03: Inicio de Sesión Seguro con 2FA opcional
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const { email, password, twoFactorCode } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
        return;
      }

      // Verificar si la cuenta está bloqueada
      if (user.isAccountLocked()) {
        res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada temporalmente. Intenta más tarde.'
        });
        return;
      }

      // Verificar si el email está verificado
      if (!user.emailVerified) {
        res.status(403).json({
          success: false,
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión'
        });
        return;
      }

      // Validar contraseña
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
        return;
      }

      // Verificar 2FA si está habilitado
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          res.status(206).json({
            success: false,
            message: 'Se requiere código de autenticación de dos factores',
            requiresTwoFactor: true
          });
          return;
        }

        const isTwoFactorValid = verifyTOTP(user.twoFactorSecret!, twoFactorCode);
        if (!isTwoFactorValid) {
          await user.incrementLoginAttempts();
          res.status(401).json({
            success: false,
            message: 'Código de autenticación inválido'
          });
          return;
        }
      }

      // Login exitoso - resetear intentos y generar tokens
      await user.resetLoginAttempts();

      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
      const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      
      const accessToken = (jwt as any).sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      const refreshToken = (jwt as any).sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: jwtRefreshExpiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-04: Recuperación de Contraseña
   */
  public async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Email inválido',
          errors: errors.array()
        });
        return;
      }

      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      // Siempre responder con éxito por seguridad
      res.status(200).json({
        success: true,
        message: 'Si el correo está registrado, recibirás un enlace de recuperación'
      });

      if (!user) {
        return; // No revelar que el email no existe
      }

      // Generar token de reset (válido por 1 hora)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Enviar email de recuperación (no afecta la respuesta)
      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Error enviando email de recuperación:', emailError);
        // En desarrollo, no fallar por errores de email
      }

    } catch (error) {
      console.error('Error en solicitud de reset:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  }

  /**
   * RF-04: Resetear Contraseña
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
        return;
      }

      const { token, newPassword } = req.body;

      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            $gt: new Date()
          }
        }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Token de recuperación inválido o expirado'
        });
        return;
      }

      // Actualizar contraseña
      await user.setPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0; // Resetear intentos fallidos
      user.accountLockedUntil = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error en reset de contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-03: Configurar 2FA
   */
  public async setupTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findByPk(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const { secret, qrCode } = await generateTOTPSecret(user.email);
      
      user.twoFactorSecret = secret;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Código QR generado. Escanea con tu app de autenticación.',
        data: {
          qrCode,
          secret
        }
      });

    } catch (error) {
      console.error('Error en setup 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-03: Verificar y activar 2FA
   */
  public async verifyTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Código inválido',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user?.userId;
      const { code } = req.body;

      const user = await User.findByPk(userId);
      if (!user || !user.twoFactorSecret) {
        res.status(400).json({
          success: false,
          message: 'Configuración de 2FA no iniciada'
        });
        return;
      }

      const isValid = verifyTOTP(user.twoFactorSecret, code);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Código de verificación inválido'
        });
        return;
      }

      user.twoFactorEnabled = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Autenticación de dos factores activada exitosamente'
      });

    } catch (error) {
      console.error('Error en verificación 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Health check para monitoreo
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Auth Service is healthy',
      timestamp: new Date().toISOString()
    });
  }
}
