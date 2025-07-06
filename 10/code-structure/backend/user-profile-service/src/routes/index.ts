import { Router } from 'express';
import profileRoutes from './profiles';
import integrationRoutes from './integration';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'User Profile Service is running',
    timestamp: new Date().toISOString(),
    service: 'user-profile-service',
    version: '1.0.0'
  });
});

// API routes
router.use('/api/v1/profiles', profileRoutes);

// Integration routes for service-to-service communication
router.use('/integration', integrationRoutes);

export default router;
