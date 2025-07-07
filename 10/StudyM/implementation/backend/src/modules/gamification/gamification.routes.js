import express from 'express';
import { GamificationController } from './gamification.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import {
  validateRequest,
  validateQuery,
  validateParams,
  addPointsSchema,
  unlockAchievementSchema,
  leaderboardQuerySchema,
  achievementsQuerySchema,
  subjectParamSchema,
  userParamSchema
} from './gamification.validation.js';

const router = express.Router();
const gamificationController = new GamificationController();

// ===== RUTAS DE ESTADÍSTICAS =====

// GET /api/gamification/stats/me - Mis estadísticas
router.get(
  '/stats/me',
  authenticateToken,
  gamificationController.getMyStats.bind(gamificationController)
);

// GET /api/gamification/stats/:userId - Estadísticas de un usuario
router.get(
  '/stats/:userId',
  authenticateToken,
  validateParams(userParamSchema),
  gamificationController.getUserStats.bind(gamificationController)
);

// ===== RUTAS DE PUNTOS =====

// POST /api/gamification/points - Agregar puntos (admin)
router.post(
  '/points',
  authenticateToken,
  validateRequest(addPointsSchema),
  gamificationController.addPoints.bind(gamificationController)
);

// ===== RUTAS DE RANKINGS =====

// GET /api/gamification/leaderboard/global - Ranking global
router.get(
  '/leaderboard/global',
  authenticateToken,
  validateQuery(leaderboardQuerySchema),
  gamificationController.getGlobalLeaderboard.bind(gamificationController)
);

// GET /api/gamification/leaderboard/subject/:subject - Ranking por materia
router.get(
  '/leaderboard/subject/:subject',
  authenticateToken,
  validateParams(subjectParamSchema),
  validateQuery(leaderboardQuerySchema),
  gamificationController.getSubjectLeaderboard.bind(gamificationController)
);

// ===== RUTAS DE LOGROS =====

// GET /api/gamification/achievements - Todos los logros disponibles
router.get(
  '/achievements',
  authenticateToken,
  validateQuery(achievementsQuerySchema),
  gamificationController.getAchievements.bind(gamificationController)
);

// GET /api/gamification/achievements/me - Mis logros
router.get(
  '/achievements/me',
  authenticateToken,
  validateQuery(achievementsQuerySchema),
  gamificationController.getMyAchievements.bind(gamificationController)
);

// GET /api/gamification/achievements/:userId - Logros de un usuario
router.get(
  '/achievements/:userId',
  authenticateToken,
  validateParams(userParamSchema),
  gamificationController.getUserAchievements.bind(gamificationController)
);

// POST /api/gamification/unlock-achievement - Desbloquear logro (admin)
router.post(
  '/unlock-achievement',
  authenticateToken,
  validateRequest(unlockAchievementSchema),
  gamificationController.unlockAchievement.bind(gamificationController)
);

// ===== RUTAS DE SISTEMA =====

// GET /api/gamification/levels - Información de niveles
router.get(
  '/levels',
  authenticateToken,
  gamificationController.getLevelsInfo.bind(gamificationController)
);

// POST /api/gamification/streak - Actualizar racha
router.post(
  '/streak',
  authenticateToken,
  gamificationController.updateStreak.bind(gamificationController)
);

// POST /api/gamification/init-achievements - Inicializar logros (admin)
router.post(
  '/init-achievements',
  authenticateToken,
  gamificationController.initializeAchievements.bind(gamificationController)
);

export default router;
