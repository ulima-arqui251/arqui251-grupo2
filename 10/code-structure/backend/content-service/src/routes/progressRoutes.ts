import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ProgressController } from '../controllers/ProgressController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../types/common';

const router = Router();
const progressController = new ProgressController();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // más permisivo para progreso (se consulta frecuentemente)
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

router.use(generalLimiter);

/**
 * @route   GET /api/progress/courses/:courseId
 * @desc    RF-15: Obtener progreso del estudiante en un curso
 * @access  Private (Student/Instructor)
 */
router.get('/courses/:courseId', 
  authenticateToken, 
  progressController.getCourseProgress
);

/**
 * @route   GET /api/progress/lessons/:lessonId
 * @desc    RF-15: Obtener progreso del estudiante en una lección
 * @access  Private (Student/Instructor)
 */
router.get('/lessons/:lessonId', 
  authenticateToken, 
  progressController.getLessonProgress
);

/**
 * @route   POST /api/progress/lessons/:lessonId
 * @desc    RF-09: Actualizar progreso de lección
 * @access  Private (Student)
 */
router.post('/lessons/:lessonId', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  progressController.updateLessonProgress
);

/**
 * @route   GET /api/progress/students/:studentId/courses/:courseId
 * @desc    RF-15: Obtener progreso de estudiante específico (solo instructores)
 * @access  Private (Instructor/Admin)
 */
router.get('/students/:studentId/courses/:courseId', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  progressController.getStudentCourseProgress
);

/**
 * @route   GET /api/progress/courses/:courseId/overview
 * @desc    RF-15: Obtener resumen de progreso del curso (todos los estudiantes)
 * @access  Private (Instructor/Admin)
 */
router.get('/courses/:courseId/overview', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  progressController.getCourseProgressOverview
);

/**
 * @route   GET /api/progress/students/:studentId/overview
 * @desc    RF-15: Obtener resumen general de progreso del estudiante
 * @access  Private (Student/Instructor/Admin)
 */
router.get('/students/:studentId/overview', 
  authenticateToken, 
  progressController.getStudentProgressOverview
);

/**
 * @route   POST /api/progress/courses/:courseId/reset
 * @desc    Reiniciar progreso del curso (solo administradores)
 * @access  Private (Admin)
 */
router.post('/courses/:courseId/reset', 
  authenticateToken, 
  authorizeRoles([UserRole.ADMIN]), 
  progressController.resetCourseProgress
);

/**
 * @route   GET /api/progress/leaderboard/:courseId
 * @desc    RF-11: Obtener ranking de progreso del curso
 * @access  Private (enrolled students)
 */
router.get('/leaderboard/:courseId', 
  authenticateToken, 
  progressController.getCourseLeaderboard
);

export default router;
