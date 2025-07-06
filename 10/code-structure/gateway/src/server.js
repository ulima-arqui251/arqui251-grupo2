const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3004'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  }
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API Gateway is healthy',
    timestamp: new Date().toISOString(),
    services: {
      'user-service': 'http://localhost:3005',
      'content-service': 'http://localhost:3003'
    }
  });
});

// Proxy middleware for User Service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://user-service:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('User Service proxy error:', err.message);
    res.status(503).json({
      success: false,
      message: 'User service is currently unavailable',
      timestamp: new Date().toISOString()
    });
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: 'http://user-service:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('User Service proxy error:', err.message);
    res.status(503).json({
      success: false,
      message: 'User service is currently unavailable',
      timestamp: new Date().toISOString()
    });
  }
}));

// Proxy middleware for Content Service
app.use('/api/content', createProxyMiddleware({
  target: 'http://content-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/content': '/api'
  },
  onError: (err, req, res) => {
    console.error('Content Service proxy error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Content service is currently unavailable',
      timestamp: new Date().toISOString()
    });
  }
}));

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to StudyMate API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      content: '/api/content/*',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: ['/api/auth/*', '/api/users/*', '/api/content/*', '/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 StudyMate API Gateway is running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`📚 Content API: http://localhost:${PORT}/api/content`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;
