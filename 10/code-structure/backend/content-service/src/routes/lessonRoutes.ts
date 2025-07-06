import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LessonController } from '../controllers/LessonController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../types/common';
import {
  validateCreateLesson,
  validateUpdateLesson,
  validateLessonProgress
} from '../validators/lessonValidators';

const router = Router();
const lessonController = new LessonController();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // más permisivo para lecciones (estudiantes navegan frecuentemente)
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación. Intenta de nuevo más tarde.'
  }
});

router.use(generalLimiter);

/**
 * @route   GET /api/lessons
 * @desc    RF-07: Obtener lecciones (con filtros por curso)
 * @access  Public
 */
router.get('/', lessonController.getAllLessons);

/**
 * @route   GET /api/lessons/:id
 * @desc    RF-07: Obtener detalles de una lección específica
 * @access  Public (preview) / Private (enrolled)
 */
router.get('/:id', lessonController.getLessonById);

/**
 * @route   POST /api/lessons
 * @desc    RF-16: Crear nueva lección (solo instructores/admins)
 * @access  Private (Instructor/Admin)
 */
router.post('/', 
  createLimiter,
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateCreateLesson, 
  lessonController.createLesson
);

/**
 * @route   PUT /api/lessons/:id
 * @desc    RF-16: Actualizar lección existente
 * @access  Private (Instructor/Admin)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateUpdateLesson, 
  lessonController.updateLesson
);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Eliminar lección
 * @access  Private (Instructor/Admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  lessonController.deleteLesson
);

/**
 * @route   POST /api/lessons/:id/complete
 * @desc    RF-09: Marcar lección como completada (desbloqueo progresivo)
 * @access  Private (Student)
 */
router.post('/:id/complete', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  validateLessonProgress, 
  lessonController.completeLesson
);

/**
 * @route   POST /api/lessons/:id/progress
 * @desc    RF-09: Actualizar progreso de lección
 * @access  Private (Student)
 */
router.post('/:id/progress', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  validateLessonProgress, 
  lessonController.updateProgress
);

/**
 * @route   GET /api/lessons/:id/progress
 * @desc    RF-15: Obtener progreso de lección (estudiante o instructor)
 * @access  Private
 */
router.get('/:id/progress', 
  authenticateToken, 
  lessonController.getLessonProgress
);

/**
 * @route   GET /api/lessons/:id/next
 * @desc    RF-09: Obtener siguiente lección disponible (desbloqueo progresivo)
 * @access  Private (Student)
 */
router.get('/:id/next', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  lessonController.getNextLesson
);

/**
 * @route   GET /api/lessons/:id/prerequisites
 * @desc    RF-09: Verificar prerrequisitos de la lección
 * @access  Private (Student)
 */
router.get('/:id/prerequisites', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  lessonController.checkPrerequisites
);

/**
 * @route   POST /api/lessons/:id/unlock
 * @desc    RF-09: Desbloquear lección manualmente (solo instructores)
 * @access  Private (Instructor/Admin)
 */
router.post('/:id/unlock', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  lessonController.unlockLesson
);

export default router;
