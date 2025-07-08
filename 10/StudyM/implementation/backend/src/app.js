import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import { sequelize, testConnection } from './config/database.js';

// Importar modelos (esto inicializa las relaciones)
import './models/index.js';

// Importar rutas
import authRoutes from './modules/auth/auth.routes.js';
import lessonsRoutes from './modules/lessons/lessons.routes.js';
import gamificationRoutes from './modules/gamification/gamification.routes.js';
import azureRoutes from './modules/azure/azure.routes.js';
import communityRoutes from './modules/community/community.routes.js';
import teacherRoutes from './modules/teacher/teacher.routes.js';

const app = express();

// Middlewares de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    config.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (ESC-03: 500 usuarios concurrentes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta más tarde'
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyMate Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/azure', azureRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/teacher', teacherRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API - Módulo de Autenticación',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Probar conexión a BD
    await testConnection();
    
    // Sincronizar modelos (comentado temporalmente para evitar errores de índices)
    // await sequelize.sync({ force: false });
    console.log('✅ Sincronización de modelos omitida temporalmente');
    
    // Iniciar servidor
    app.listen(config.PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${config.PORT}`);
      console.log(`📊 Ambiente: ${config.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
