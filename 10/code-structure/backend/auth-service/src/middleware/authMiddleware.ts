import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

/**
 * Middleware para verificar JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';

  (jwt as any).verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: 'Token inválido o expirado'
      });
      return;
    }

    const payload = decoded as JWTPayload;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  });
};

/**
 * Middleware para autorizar roles específicos
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  const jwtSecretOpt = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';

  (jwt as any).verify(token, jwtSecretOpt, (err: any, decoded: any) => {
    if (!err) {
      const payload = decoded as JWTPayload;
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    }
    next();
  });
};
