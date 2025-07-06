import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/common';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Middleware para autenticar tokens JWT
 * Verifica que el token sea válido y extrae la información del usuario
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está configurado');
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Validar estructura del token
    if (!decoded.userId || !decoded.email || !decoded.role) {
      res.status(401).json({
        success: false,
        message: 'Token inválido: información faltante'
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    console.error('Error en authenticateToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para autorizar roles específicos
 * @param allowedRoles Array de roles permitidos
 */
export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado: rol insuficiente',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es el propietario del recurso o tiene permisos admin
 * @param resourceUserIdParam Nombre del parámetro que contiene el ID del usuario propietario
 */
export const authorizeOwnerOrAdmin = (resourceUserIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
    
    // Admin puede acceder a cualquier recurso
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // El usuario puede acceder solo a sus propios recursos
    if (req.user.userId === resourceUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Acceso denegado: solo puedes acceder a tus propios recursos'
    });
  };
};

/**
 * Middleware para verificar si el usuario está inscrito en un curso
 * Debe usarse después de authenticateToken
 */
export const checkCourseEnrollment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Los instructores y admins tienen acceso a todos los cursos
    if (req.user.role === UserRole.INSTRUCTOR || req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    const courseId = req.params.courseId || req.params.id;
    
    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'ID del curso requerido'
      });
      return;
    }

    // Verificar inscripción (esto se implementará cuando creemos el servicio)
    // Por ahora, permitimos el acceso
    next();
  } catch (error) {
    console.error('Error en checkCourseEnrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
