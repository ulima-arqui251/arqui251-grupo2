import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthServiceClient from '../services/AuthServiceClient';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'admin' | 'support';
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
    return;
  }

  try {
    // First, verify the token locally
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // If we can reach the auth service, verify the token there too
    const authServiceAvailable = await AuthServiceClient.healthCheck();
    
    if (authServiceAvailable) {
      const authUser = await AuthServiceClient.verifyToken(token);
      
      if (authUser) {
        req.user = {
          userId: authUser.id,
          email: authUser.email,
          role: authUser.role
        };
      } else {
        res.status(403).json({ 
          success: false, 
          message: 'Invalid token - auth service verification failed' 
        });
        return;
      }
    } else {
      // Fallback to local verification if auth service is not available
      console.warn('Auth service not available, using local JWT verification');
      req.user = {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role || 'student'
      };
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
    return;
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    // If JWT_SECRET is not configured, continue without authentication
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Try to verify with auth service
    const authServiceAvailable = await AuthServiceClient.healthCheck();
    
    if (authServiceAvailable) {
      const authUser = await AuthServiceClient.verifyToken(token);
      
      if (authUser) {
        req.user = {
          userId: authUser.id,
          email: authUser.email,
          role: authUser.role
        };
      }
    } else {
      // Fallback to local verification
      req.user = {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role || 'student'
      };
    }
  } catch (error) {
    // Token is invalid, but we continue without authentication
    console.warn('Optional auth - invalid token:', error);
  }
  
  next();
};

export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};
