import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiting específico por funcionalidad
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    success: false,
    message: 'Límite de registros alcanzado. Intenta de nuevo en 1 hora.'
  }
});

// Middleware para validar origen de requests
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
  const origin = req.headers.origin;
  
  if (process.env.NODE_ENV === 'production' && (!origin || !allowedOrigins.includes(origin))) {
    return res.status(403).json({
      success: false,
      message: 'Origen no autorizado'
    });
  }
  
  next();
};

// Sanitización de datos de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remover caracteres peligrosos
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
};
