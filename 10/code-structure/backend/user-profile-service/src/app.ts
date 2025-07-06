import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database';
import routes from './routes';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler';
import FileService from './services/FileService';
import DatabaseSyncService from './services/DatabaseSyncService';
import AuthServiceClient from './services/AuthServiceClient';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
// app.use(compression());

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use(routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Initialize database
    await DatabaseSyncService.initializeDatabase();

    // Check auth service connectivity
    const authServiceHealthy = await AuthServiceClient.healthCheck();
    if (authServiceHealthy) {
      console.log('✅ Auth service is reachable');
    } else {
      console.log('⚠️ Auth service is not reachable (service will work with local JWT validation)');
    }

    // Start cleanup scheduler for temp files
    setInterval(async () => {
      try {
        await FileService.cleanupTempFiles();
      } catch (error) {
        console.error('Error during file cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000); // Run every 24 hours

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 User Profile Service running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      console.log(`📁 Upload directory: ${process.env.UPLOAD_PATH || './uploads'}`);
      console.log(`🔗 Auth service URL: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}`);
      console.log(`🔐 Service integration enabled with API key authentication`);
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await DatabaseSyncService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await DatabaseSyncService.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
