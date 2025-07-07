import express from 'express';
import { LessonsController } from './lessons.controller.js';
import { authenticateToken, optionalAuth } from '../../middleware/auth.js';
import {
  validateRequest,
  validateQuery,
  createLessonSchema,
  updateLessonSchema,
  updateProgressSchema,
  completeLessonSchema,
  getLessonsSchema,
  getUserProgressSchema
} from './lessons.validation.js';

const router = express.Router();
const lessonsController = new LessonsController();

// Rutas públicas (no requieren autenticación)
router.get(
  '/',
  optionalAuth, // Autenticación opcional para incluir progreso del usuario
  validateQuery(getLessonsSchema),
  lessonsController.getLessons.bind(lessonsController)
);

// Ruta para obtener progreso del usuario autenticado (debe ir antes de /:id)
router.get(
  '/progress/me',
  authenticateToken,
  validateQuery(getUserProgressSchema),
  lessonsController.getUserProgress.bind(lessonsController)
);

router.get(
  '/:id',
  optionalAuth, // Autenticación opcional para incluir progreso del usuario
  lessonsController.getLessonById.bind(lessonsController)
);

// Rutas que requieren autenticación
router.post(
  '/',
  authenticateToken,
  validateRequest(createLessonSchema),
  lessonsController.createLesson.bind(lessonsController)
);

router.put(
  '/:id',
  authenticateToken,
  validateRequest(updateLessonSchema),
  lessonsController.updateLesson.bind(lessonsController)
);

router.delete(
  '/:id',
  authenticateToken,
  lessonsController.deleteLesson.bind(lessonsController)
);

// Rutas de progreso (requieren autenticación de estudiante)
router.post(
  '/:id/start',
  authenticateToken,
  lessonsController.startLesson.bind(lessonsController)
);

router.put(
  '/:id/progress',
  authenticateToken,
  validateRequest(updateProgressSchema),
  lessonsController.updateProgress.bind(lessonsController)
);

router.post(
  '/:id/complete',
  authenticateToken,
  validateRequest(completeLessonSchema),
  lessonsController.completeLesson.bind(lessonsController)
);

// Rutas para docentes/admin (estadísticas)
router.get(
  '/:id/stats',
  authenticateToken,
  lessonsController.getLessonStats.bind(lessonsController)
);

export default router;
