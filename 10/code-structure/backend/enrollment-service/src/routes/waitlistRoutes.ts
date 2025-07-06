import { Router } from 'express';
import { WaitlistController } from '../controllers';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../types';

const router = Router();

/**
 * @route POST /api/enrollment/waitlist/:courseId
 * @desc Agregar usuario a lista de espera
 * @access Private (Student, Instructor, Admin)
 */
router.post('/:courseId', 
  authenticateToken,
  WaitlistController.addToWaitlist
);

/**
 * @route DELETE /api/enrollment/waitlist/:courseId
 * @desc Remover usuario de lista de espera
 * @access Private (Student, Instructor, Admin)
 */
router.delete('/:courseId', 
  authenticateToken,
  WaitlistController.removeFromWaitlist
);

/**
 * @route GET /api/enrollment/waitlist/:courseId/position
 * @desc Obtener posición en lista de espera
 * @access Private (Student, Instructor, Admin)
 */
router.get('/:courseId/position', 
  authenticateToken,
  WaitlistController.getWaitlistPosition
);

/**
 * @route GET /api/enrollment/waitlist/:courseId/list
 * @desc Obtener lista de espera de un curso (solo para administradores/instructores)
 * @access Private (Instructor, Admin)
 */
router.get('/:courseId/list', 
  authenticateToken,
  requireRole([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  WaitlistController.getCourseWaitlist
);

/**
 * @route GET /api/enrollment/waitlist/me
 * @desc Obtener todas las listas de espera del usuario
 * @access Private (Student, Instructor, Admin)
 */
router.get('/me', 
  authenticateToken,
  WaitlistController.getUserWaitlists
);

/**
 * @route POST /api/enrollment/waitlist/:courseId/notify
 * @desc Notificar a usuarios en lista de espera
 * @access Private (Admin, Instructor)
 */
router.post('/:courseId/notify', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  WaitlistController.notifyWaitlistUsers
);

/**
 * @route GET /api/enrollment/waitlist/analytics/stats
 * @desc Obtener estadísticas de lista de espera
 * @access Private (Admin, Instructor)
 */
router.get('/analytics/stats', 
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  WaitlistController.getWaitlistStats
);

export default router;
