import rateLimit from 'express-rate-limit';

// Rate limiting general
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Límite de requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: 15 * 60 // segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit excedido - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      retryAfter: 15 * 60
    });
  }
});

// Rate limiting para autenticación (más restrictivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Solo 10 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación desde esta IP, intenta de nuevo más tarde.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚨 Rate limit de autenticación excedido - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticación desde esta IP, intenta de nuevo más tarde.',
      retryAfter: 15 * 60
    });
  }
});

// Rate limiting para operaciones de escritura (crear, actualizar, eliminar)
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // 50 operaciones de escritura por minuto
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit de escritura excedido - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde.',
      retryAfter: 60
    });
  }
});

// Rate limiting para uploads
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 uploads por cada 10 minutos
  message: {
    success: false,
    message: 'Demasiados archivos subidos, intenta de nuevo más tarde.',
    retryAfter: 10 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`📁 Rate limit de uploads excedido - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados archivos subidos, intenta de nuevo más tarde.',
      retryAfter: 10 * 60
    });
  }
});

// Rate limiting para búsquedas
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 búsquedas por minuto
  message: {
    success: false,
    message: 'Demasiadas búsquedas, intenta de nuevo más tarde.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🔍 Rate limit de búsquedas excedido - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Demasiadas búsquedas, intenta de nuevo más tarde.',
      retryAfter: 60
    });
  }
});
