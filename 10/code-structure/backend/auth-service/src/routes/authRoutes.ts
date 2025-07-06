import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateTwoFactorVerification
} from '../validators/authValidators';

const router = Router();
const authController = new AuthController();

// Rate limiting para proteger contra ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

// Aplicar rate limiting general a todas las rutas
router.use(generalLimiter);

/**
 * @route   POST /api/auth/register
 * @desc    RF-01: Registro de usuarios
 * @access  Public
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    RF-02: Verificación por correo electrónico
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/login
 * @desc    RF-03: Inicio de sesión seguro
 * @access  Public
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    RF-04: Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validatePasswordResetRequest, authController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    RF-04: Restablecer contraseña
 * @access  Public
 */
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

/**
 * @route   POST /api/auth/setup-2fa
 * @desc    RF-03: Configurar autenticación de dos factores
 * @access  Private
 */
router.post('/setup-2fa', authenticateToken, authController.setupTwoFactor);

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    RF-03: Verificar y activar 2FA
 * @access  Private
 */
router.post('/verify-2fa', authenticateToken, validateTwoFactorVerification, authController.verifyTwoFactor);

/**
 * @route   GET /api/auth/health
 * @desc    Health check para monitoreo
 * @access  Public
 */
router.get('/health', authController.healthCheck);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { User } = await import('../models');
    const user = await User.findByPk(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalidar token del lado cliente)
 * @access  Private
 */
router.post('/logout', authenticateToken, (req, res) => {
  // En una implementación más completa, aquí invalidaríamos el token en una blacklist
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

export default router;
