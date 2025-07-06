import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { createAuthMiddleware, createRoleMiddleware } from '../middleware/auth';
import { UserRole } from '../models/User';
import rateLimit from 'express-rate-limit';

export const createAuthRoutes = (authService: AuthService): Router => {
  const router = Router();
  const authController = new AuthController(authService);
  const authMiddleware = createAuthMiddleware(authService);
  const adminOnly = createRoleMiddleware([UserRole.ADMIN]);

  // Rate limiting for auth endpoints
  const authRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // limit each IP to 5 requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limiting for registration and password reset
  const strictRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
      success: false,
      message: 'Too many attempts, please try again later',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Public routes (no authentication required)
  router.get('/health', authController.health);
  
  // Authentication routes with rate limiting
  router.post('/register', strictRateLimit, authController.register);
  router.post('/login', authRateLimit, authController.login);
  router.post('/refresh-token', authRateLimit, authController.refreshToken);
  router.post('/verify-email', authController.verifyEmail);

  // Protected routes (authentication required)
  router.post('/logout', authMiddleware, authController.logout);
  router.get('/profile', authMiddleware, authController.getProfile);
  router.put('/profile', authMiddleware, authController.updateProfile);

  // Future endpoints (to be implemented)
  // router.post('/forgot-password', strictRateLimit, authController.forgotPassword);
  // router.post('/reset-password', strictRateLimit, authController.resetPassword);
  // router.post('/change-password', authMiddleware, authController.changePassword);
  // router.delete('/profile', authMiddleware, authController.deleteAccount);
  
  // Admin routes (admin role required)
  // router.get('/users', authMiddleware, adminOnly, authController.getAllUsers);
  // router.get('/users/:id', authMiddleware, adminOnly, authController.getUserById);
  // router.put('/users/:id', authMiddleware, adminOnly, authController.updateUser);
  // router.delete('/users/:id', authMiddleware, adminOnly, authController.deleteUser);

  return router;
};
