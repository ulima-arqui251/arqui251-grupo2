import { Router } from 'express';
import { EnrollmentController } from '../controllers';
import { authenticateToken, requireRole, validateOwnership } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationMiddleware';
import { 
  createEnrollmentValidation,
  updateEnrollmentValidation,
  cancelEnrollmentValidation,
  courseParamValidation,
  enrollmentQueryValidation
} from '../validators';
import { UserRole } from '../types';

const router = Router();

/**
 * @route POST /api/enrollment/enrollments
 * @desc Crear nueva inscripción
 * @access Private (Student, Instructor, Admin)
 */
router.post('/', 
  authenticateToken,
  createEnrollmentValidation,
  handleValidationErrors,
  EnrollmentController.createEnrollment
);

/**
 * @route GET /api/enrollment/enrollments/me
 * @desc Obtener inscripciones del usuario autenticado
 * @access Private (Student, Instructor, Admin)
 */
router.get('/me', 
  authenticateToken,
  enrollmentQueryValidation,
  handleValidationErrors,
  EnrollmentController.getUserEnrollments
);

/**
 * @route GET /api/enrollment/enrollments/course/:courseId
 * @desc Obtener inscripciones de un curso específico
 * @access Private (Instructor, Admin)
 */
router.get('/course/:courseId', 
  authenticateToken,
  requireRole([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  courseParamValidation,
  enrollmentQueryValidation,
  handleValidationErrors,
  EnrollmentController.getCourseEnrollments
);

/**
 * @route PUT /api/enrollment/enrollments/:enrollmentId/status
 * @desc Actualizar estado de inscripción
 * @access Private (Owner, Admin)
 */
router.put('/:enrollmentId/status', 
  authenticateToken,
  validateOwnership,
  updateEnrollmentValidation,
  handleValidationErrors,
  EnrollmentController.updateEnrollmentStatus
);

/**
 * @route DELETE /api/enrollment/enrollments/:enrollmentId
 * @desc Cancelar inscripción
 * @access Private (Owner, Admin)
 */
router.delete('/:enrollmentId', 
  authenticateToken,
  validateOwnership,
  cancelEnrollmentValidation,
  handleValidationErrors,
  EnrollmentController.cancelEnrollment
);

/**
 * @route GET /api/enrollment/enrollments/course/:courseId/stats
 * @desc Obtener estadísticas de inscripciones de un curso
 * @access Private (Instructor, Admin)
 */
router.get('/course/:courseId/stats', 
  authenticateToken,
  requireRole([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  courseParamValidation,
  handleValidationErrors,
  EnrollmentController.getEnrollmentStats
);

export default router;
