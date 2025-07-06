import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Importar middlewares y rutas
import {
  generalLimiter,
  authLimiter,
  writeLimiter,
  uploadLimiter,
  requestLogger,
  performanceLogger,
  errorLogger,
  optionalAuth
} from './middleware';
import { healthRoutes, apiRoutes } from './routes';

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Configuración de servicios backend
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3004',
  userProfile: process.env.USER_PROFILE_SERVICE_URL || 'http://localhost:3006',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
  enrollment: process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3009',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3010',
};

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configurado para múltiples frontends
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-Id', 'X-User-Role']
}));

app.use(compression() as any);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(requestLogger);
} else {
  app.use(morgan('combined'));
}

// Middleware de performance
app.use(performanceLogger);

// Rutas principales (sin middleware de body parsing para proxies)
app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

// Aplicar rate limiting general
app.use('/api', generalLimiter);

// Middleware para logging de proxies
const proxyLogger = (serviceName: string) => (proxyReq: any, req: express.Request, res: express.Response) => {
  console.log(`🔄 [${serviceName.toUpperCase()}] ${req.method} ${req.originalUrl}`);
  
  // Forwarding de headers de usuario si están disponibles
  if (req.headers['X-User-Id']) {
    proxyReq.setHeader('X-User-Id', req.headers['X-User-Id']);
  }
  if (req.headers['X-User-Role']) {
    proxyReq.setHeader('X-User-Role', req.headers['X-User-Role']);
  }
  if (req.headers['X-User-Email']) {
    proxyReq.setHeader('X-User-Email', req.headers['X-User-Email']);
  }
};

// Middleware para manejo de errores de proxy
const proxyErrorHandler = (serviceName: string) => (err: any, req: express.Request, res: express.Response) => {
  console.error(`❌ [${serviceName.toUpperCase()}] Error en proxy:`, err.message);
  res.status(503).json({
    success: false,
    message: `Servicio de ${serviceName} temporalmente no disponible`,
    service: serviceName,
    timestamp: new Date().toISOString()
  });
};

// Proxy para servicio de autenticación
app.use('/api/auth', 
  authLimiter, // Rate limiting específico para auth
  createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/auth'
    },
    onError: proxyErrorHandler('auth'),
    onProxyReq: proxyLogger('auth')
  })
);

// Proxy para servicio de perfiles de usuario
app.use('/api/users', 
  optionalAuth, // Validar JWT opcionalmente
  createProxyMiddleware({
    target: SERVICES.userProfile,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users'
    },
    onError: proxyErrorHandler('user-profile'),
    onProxyReq: proxyLogger('user-profile')
  })
);

// Proxy para servicio de contenido
app.use('/api/content', 
  optionalAuth, // Validar JWT opcionalmente
  createProxyMiddleware({
    target: SERVICES.content,
    changeOrigin: true,
    pathRewrite: {
      '^/api/content': '/api'
    },
    onError: proxyErrorHandler('content'),
    onProxyReq: proxyLogger('content')
  })
);

// Proxy para servicio de inscripciones
app.use('/api/enrollment', 
  // authenticateToken, // Validar JWT obligatorio para algunos endpoints - TESTING
  createProxyMiddleware({
    target: SERVICES.enrollment,
    changeOrigin: true,
    pathRewrite: {
      '^/api/enrollment': '/api/enrollment'
    },
    timeout: 60000, // Aumentar timeout a 60 segundos
    proxyTimeout: 60000, // Timeout específico del proxy
    onError: proxyErrorHandler('enrollment'),
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 [ENROLLMENT] ${req.method} ${req.originalUrl}`);
      console.log(`🔄 [ENROLLMENT] Target: ${SERVICES.enrollment}${proxyReq.path}`);
      console.log(`🔄 [ENROLLMENT] Headers:`, req.headers);
      
      // Forwarding de headers de usuario si están disponibles
      if (req.headers['X-User-Id']) {
        proxyReq.setHeader('X-User-Id', req.headers['X-User-Id']);
      }
      if (req.headers['X-User-Role']) {
        proxyReq.setHeader('X-User-Role', req.headers['X-User-Role']);
      }
      if (req.headers['X-User-Email']) {
        proxyReq.setHeader('X-User-Email', req.headers['X-User-Email']);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`✅ [ENROLLMENT] Response ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
      console.log(`✅ [ENROLLMENT] Response headers:`, proxyRes.headers);
    }
  })
);

// Proxy para servicio de notificaciones (preparado para futuro desarrollo)
app.use('/api/notifications', 
  optionalAuth,
  createProxyMiddleware({
    target: SERVICES.notification,
    changeOrigin: true,
    pathRewrite: {
      '^/api/notifications': '/api/notifications'
    },
    onError: proxyErrorHandler('notification'),
    onProxyReq: proxyLogger('notification')
  })
);

// Proxy para servicio de analytics (preparado para futuro desarrollo)
app.use('/api/analytics', 
  optionalAuth,
  createProxyMiddleware({
    target: SERVICES.analytics,
    changeOrigin: true,
    pathRewrite: {
      '^/api/analytics': '/api/analytics'
    },
    onError: proxyErrorHandler('analytics'),
    onProxyReq: proxyLogger('analytics')
  })
);

// Body parsing middleware SOLO para rutas que NO son proxies
// Esto debe ir DESPUÉS de todos los proxies para evitar conflictos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/health/services',
      '/api',
      '/api/docs',
      '/api/auth/*',
      '/api/users/*',
      '/api/content/*',
      '/api/enrollment/*',
      '/api/notifications/*',
      '/api/analytics/*'
    ]
  });
});

// Manejo global de errores
app.use(errorLogger);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error no manejado en API Gateway:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
});

export default app;
