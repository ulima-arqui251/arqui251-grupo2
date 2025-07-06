import { Router } from 'express';
import courseRoutes from './courseRoutes';
import lessonRoutes from './lessonRoutes';
import materialRoutes from './materialRoutes';
import quizRoutes from './quizRoutes';
import progressRoutes from './progressRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Service is running',
    timestamp: new Date().toISOString(),
    service: 'content-service',
    version: '1.0.0'
  });
});

// API Routes
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/materials', materialRoutes);
router.use('/quizzes', quizRoutes);
router.use('/progress', progressRoutes);

// 404 handler para rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint no encontrado: ${req.originalUrl}`,
    availableEndpoints: [
      '/api/health',
      '/api/courses',
      '/api/lessons',
      '/api/materials',
      '/api/quizzes',
      '/api/progress'
    ]
  });
});

export default router;
