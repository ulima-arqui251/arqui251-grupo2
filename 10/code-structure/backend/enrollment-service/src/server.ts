import dotenv from 'dotenv';
import { app, initializeApp } from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    // Initialize the application (database, etc.)
    await initializeApp();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log('🚀 StudyMate Enrollment Service');
      console.log(`📡 Servidor ejecutándose en http://${HOST}:${PORT}`);
      console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api/enrollment`);
      console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
      console.log(`📊 Status: http://${HOST}:${PORT}/api/enrollment/status`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🔄 Recibida señal de cierre, cerrando servidor HTTP...');
      
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado');
        process.exit(0);
      });

      // Force close server after 30secs
      setTimeout(() => {
        console.error('❌ Forzando cierre del servidor');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception thrown:', error);
  process.exit(1);
});

// Start the server
startServer();
