import { Router } from 'express';
import { CourseCapacityController } from '../controllers';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../types';

const router = Router();

/**
 * @route POST /api/enrollment/capacity
 * @desc Crear configuración de capacidad para un curso
 * @access Private (Admin, Instructor)
 */
router.post('/', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  CourseCapacityController.createCourseCapacity
);

/**
 * @route GET /api/enrollment/capacity/:courseId
 * @desc Obtener configuración de capacidad de un curso
 * @access Public
 */
router.get('/:courseId', 
  CourseCapacityController.getCourseCapacity
);

/**
 * @route PUT /api/enrollment/capacity/:courseId
 * @desc Actualizar configuración de capacidad
 * @access Private (Admin, Instructor)
 */
router.put('/:courseId', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  CourseCapacityController.updateCourseCapacity
);

/**
 * @route GET /api/enrollment/capacity/analytics/near-capacity
 * @desc Obtener cursos cerca de la capacidad máxima
 * @access Private (Admin, Instructor)
 */
router.get('/analytics/near-capacity', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  CourseCapacityController.getCoursesNearCapacity
);

/**
 * @route GET /api/enrollment/capacity/analytics/full
 * @desc Obtener cursos llenos
 * @access Private (Admin, Instructor)
 */
router.get('/analytics/full', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  CourseCapacityController.getFullCourses
);

/**
 * @route GET /api/enrollment/capacity/analytics/stats
 * @desc Obtener estadísticas generales de capacidad
 * @access Private (Admin)
 */
router.get('/analytics/stats', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  CourseCapacityController.getCapacityStats
);

export default router;
