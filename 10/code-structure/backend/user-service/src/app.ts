import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createPool, initializeDatabase } from './config/database';
import { AuthService } from './services/AuthService';
import { createAuthRoutes } from './routes/auth';

// Load environment variables
dotenv.config();

export const createApp = async (): Promise<express.Application> => {
  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize database
  await initializeDatabase();
  const db = createPool();

  // Initialize services
  const authService = new AuthService(db);

  // Routes
  app.use('/auth', createAuthRoutes(authService));
  app.use('/api/auth', createAuthRoutes(authService)); // Alternative path for API Gateway

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'StudyMate User Service API',
      version: '1.0.0',
      endpoints: {
        health: '/auth/health',
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        refreshToken: 'POST /auth/refresh-token',
        profile: 'GET /auth/profile',
        updateProfile: 'PUT /auth/profile',
        verifyEmail: 'POST /auth/verify-email'
      }
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString(),
      service: 'user-service',
      version: '1.0.0',
      database: 'connected'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/health',
        '/auth/*'
      ]
    });
  });

  // Global error handler
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  });

  return app;
};

export default createApp;
