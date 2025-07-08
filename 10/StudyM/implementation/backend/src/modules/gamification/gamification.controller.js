import { GamificationService } from './gamification.service.js';
import { Achievement } from '../../models/index.js';

const gamificationService = new GamificationService();

export class GamificationController {

  // GET /api/gamification/stats/:userId - Obtener estadísticas del usuario
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      
      // Verificar que el usuario puede ver estas estadísticas
      if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estas estadísticas'
        });
      }

      const stats = await gamificationService.getUserStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // GET /api/gamification/stats/me - Obtener mis estadísticas
  async getMyStats(req, res) {
    try {
      const stats = await gamificationService.getUserStats(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // POST /api/gamification/points - Agregar puntos (solo admin o sistema)
  async addPoints(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden agregar puntos manualmente'
        });
      }

      const { userId, points, type, description, metadata } = req.body;

      const result = await gamificationService.addPoints(
        userId,
        points,
        type || 'admin_adjustment',
        'admin',
        null,
        description || 'Ajuste manual de puntos',
        metadata
      );

      res.json({
        success: true,
        message: 'Puntos agregados correctamente',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al agregar puntos',
        error: error.message
      });
    }
  }

  // GET /api/gamification/leaderboard/global - Ranking global
  async getGlobalLeaderboard(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const leaderboard = await gamificationService.getGlobalLeaderboard(
        parseInt(limit),
        parseInt(offset)
      );

      // Encontrar posición del usuario actual
      let userPosition = null;
      if (req.user) {
        const userStats = await gamificationService.getUserStats(req.user.id);
        // Contar cuántos usuarios tienen más puntos
        const higherRankedCount = await gamificationService.getUserRankPosition(req.user.id);
        userPosition = {
          position: higherRankedCount + 1,
          totalPoints: userStats.totalPoints,
          currentLevel: userStats.currentLevel
        };
      }

      res.json({
        success: true,
        data: {
          leaderboard,
          userPosition,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(leaderboard.length / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ranking',
        error: error.message
      });
    }
  }

  // GET /api/gamification/leaderboard/subject/:subject - Ranking por materia
  async getSubjectLeaderboard(req, res) {
    try {
      const { subject } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const validSubjects = [
        'mathematics', 'science', 'language', 'history', 
        'geography', 'art', 'music', 'physicalEducation', 
        'technology', 'other'
      ];

      if (!validSubjects.includes(subject)) {
        return res.status(400).json({
          success: false,
          message: 'Materia no válida'
        });
      }

      const leaderboard = await gamificationService.getSubjectLeaderboard(
        subject,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: {
          subject,
          leaderboard,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(leaderboard.length / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ranking por materia',
        error: error.message
      });
    }
  }

  // GET /api/gamification/achievements - Obtener logros disponibles
  async getAchievements(req, res) {
    try {
      const { category, rarity } = req.query;
      
      const whereConditions = { isActive: true };
      
      if (category) {
        whereConditions.category = category;
      }
      
      if (rarity) {
        whereConditions.rarity = rarity;
      }

      const achievements = await Achievement.findAll({
        where: whereConditions,
        order: [['category', 'ASC'], ['order', 'ASC']]
      });

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener logros',
        error: error.message
      });
    }
  }

  // GET /api/gamification/achievements/me - Obtener mis logros
  async getMyAchievements(req, res) {
    try {
      const { includeProgress = 'true' } = req.query;
      
      const achievements = await gamificationService.getUserAchievements(
        req.user.id,
        includeProgress === 'true'
      );

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener logros',
        error: error.message
      });
    }
  }

  // GET /api/gamification/achievements/:userId - Obtener logros de un usuario
  async getUserAchievements(req, res) {
    try {
      const { userId } = req.params;
      
      const achievements = await gamificationService.getUserAchievements(userId, false);

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener logros del usuario',
        error: error.message
      });
    }
  }

  // GET /api/gamification/levels - Obtener información de niveles
  async getLevelsInfo(req, res) {
    try {
      const levels = GamificationService.LEVEL_THRESHOLDS.map((threshold, index) => ({
        level: index + 1,
        pointsRequired: threshold,
        nextLevelPoints: GamificationService.LEVEL_THRESHOLDS[index + 1] || null
      }));

      res.json({
        success: true,
        data: levels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener información de niveles',
        error: error.message
      });
    }
  }

  // POST /api/gamification/streak - Actualizar racha (llamada automática)
  async updateStreak(req, res) {
    try {
      const stats = await gamificationService.updateStreak(req.user.id);

      res.json({
        success: true,
        message: 'Racha actualizada',
        data: {
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar racha',
        error: error.message
      });
    }
  }

  // POST /api/gamification/unlock-achievement - Desbloquear logro manualmente (admin)
  async unlockAchievement(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden desbloquear logros manualmente'
        });
      }

      const { userId, achievementId } = req.body;

      const userAchievement = await gamificationService.unlockAchievement(userId, achievementId);

      res.json({
        success: true,
        message: 'Logro desbloqueado correctamente',
        data: userAchievement
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al desbloquear logro',
        error: error.message
      });
    }
  }

  // POST /api/gamification/init-achievements - Inicializar logros por defecto (admin)
  async initializeAchievements(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden inicializar logros'
        });
      }

      await gamificationService.initializeDefaultAchievements();

      res.json({
        success: true,
        message: 'Logros inicializados correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al inicializar logros',
        error: error.message
      });
    }
  }
}
