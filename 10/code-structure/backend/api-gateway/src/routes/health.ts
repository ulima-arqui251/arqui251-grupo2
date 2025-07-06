import { Router } from 'express';
import { HealthChecker, ServiceConfig } from '../utils';

const router = Router();

// Configuración de servicios
const services: ServiceConfig[] = [
  {
    name: 'auth',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3005',
    timeout: 5000,
    healthPath: '/health'
  },
  {
    name: 'user-profile',
    url: process.env.USER_PROFILE_SERVICE_URL || 'http://localhost:3006',
    timeout: 5000,
    healthPath: '/health'
  },
  {
    name: 'content',
    url: process.env.CONTENT_SERVICE_URL || 'http://localhost:3007',
    timeout: 5000,
    healthPath: '/health'
  },
  {
    name: 'enrollment',
    url: process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:3003',
    timeout: 5000,
    healthPath: '/health'
  },
  {
    name: 'notification',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    timeout: 5000,
    healthPath: '/health'
  },
  {
    name: 'analytics',
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3009',
    timeout: 5000,
    healthPath: '/health'
  }
];

const healthChecker = new HealthChecker(services);

// Health check del API Gateway
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyMate API Gateway is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    services: services.map(s => ({
      name: s.name,
      url: s.url
    }))
  });
});

// Health check detallado de todos los servicios
router.get('/services', async (req, res) => {
  try {
    const healthResults = await healthChecker.checkServicesConcurrently();
    const report = healthChecker.generateHealthReport(healthResults);
    
    const statusCode = report.overall === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: report.overall === 'healthy',
      ...report
    });
  } catch (error) {
    console.error('Error checking services health:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking services health',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check de un servicio específico
router.get('/services/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  
  const service = services.find(s => s.name === serviceName);
  
  if (!service) {
    res.status(404).json({
      success: false,
      message: `Service '${serviceName}' not found`,
      availableServices: services.map(s => s.name)
    });
    return;
  }

  try {
    const healthResult = await healthChecker.checkService(service);
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthResult.status === 'healthy',
      ...healthResult
    });
  } catch (error) {
    console.error(`Error checking ${serviceName} health:`, error);
    res.status(500).json({
      success: false,
      message: `Error checking ${serviceName} health`,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para obtener métricas del gateway
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    },
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
