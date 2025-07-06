import { Router } from 'express';
import enrollmentRoutes from './enrollmentRoutes';
import courseCapacityRoutes from './courseCapacityRoutes';
import waitlistRoutes from './waitlistRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Enrollment Service is running',
    timestamp: new Date().toISOString(),
    service: 'enrollment-service',
    version: '1.0.0'
  });
});

// Service status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'enrollment-service',
    status: 'operational',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main routes
router.use('/enrollments', enrollmentRoutes);
router.use('/capacity', courseCapacityRoutes);
router.use('/waitlist', waitlistRoutes);

export default router;
