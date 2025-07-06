import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CourseController } from '../controllers/CourseController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../types/common';
import {
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseSearch,
  validateEnrollment
} from '../validators/courseValidators';

const router = Router();
const courseController = new CourseController();

// Rate limiting para operaciones intensivas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 creaciones por IP
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación. Intenta de nuevo más tarde.'
  }
});

// Aplicar rate limiting general a todas las rutas
router.use(generalLimiter);

/**
 * @route   GET /api/courses
 * @desc    RF-07: Obtener catálogo de cursos con filtros
 * @access  Public
 */
router.get('/', validateCourseSearch, courseController.getAllCourses);

/**
 * @route   GET /api/courses/search
 * @desc    RF-07: Búsqueda avanzada de cursos
 * @access  Public
 */
router.get('/search', validateCourseSearch, courseController.searchCourses);

/**
 * @route   GET /api/courses/categories
 * @desc    Obtener categorías de cursos
 * @access  Public
 */
router.get('/categories', courseController.getCategories);

/**
 * @route   GET /api/courses/:id
 * @desc    RF-07: Obtener detalles específicos de un curso
 * @access  Public
 */
router.get('/:id', courseController.getCourseById);

/**
 * @route   POST /api/courses
 * @desc    RF-16: Crear nuevo curso (solo instructores/admins)
 * @access  Private (Instructor/Admin)
 */
router.post('/', 
  createLimiter, 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateCreateCourse, 
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    RF-16: Actualizar curso existente
 * @access  Private (Instructor/Admin)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateUpdateCourse, 
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Eliminar curso (solo administradores)
 * @access  Private (Admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.ADMIN]), 
  courseController.deleteCourse
);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    RF-08: Inscribirse en un curso
 * @access  Private (Student)
 */
router.post('/:id/enroll', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  validateEnrollment, 
  courseController.enrollInCourse
);

/**
 * @route   DELETE /api/courses/:id/unenroll
 * @desc    RF-08: Desinscribirse de un curso
 * @access  Private (Student)
 */
router.delete('/:id/unenroll', 
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  courseController.unenrollFromCourse
);

/**
 * @route   GET /api/courses/:id/enrollments
 * @desc    RF-15: Obtener estudiantes inscritos (solo instructores/admins)
 * @access  Private (Instructor/Admin)
 */
router.get('/:id/enrollments', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  courseController.getCourseEnrollments
);

/**
 * @route   GET /api/courses/:id/progress
 * @desc    RF-15: Obtener progreso general del curso
 * @access  Private (Instructor/Admin)
 */
router.get('/:id/progress', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  courseController.getCourseProgress
);

/**
 * @route   POST /api/courses/:id/publish
 * @desc    RF-16: Publicar curso (cambiar estado a published)
 * @access  Private (Instructor/Admin)
 */
router.post('/:id/publish', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  courseController.publishCourse
);

/**
 * @route   POST /api/courses/:id/archive
 * @desc    Archivar curso
 * @access  Private (Instructor/Admin)
 */
router.post('/:id/archive', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  courseController.archiveCourse
);

/**
 * @route   GET /api/courses/:id/analytics
 * @desc    RF-15: Obtener analíticas del curso
 * @access  Private (Instructor/Admin)
 */
router.get('/:id/analytics', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  courseController.getCourseAnalytics
);

export default router;
