import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import twoFactorController from './twoFactor.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { 
  registerSchema, 
  loginSchema,
  verify2FASchema,
  enable2FASchema,
  disable2FASchema
} from './auth.validation.js';

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post('/register', validate({ body: registerSchema }), authController.register.bind(authController));
router.post('/login', validate({ body: loginSchema }), authController.login.bind(authController));
router.post('/verify-2fa', validate({ body: verify2FASchema }), authController.verify2FA.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.put('/change-password', authenticate, authController.changePassword.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

// Rutas de 2FA
router.get('/2fa/qr', authenticate, twoFactorController.generateQR.bind(twoFactorController));
router.post('/2fa/enable', authenticate, validate({ body: enable2FASchema }), twoFactorController.enable2FA.bind(twoFactorController));
router.post('/2fa/disable', authenticate, validate({ body: disable2FASchema }), twoFactorController.disable2FA.bind(twoFactorController));
router.post('/2fa/verify', authenticate, validate({ body: verify2FASchema }), twoFactorController.verifyToken.bind(twoFactorController));
router.get('/2fa/backup-codes', authenticate, twoFactorController.getBackupCodes.bind(twoFactorController));
router.post('/2fa/backup-codes/regenerate', authenticate, twoFactorController.regenerateBackupCodes.bind(twoFactorController));

export default router;
