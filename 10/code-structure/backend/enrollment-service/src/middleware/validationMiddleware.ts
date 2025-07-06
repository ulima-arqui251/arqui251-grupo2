import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errorMessages
    });
    return;
  }

  next();
};

/**
 * Middleware de logging para requests
 */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const userId = req.user?.userId || 'Anonymous';

  console.log(`[${timestamp}] ${method} ${url} - User: ${userId} - UserAgent: ${userAgent}`);
  
  next();
};

/**
 * Middleware para manejo de errores globales
 */
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error Handler:', error);

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors: validationErrors
    });
    return;
  }

  // Error de llave única de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'Ya existe un registro con estos datos',
      errors: [{
        field: error.errors[0]?.path || 'unknown',
        message: 'Este valor ya está en uso'
      }]
    });
    return;
  }

  // Error de llave foránea de Sequelize
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      message: 'Referencia inválida a datos relacionados',
      errors: [{
        field: error.fields?.[0] || 'unknown',
        message: 'La referencia especificada no existe'
      }]
    });
    return;
  }

  // Error de conexión a base de datos
  if (error.name === 'SequelizeConnectionError') {
    res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      error: 'Service temporarily unavailable'
    });
    return;
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token de autenticación expirado'
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};

/**
 * Middleware para manejo de rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    availableEndpoints: {
      enrollments: [
        'POST /api/enrollment/enrollments',
        'GET /api/enrollment/enrollments/me',
        'GET /api/enrollment/enrollments/course/:courseId',
        'PUT /api/enrollment/enrollments/:enrollmentId/status',
        'DELETE /api/enrollment/enrollments/:enrollmentId',
        'GET /api/enrollment/enrollments/course/:courseId/stats'
      ],
      capacity: [
        'POST /api/enrollment/capacity',
        'GET /api/enrollment/capacity/:courseId',
        'PUT /api/enrollment/capacity/:courseId',
        'GET /api/enrollment/capacity/analytics/near-capacity',
        'GET /api/enrollment/capacity/analytics/full',
        'GET /api/enrollment/capacity/analytics/stats'
      ],
      waitlist: [
        'POST /api/enrollment/waitlist/:courseId',
        'DELETE /api/enrollment/waitlist/:courseId',
        'GET /api/enrollment/waitlist/:courseId/position',
        'GET /api/enrollment/waitlist/:courseId/list',
        'GET /api/enrollment/waitlist/me',
        'POST /api/enrollment/waitlist/:courseId/notify',
        'GET /api/enrollment/waitlist/analytics/stats'
      ]
    }
  });
};
