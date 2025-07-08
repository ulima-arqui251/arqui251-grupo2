import { Lesson, User, LessonProgress, Course } from '../../models/index.js';
import { Op } from 'sequelize';
import { GamificationService } from '../gamification/gamification.service.js';

export class LessonsService {
  constructor() {
    this.gamificationService = new GamificationService();
  }
  
  // Obtener todas las lecciones con filtros
  async getLessons(filters = {}) {
    const {
      subject,
      level,
      search,
      page = 1,
      limit = 20,
      userId
    } = filters;
    
    const offset = (page - 1) * limit;
    
    // Construir condiciones WHERE
    const whereConditions = {
      isPublished: true,
      isActive: true
    };
    
    if (subject) {
      whereConditions.subject = subject;
    }
    
    if (level) {
      whereConditions.level = level;
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const include = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'role']
      }
    ];
    
    // Si hay usuario, incluir progreso
    if (userId) {
      include.push({
        model: LessonProgress,
        as: 'progress',
        where: { userId },
        required: false,
        attributes: ['status', 'progressPercentage', 'score', 'lastAccessedAt']
      });
    }
    
    const { count, rows } = await Lesson.findAndCountAll({
      where: whereConditions,
      include,
      order: [['subject', 'ASC'], ['order', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      lessons: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
  
  // Obtener lección por ID
  async getLessonById(lessonId, userId = null) {
    const include = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'role']
      }
    ];
    
    if (userId) {
      include.push({
        model: LessonProgress,
        as: 'progress',
        where: { userId },
        required: false
      });
    }
    
    const lesson = await Lesson.findByPk(lessonId, {
      include
    });
    
    if (!lesson) {
      throw new Error('Lección no encontrada');
    }
    
    if (!lesson.isPublished || !lesson.isActive) {
      throw new Error('Lección no disponible');
    }
    
    // Incrementar contador de visualizaciones
    await lesson.increment('viewCount');
    
    return lesson;
  }
  
  // Crear nueva lección (solo docentes)
  async createLesson(lessonData, authorId) {
    const {
      title,
      description,
      content,
      subject,
      level,
      estimatedDuration,
      points,
      tags,
      thumbnailUrl,
      videoUrl
    } = lessonData;
    
    // Obtener el siguiente número de orden para esta materia
    const maxOrder = await Lesson.max('order', {
      where: { subject }
    });
    
    const lesson = await Lesson.create({
      title,
      description,
      content,
      subject,
      level,
      estimatedDuration,
      points,
      tags,
      thumbnailUrl,
      videoUrl,
      authorId,
      order: (maxOrder || 0) + 1,
      isPublished: false // Por defecto no publicada
    });
    
    return lesson;
  }
  
  // Actualizar lección
  async updateLesson(lessonId, updates, userId) {
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson) {
      throw new Error('Lección no encontrada');
    }
    
    // Solo el autor o admin puede editar
    if (lesson.authorId !== userId) {
      const user = await User.findByPk(userId);
      if (user.role !== 'admin') {
        throw new Error('No tienes permisos para editar esta lección');
      }
    }
    
    await lesson.update(updates);
    return lesson;
  }
  
  // Eliminar lección (soft delete)
  async deleteLesson(lessonId, userId) {
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson) {
      throw new Error('Lección no encontrada');
    }
    
    // Solo el autor o admin puede eliminar
    if (lesson.authorId !== userId) {
      const user = await User.findByPk(userId);
      if (user.role !== 'admin') {
        throw new Error('No tienes permisos para eliminar esta lección');
      }
    }
    
    await lesson.update({ isActive: false });
    return { message: 'Lección eliminada correctamente' };
  }
  
  // Iniciar una lección
  async startLesson(lessonId, userId) {
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson || !lesson.isPublished || !lesson.isActive) {
      throw new Error('Lección no disponible');
    }
    
    // Buscar progreso existente
    let progress = await LessonProgress.findOne({
      where: { userId, lessonId }
    });
    
    if (!progress) {
      // Crear nuevo progreso
      progress = await LessonProgress.create({
        userId,
        lessonId,
        status: 'in_progress',
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
    } else {
      // Actualizar acceso
      await progress.update({
        status: progress.status === 'not_started' ? 'in_progress' : progress.status,
        startedAt: progress.startedAt || new Date(),
        lastAccessedAt: new Date()
      });
    }
    
    return progress;
  }
  
  // Actualizar progreso de lección
  async updateProgress(lessonId, userId, progressData) {
    const { progressPercentage, timeSpent, notes } = progressData;
    
    const progress = await LessonProgress.findOne({
      where: { userId, lessonId }
    });
    
    if (!progress) {
      throw new Error('Progreso no encontrado. Inicia la lección primero.');
    }
    
    const updates = {
      lastAccessedAt: new Date()
    };
    
    if (progressPercentage !== undefined) {
      updates.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
      
      // Si llegó al 100%, marcar como completada
      if (updates.progressPercentage === 100 && progress.status !== 'completed') {
        updates.status = 'completed';
        updates.completedAt = new Date();
        
        // Incrementar contador de completaciones en la lección
        await Lesson.increment('completionCount', {
          where: { id: lessonId }
        });
      }
    }
    
    if (timeSpent !== undefined) {
      updates.timeSpent = progress.timeSpent + timeSpent;
    }
    
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    await progress.update(updates);
    return progress;
  }
  
  // Completar lección
  async completeLesson(lessonId, userId, score = null) {
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson) {
      throw new Error('Lección no encontrada');
    }
    
    const progress = await LessonProgress.findOne({
      where: { userId, lessonId }
    });
    
    if (!progress) {
      throw new Error('Progreso no encontrado. Inicia la lección primero.');
    }

    // Verificar si ya estaba completada
    const wasAlreadyCompleted = progress.status === 'completed';
    
    await progress.update({
      status: 'completed',
      progressPercentage: 100,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
      score: score,
      attempts: progress.attempts + 1
    });
    
    // Incrementar contador de completaciones
    await lesson.increment('completionCount');

    let gamificationResult = null;
    
    // Solo otorgar puntos si no estaba completada previamente
    if (!wasAlreadyCompleted) {
      try {
        // Calcular puntos base de la lección
        let pointsToAward = lesson.points;
        
        // Bonus por puntuación perfecta
        if (score && score >= 100) {
          pointsToAward += Math.floor(lesson.points * 0.5); // 50% bonus
        }
        
        // Otorgar puntos y verificar logros
        gamificationResult = await this.gamificationService.addPoints(
          userId,
          pointsToAward,
          'lesson_completed',
          'lesson',
          lessonId,
          `Lección completada: ${lesson.title}`,
          {
            subject: lesson.subject,
            level: lesson.level,
            score: score,
            perfectScore: score >= 100
          }
        );

        // Actualizar racha de actividad
        await this.gamificationService.updateStreak(userId);

        // Actualizar contador de lecciones completadas en UserStats
        const userStats = await this.gamificationService.getUserStats(userId);
        await userStats.update({
          lessonsCompleted: userStats.lessonsCompleted + 1
        });

      } catch (gamificationError) {
        console.error('Error en gamificación:', gamificationError);
        // No fallar la completación de lección por errores de gamificación
      }
    }
    
    return {
      progress,
      pointsEarned: lesson.points,
      gamification: gamificationResult,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        points: lesson.points
      }
    };
  }
  
  // Obtener progreso del usuario
  async getUserProgress(userId, filters = {}) {
    const { subject, status } = filters;
    
    const whereConditions = { userId };
    
    if (status) {
      whereConditions.status = status;
    }
    
    const lessonWhere = {};
    if (subject) {
      lessonWhere.subject = subject;
    }
    
    const progress = await LessonProgress.findAll({
      where: whereConditions,
      include: [
        {
          model: Lesson,
          as: 'lesson',
          where: lessonWhere,
          attributes: ['id', 'title', 'subject', 'level', 'points', 'estimatedDuration']
        }
      ],
      order: [['lastAccessedAt', 'DESC']]
    });
    
    return progress;
  }
  
  // Obtener estadísticas de lecciones
  async getLessonStats(lessonId) {
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: LessonProgress,
          as: 'progress',
          attributes: ['status', 'score', 'timeSpent']
        }
      ]
    });
    
    if (!lesson) {
      throw new Error('Lección no encontrada');
    }
    
    const stats = {
      totalUsers: lesson.progress.length,
      completed: lesson.progress.filter(p => p.status === 'completed').length,
      inProgress: lesson.progress.filter(p => p.status === 'in_progress').length,
      averageScore: 0,
      averageTime: 0
    };
    
    const completedProgress = lesson.progress.filter(p => p.status === 'completed' && p.score);
    
    if (completedProgress.length > 0) {
      stats.averageScore = completedProgress.reduce((sum, p) => sum + p.score, 0) / completedProgress.length;
      stats.averageTime = lesson.progress.reduce((sum, p) => sum + p.timeSpent, 0) / lesson.progress.length;
    }
    
    return stats;
  }
}
