import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
    return;
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthUser;
    req.user = decoded;
  } catch (error) {
    // Token inválido, pero continuamos sin usuario
  }
  
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles requeridos: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};

export const requireStudent = requireRole(['student']);
export const requireInstructor = requireRole(['instructor', 'admin']);
export const requireAdmin = requireRole(['admin']);
export const requireInstructorOrAdmin = requireRole(['instructor', 'admin']);

// Middleware para verificar que el usuario puede acceder a su propia información
export const requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
    return;
  }

  const userId = req.params.userId || req.body.userId || req.query.userId;
  
  if (req.user.role === 'admin' || req.user.userId === userId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Solo puedes acceder a tu propia información'
  });
};

// Middleware para validar API key de servicios internos
export const validateServiceApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.SERVICE_API_KEY;

  if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
    res.status(401).json({
      success: false,
      message: 'API key inválida'
    });
    return;
  }

  next();
};

// Middleware para validar ownership de inscripciones
export const validateOwnership = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
    return;
  }

  // Si es admin, permitir acceso
  if (req.user.role === 'admin') {
    next();
    return;
  }

  const enrollmentId = req.params.enrollmentId;
  
  if (!enrollmentId) {
    res.status(400).json({
      success: false,
      message: 'ID de inscripción requerido'
    });
    return;
  }

  try {
    // Importación dinámica para evitar dependencia circular
    const { Enrollment } = await import('../models');
    
    const enrollment = await Enrollment.findByPk(enrollmentId);
    
    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
      return;
    }

    // Verificar que el usuario sea el propietario de la inscripción
    if (enrollment.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta inscripción'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error validating ownership:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
