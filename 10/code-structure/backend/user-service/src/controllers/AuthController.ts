import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema
} from '../utils/validation';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // Register user
      const user = await this.authService.register(value);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          // Note: In production, you might want to send an email verification
          emailVerificationRequired: true
        }
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message === 'Email already registered') {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
          error: 'EMAIL_EXISTS'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: 'REGISTRATION_FAILED'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // Login user
      const loginResult = await this.authService.login(value);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: loginResult
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: 'LOGIN_FAILED'
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // Refresh token
      const tokens = await this.authService.refreshToken(value);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });

    } catch (error: any) {
      console.error('Refresh token error:', error);
      
      if (error.message === 'Invalid refresh token') {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          error: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: 'REFRESH_FAILED'
      });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const refreshToken = req.body.refreshToken;
      await this.authService.logout(req.user.userId, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: 'LOGOUT_FAILED'
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });

    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: 'PROFILE_RETRIEVAL_FAILED'
      });
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Validate request body
      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // TODO: Implement profile update in AuthService
      res.status(501).json({
        success: false,
        message: 'Profile update not yet implemented',
        error: 'NOT_IMPLEMENTED'
      });

    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: 'PROFILE_UPDATE_FAILED'
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = emailVerificationSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const isVerified = await this.authService.verifyEmail(value.token);
      if (!isVerified) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification token',
          error: 'INVALID_VERIFICATION_TOKEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: 'VERIFICATION_FAILED'
      });
    }
  };

  // Health check endpoint
  health = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString(),
      service: 'user-service',
      version: '1.0.0'
    });
  };
}
