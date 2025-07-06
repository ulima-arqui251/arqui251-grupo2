import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware global para manejo de errores
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error capturado:', error);

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
    return;
  }

  // Error de restricción única de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'Recurso ya existe',
      field: error.errors[0]?.path
    });
    return;
  }

  // Error de clave foránea
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      message: 'Referencia inválida',
      details: 'El recurso referenciado no existe'
    });
    return;
  }

  // Error de conexión a la base de datos
  if (error.name === 'SequelizeConnectionError') {
    res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
    return;
  }

  // Error de timeout
  if (error.name === 'SequelizeTimeoutError') {
    res.status(408).json({
      success: false,
      message: 'Timeout en la operación de base de datos'
    });
    return;
  }

  // Error de Cast (ID inválido)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'ID de recurso inválido'
    });
    return;
  }

  // Error de JSON malformado
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      message: 'JSON malformado en el cuerpo de la petición'
    });
    return;
  }

  // Error personalizado con status
  if (error.status) {
    res.status(error.status).json({
      success: false,
      message: error.message || 'Error en la solicitud'
    });
    return;
  }

  // Error interno del servidor (por defecto)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};

/**
 * Wrapper para funciones async que automáticamente maneja errores
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para logging de requests
 */
export const requestLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${logLevel}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    if (req.user) {
      console.log(`  User: ${req.user.email} (${req.user.role})`);
    }
  });
  
  next();
};
