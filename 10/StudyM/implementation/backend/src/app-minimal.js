import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'StudyMate API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información del sistema
app.get('/api/info', async (req, res) => {
  try {
    // Probar conexión a base de datos
    await testConnection();
    
    res.json({
      success: true,
      data: {
        application: 'StudyMate Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          type: process.env.DB_TYPE || 'sqlite',
          status: 'connected'
        },
        features: {
          auth: 'enabled',
          '2fa': 'google-authenticator',
          modules: ['auth', 'lessons', 'gamification', 'community', 'azure']
        },
        endpoints: {
          health: '/api/health',
          info: '/api/info',
          auth: '/api/auth/*',
          lessons: '/api/lessons/*',
          gamification: '/api/gamification/*',
          community: '/api/community/*',
          azure: '/api/azure/*'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error conectando a la base de datos',
      error: error.message
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info'
    ]
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                            🎓 StudyMate API                         ║
║                                                                      ║
║  🚀 Servidor iniciado en: http://localhost:${PORT}                      ║
║  📊 Estado: ${process.env.NODE_ENV || 'development'}                                        ║
║  💾 Base de datos: ${process.env.DB_TYPE || 'sqlite'}                                   ║
║                                                                      ║
║  📍 Endpoints disponibles:                                           ║
║     • GET  /api/health  - Estado del servidor                       ║
║     • GET  /api/info    - Información del sistema                   ║
║                                                                      ║
║  📚 Documentación: README.md                                        ║
║  🔧 Configuración: .env                                             ║
╚══════════════════════════════════════════════════════════════════════╝
  `);
  
  // Probar conexión a base de datos al iniciar
  testConnection();
});

export default app;
