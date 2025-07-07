import { 
  UserStats, 
  Achievement, 
  UserAchievement, 
  PointsTransaction, 
  Leaderboard,
  User 
} from '../../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class GamificationService {

  // Configuración de niveles
  static LEVEL_THRESHOLDS = [
    0,      // Nivel 1
    100,    // Nivel 2
    250,    // Nivel 3
    500,    // Nivel 4
    1000,   // Nivel 5
    2000,   // Nivel 6
    3500,   // Nivel 7
    5500,   // Nivel 8
    8000,   // Nivel 9
    12000,  // Nivel 10
    17000,  // Nivel 11
    25000,  // Nivel 12
    35000,  // Nivel 13
    50000,  // Nivel 14
    75000   // Nivel 15+
  ];

  // Obtener o crear estadísticas del usuario
  async getUserStats(userId) {
    let stats = await UserStats.findOne({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!stats) {
      stats = await UserStats.create({ userId });
      stats = await UserStats.findByPk(stats.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      });
    }

    return stats;
  }

  // Agregar puntos al usuario
  async addPoints(userId, points, type, source, sourceId = null, description, metadata = null) {
    const transaction = await sequelize.transaction();

    try {
      // Crear transacción de puntos
      const pointsTransaction = await PointsTransaction.create({
        userId,
        points,
        type,
        source,
        sourceId,
        description,
        metadata
      }, { transaction });

      // Actualizar estadísticas del usuario
      const stats = await this.getUserStats(userId);
      const newTotalPoints = stats.totalPoints + points;
      const newLevel = this.calculateLevel(newTotalPoints);

      // Actualizar puntos por materia si aplica
      const subjectPoints = {};
      if (metadata && metadata.subject) {
        const subjectField = `${metadata.subject}Points`;
        if (stats[subjectField] !== undefined) {
          subjectPoints[subjectField] = stats[subjectField] + points;
        }
      }

      await stats.update({
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        experiencePoints: newTotalPoints,
        ...subjectPoints
      }, { transaction });

      // Verificar si subió de nivel
      let levelUpBonus = null;
      if (newLevel > stats.currentLevel) {
        levelUpBonus = await this.handleLevelUp(userId, newLevel, transaction);
      }

      // Verificar logros
      const newAchievements = await this.checkAchievements(userId, transaction);

      await transaction.commit();

      return {
        pointsTransaction,
        stats: await this.getUserStats(userId),
        levelUpBonus,
        newAchievements
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Calcular nivel basado en puntos
  calculateLevel(points) {
    for (let level = GamificationService.LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
      if (points >= GamificationService.LEVEL_THRESHOLDS[level]) {
        return level + 1;
      }
    }
    return 1;
  }

  // Manejar subida de nivel
  async handleLevelUp(userId, newLevel, transaction) {
    const bonusPoints = newLevel * 50; // Bonus por subir de nivel

    const levelUpBonus = await PointsTransaction.create({
      userId,
      points: bonusPoints,
      type: 'level_up',
      source: 'system',
      description: `¡Subiste al nivel ${newLevel}! Bonus por nivel`,
      metadata: { level: newLevel }
    }, { transaction });

    // Actualizar puntos totales con el bonus
    const stats = await UserStats.findOne({ where: { userId } });
    await stats.update({
      totalPoints: stats.totalPoints + bonusPoints
    }, { transaction });

    return levelUpBonus;
  }

  // Actualizar racha de actividad
  async updateStreak(userId) {
    const stats = await this.getUserStats(userId);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    
    if (stats.lastActivityDate) {
      const lastActivity = new Date(stats.lastActivityDate);
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Continúa la racha
        newStreak = stats.currentStreak + 1;
      } else if (diffDays === 0) {
        // Misma fecha, mantener racha
        return stats;
      } else {
        // Se rompió la racha
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak);

    await stats.update({
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today
    });

    // Verificar logros de racha
    await this.checkStreakAchievements(userId, newStreak);

    return stats;
  }

  // Verificar logros de racha
  async checkStreakAchievements(userId, streak) {
    const streakMilestones = [3, 7, 14, 30, 100];
    
    for (const milestone of streakMilestones) {
      if (streak === milestone) {
        const achievement = await Achievement.findOne({
          where: {
            category: 'streak',
            'condition.target': milestone
          }
        });

        if (achievement) {
          await this.unlockAchievement(userId, achievement.id);
        }
      }
    }
  }

  // Verificar todos los logros del usuario
  async checkAchievements(userId, transaction = null) {
    const stats = await this.getUserStats(userId);
    const achievements = await Achievement.findAll({
      where: { isActive: true }
    });

    const newAchievements = [];

    for (const achievement of achievements) {
      const hasAchievement = await UserAchievement.findOne({
        where: { userId, achievementId: achievement.id }
      });

      if (!hasAchievement && await this.checkAchievementCondition(stats, achievement)) {
        const userAchievement = await this.unlockAchievement(userId, achievement.id, transaction);
        newAchievements.push(userAchievement);
      }
    }

    return newAchievements;
  }

  // Verificar condición de logro
  async checkAchievementCondition(stats, achievement) {
    const condition = achievement.condition;

    switch (achievement.type) {
      case 'threshold':
        if (condition.type === 'total_points') {
          return stats.totalPoints >= condition.target;
        }
        if (condition.type === 'lessons_completed') {
          return stats.lessonsCompleted >= condition.target;
        }
        break;

      case 'count':
        if (condition.type === 'subject_points' && condition.subject) {
          const subjectField = `${condition.subject}Points`;
          return stats[subjectField] >= condition.target;
        }
        break;

      case 'consecutive':
        if (condition.type === 'streak') {
          return stats.currentStreak >= condition.target;
        }
        break;
    }

    return false;
  }

  // Desbloquear logro
  async unlockAchievement(userId, achievementId, transaction = null) {
    const useTransaction = transaction || await sequelize.transaction();

    try {
      const achievement = await Achievement.findByPk(achievementId);
      
      const userAchievement = await UserAchievement.create({
        userId,
        achievementId,
        unlockedAt: new Date()
      }, { transaction: useTransaction });

      // Agregar puntos del logro
      if (achievement.points > 0) {
        await PointsTransaction.create({
          userId,
          points: achievement.points,
          type: 'achievement_unlocked',
          source: 'achievement',
          sourceId: achievementId,
          description: `Logro desbloqueado: ${achievement.name}`,
          metadata: { achievementId }
        }, { transaction: useTransaction });

        // Actualizar estadísticas
        const stats = await UserStats.findOne({ where: { userId } });
        await stats.update({
          totalPoints: stats.totalPoints + achievement.points
        }, { transaction: useTransaction });
      }

      if (!transaction) {
        await useTransaction.commit();
      }

      return await UserAchievement.findByPk(userAchievement.id, {
        include: [{
          model: Achievement,
          as: 'achievement'
        }]
      });

    } catch (error) {
      if (!transaction) {
        await useTransaction.rollback();
      }
      throw error;
    }
  }

  // Obtener ranking global
  async getGlobalLeaderboard(limit = 50, offset = 0) {
    const stats = await UserStats.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'institutionId']
      }],
      order: [['totalPoints', 'DESC']],
      limit,
      offset
    });

    return stats.map((stat, index) => ({
      position: offset + index + 1,
      user: stat.user,
      totalPoints: stat.totalPoints,
      currentLevel: stat.currentLevel,
      lessonsCompleted: stat.lessonsCompleted,
      currentStreak: stat.currentStreak
    }));
  }

  // Obtener ranking por materia
  async getSubjectLeaderboard(subject, limit = 50, offset = 0) {
    const subjectField = `${subject}Points`;
    
    const stats = await UserStats.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'institutionId']
      }],
      order: [[subjectField, 'DESC']],
      limit,
      offset,
      where: {
        [subjectField]: {
          [Op.gt]: 0
        }
      }
    });

    return stats.map((stat, index) => ({
      position: offset + index + 1,
      user: stat.user,
      subjectPoints: stat[subjectField],
      totalPoints: stat.totalPoints,
      currentLevel: stat.currentLevel
    }));
  }

  // Obtener logros del usuario
  async getUserAchievements(userId, includeProgress = false) {
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [{
        model: Achievement,
        as: 'achievement'
      }],
      order: [['unlockedAt', 'DESC']]
    });

    if (includeProgress) {
      // También obtener logros no desbloqueados con progreso
      const allAchievements = await Achievement.findAll({
        where: { isActive: true },
        order: [['category', 'ASC'], ['order', 'ASC']]
      });

      const unlockedIds = userAchievements.map(ua => ua.achievementId);
      const pendingAchievements = allAchievements.filter(a => !unlockedIds.includes(a.id));

      const stats = await this.getUserStats(userId);
      
      const pendingWithProgress = pendingAchievements.map(achievement => ({
        achievement,
        progress: this.calculateAchievementProgress(stats, achievement),
        unlocked: false
      }));

      return {
        unlocked: userAchievements,
        pending: pendingWithProgress
      };
    }

    return userAchievements;
  }

  // Calcular progreso hacia un logro
  calculateAchievementProgress(stats, achievement) {
    const condition = achievement.condition;
    let current = 0;
    let target = condition.target || 0;

    switch (achievement.type) {
      case 'threshold':
        if (condition.type === 'total_points') {
          current = stats.totalPoints;
        } else if (condition.type === 'lessons_completed') {
          current = stats.lessonsCompleted;
        }
        break;

      case 'count':
        if (condition.type === 'subject_points' && condition.subject) {
          const subjectField = `${condition.subject}Points`;
          current = stats[subjectField] || 0;
        }
        break;

      case 'consecutive':
        if (condition.type === 'streak') {
          current = stats.currentStreak;
        }
        break;
    }

    return {
      current: Math.min(current, target),
      target,
      percentage: Math.min(Math.round((current / target) * 100), 100)
    };
  }

  // Inicializar logros predeterminados
  async initializeDefaultAchievements() {
    const defaultAchievements = [
      // Logros de lecciones
      {
        name: "Primer Paso",
        description: "Completa tu primera lección",
        category: "lessons",
        type: "threshold",
        condition: { type: "lessons_completed", target: 1 },
        points: 50,
        rarity: "common",
        order: 1
      },
      {
        name: "Estudiante Dedicado",
        description: "Completa 10 lecciones",
        category: "lessons",
        type: "threshold",
        condition: { type: "lessons_completed", target: 10 },
        points: 100,
        rarity: "uncommon",
        order: 2
      },
      {
        name: "Maestro del Conocimiento",
        description: "Completa 50 lecciones",
        category: "lessons",
        type: "threshold",
        condition: { type: "lessons_completed", target: 50 },
        points: 500,
        rarity: "rare",
        order: 3
      },

      // Logros de puntos
      {
        name: "Recolector de Puntos",
        description: "Acumula 1,000 puntos",
        category: "points",
        type: "threshold",
        condition: { type: "total_points", target: 1000 },
        points: 100,
        rarity: "common",
        order: 1
      },
      {
        name: "Millonario del Saber",
        description: "Acumula 10,000 puntos",
        category: "points",
        type: "threshold",
        condition: { type: "total_points", target: 10000 },
        points: 1000,
        rarity: "epic",
        order: 2
      },

      // Logros de racha
      {
        name: "Constancia",
        description: "Mantén una racha de 3 días",
        category: "streak",
        type: "consecutive",
        condition: { type: "streak", target: 3 },
        points: 75,
        rarity: "common",
        order: 1
      },
      {
        name: "Semana Perfecta",
        description: "Mantén una racha de 7 días",
        category: "streak",
        type: "consecutive",
        condition: { type: "streak", target: 7 },
        points: 200,
        rarity: "uncommon",
        order: 2
      },
      {
        name: "Imparable",
        description: "Mantén una racha de 30 días",
        category: "streak",
        type: "consecutive",
        condition: { type: "streak", target: 30 },
        points: 1000,
        rarity: "legendary",
        order: 3
      },

      // Logros por materia
      {
        name: "Matemático en Potencia",
        description: "Obtén 500 puntos en Matemáticas",
        category: "subject",
        type: "count",
        condition: { type: "subject_points", subject: "mathematics", target: 500 },
        points: 150,
        rarity: "uncommon",
        order: 1
      },
      {
        name: "Científico Curioso",
        description: "Obtén 500 puntos en Ciencias",
        category: "subject",
        type: "count",
        condition: { type: "subject_points", subject: "science", target: 500 },
        points: 150,
        rarity: "uncommon",
        order: 1
      }
    ];

    for (const achievementData of defaultAchievements) {
      const existing = await Achievement.findOne({
        where: { name: achievementData.name }
      });

      if (!existing) {
        await Achievement.create(achievementData);
      }
    }
  }

  // Obtener posición del usuario en el ranking
  async getUserRankPosition(userId) {
    const userStats = await this.getUserStats(userId);
    
    const higherRankedCount = await UserStats.count({
      where: {
        totalPoints: {
          [Op.gt]: userStats.totalPoints
        }
      }
    });
    
    return higherRankedCount;
  }
}
