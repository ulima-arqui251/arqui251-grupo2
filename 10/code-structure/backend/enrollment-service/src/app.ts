import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { syncDatabase } from './models';
import routes from './routes';
import { 
  logRequest, 
  errorHandler, 
  notFoundHandler 
} from './middleware/validationMiddleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logRequest);

// Routes
app.use('/api/enrollment', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate Enrollment Service API',
    version: '1.0.0',
    documentation: '/api/enrollment/health',
    endpoints: {
      health: '/api/enrollment/health',
      status: '/api/enrollment/status',
      enrollments: '/api/enrollment/enrollments',
      capacity: '/api/enrollment/capacity',
      waitlist: '/api/enrollment/waitlist'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Enrollment Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware (debe ir al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database connection
const initializeApp = async () => {
  try {
    const dbConnected = await syncDatabase();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    console.log('⚠️ Intentando continuar sin algunas funcionalidades de BD...');
    // No salir del proceso para permitir que funcionen endpoints básicos
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔄 Iniciando cierre graceful...');
  
  try {
    const { closeDatabase } = await import('./models');
    await closeDatabase();
    console.log('✅ Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre graceful:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { app, initializeApp };
