import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de servicios backend (Patrón Modular Monolith)
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3005',
  lessons: process.env.LESSONS_SERVICE_URL || 'http://localhost:3006',
  gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3007',
  community: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3008',
  premium: process.env.PREMIUM_SERVICE_URL || 'http://localhost:3009',
};

// Middlewares de seguridad para cumplir ESC-01 (Seguridad)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado para múltiples frontends (Student, Teacher, Admin)
app.use(cors({
  origin: [
    'http://localhost:3000', // Student App
    'http://localhost:3002', // Teacher Panel  
    'http://localhost:3003', // Admin Panel
    ...(process.env.CORS_ORIGIN?.split(',') || [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression() as any);

// Logging diferenciado por ambiente
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting para ESC-06 (1000 usuarios simultáneos) y ESC-03 (≤300ms)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 1000 : 5000,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);

// Health check principal del API Gateway
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyMate API Gateway is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: Object.keys(SERVICES)
  });
});

// Proxy para servicio de autenticación
app.use('/api/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth' // Mantener el prefijo
  },
  onError: (err, req, res) => {
    console.error('Error en proxy auth:', err.message);
    res.status(503).json({
      success: false,
      message: 'Servicio de autenticación temporalmente no disponible'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 Proxy Auth: ${req.method} ${req.url}`);
  }
}));

// Proxy para servicio de lecciones (cuando esté implementado)
app.use('/api/lessons', createProxyMiddleware({
  target: SERVICES.lessons,
  changeOrigin: true,
  pathRewrite: {
    '^/api/lessons': '/api/lessons'
  },
  onError: (err, req, res) => {
    console.error('Error en proxy lessons:', err.message);
    res.status(503).json({
      success: false,
      message: 'Servicio de lecciones temporalmente no disponible'
    });
  }
}));

// Rutas para otros servicios (preparadas para futuro desarrollo)
['gamification', 'community', 'premium'].forEach(serviceName => {
  app.use(`/api/${serviceName}`, createProxyMiddleware({
    target: SERVICES[serviceName as keyof typeof SERVICES],
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: `/api/${serviceName}`
    },
    onError: (err, req, res) => {
      console.error(`Error en proxy ${serviceName}:`, err.message);
      res.status(503).json({
        success: false,
        message: `Servicio de ${serviceName} temporalmente no disponible`
      });
    }
  }));
});

// Endpoint de información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API Gateway',
    version: '1.0.0',
    services: Object.keys(SERVICES),
    endpoints: [
      '/api/auth - Servicio de autenticación',
      '/api/lessons - Servicio de lecciones',
      '/api/gamification - Servicio de gamificación',
      '/api/community - Servicio de comunidad',
      '/api/premium - Servicio premium'
    ]
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`🚀 API Gateway corriendo en puerto ${PORT}`);
  console.log(`📋 Health check disponible en http://localhost:${PORT}/health`);
  console.log(`🔗 Servicios proxy configurados:`, Object.keys(SERVICES));
});

export default app;
