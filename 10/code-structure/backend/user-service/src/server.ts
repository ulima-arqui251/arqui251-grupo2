import { createApp } from './app';
import dotenv from 'dotenv';

// Load environment variables and start server
dotenv.config();

const PORT = process.env.PORT || 3004;

const startServer = async (): Promise<void> => {
  try {
    const app = await createApp();
    
    app.listen(PORT, () => {
      console.log(`
🚀 StudyMate User Service is running!
📍 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🔐 Auth API: http://localhost:${PORT}/auth
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toISOString()}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
