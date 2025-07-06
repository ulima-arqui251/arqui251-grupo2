import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { 
  Lesson, 
  Course, 
  Material, 
  Quiz, 
  LessonProgress,
  CourseEnrollment 
} from '../models';
import { 
  CreateLessonRequest, 
  UpdateLessonRequest,
  ApiResponse,
  PaginationResponse
} from '../types';

export class LessonController {
  /**
   * RF-07: Obtener lecciones (con filtros por curso)
   */
  public async getAllLessons(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, page = 1, limit = 10, type, isPreview } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const where: any = {};
      if (courseId) where.courseId = courseId;
      if (type) where.type = type;
      if (isPreview !== undefined) where.isPreview = isPreview === 'true';

      const { count, rows: lessons } = await Lesson.findAndCountAll({
        where,
        limit: limitNum,
        offset,
        order: [['orderIndex', 'ASC']],
        include: [
          { model: Course, as: 'course' },
          { model: Material, as: 'materials' },
          { model: Quiz, as: 'quizzes' }
        ]
      });

      const response: PaginationResponse<any> = {
        success: true,
        data: lessons,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalItems: count,
          itemsPerPage: limitNum,
          hasNext: pageNum < Math.ceil(count / limitNum),
          hasPrev: pageNum > 1
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error obteniendo lecciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Obtener detalles de una lección específica
   */
  public async getLessonById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const lesson = await Lesson.findByPk(id, {
        include: [
          { model: Course, as: 'course' },
          { model: Material, as: 'materials' },
          { model: Quiz, as: 'quizzes' }
        ]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('Error obteniendo lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Crear nueva lección (solo instructores/admins)
   */
  public async createLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const lessonData: CreateLessonRequest = req.body;
      
      const course = await Course.findByPk(lessonData.courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear lecciones en este curso'
        });
        return;
      }

      const lesson = await Lesson.create(lessonData);

      res.status(201).json({
        success: true,
        message: 'Lección creada exitosamente',
        data: lesson
      });
    } catch (error) {
      console.error('Error creando lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Actualizar lección existente
   */
  public async updateLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateLessonRequest = req.body;

      const lesson = await Lesson.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      const course = (lesson as any).course;
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar esta lección'
        });
        return;
      }

      await lesson.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Lección actualizada exitosamente',
        data: lesson
      });
    } catch (error) {
      console.error('Error actualizando lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar lección (solo instructores/admins)
   */
  public async deleteLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      const course = (lesson as any).course;
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta lección'
        });
        return;
      }

      await lesson.destroy();

      res.status(200).json({
        success: true,
        message: 'Lección eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Marcar lección como completada (desbloqueo progresivo)
   */
  public async completeLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      let lessonProgress = await LessonProgress.findOne({
        where: { lessonId: id, studentId }
      });

      if (!lessonProgress) {
        lessonProgress = await LessonProgress.create({
          lessonId: id,
          studentId,
          courseId: lesson.courseId,
          isCompleted: true,
          progress: 100
        });
      } else {
        await lessonProgress.update({
          isCompleted: true,
          progress: 100
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lección completada exitosamente',
        data: lessonProgress
      });
    } catch (error) {
      console.error('Error completando lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Actualizar progreso de lección
   */
  public async updateProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { progress, timeSpent } = req.body;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      let lessonProgress = await LessonProgress.findOne({
        where: { lessonId: id, studentId }
      });

      if (!lessonProgress) {
        lessonProgress = await LessonProgress.create({
          lessonId: id,
          studentId,
          courseId: lesson.courseId,
          isCompleted: progress === 100,
          progress: progress || 0,
          timeSpent: timeSpent || 0
        });
      } else {
        await lessonProgress.update({
          progress: progress || lessonProgress.progress,
          timeSpent: timeSpent ? (lessonProgress.timeSpent || 0) + timeSpent : lessonProgress.timeSpent,
          isCompleted: progress === 100 || lessonProgress.isCompleted
        });
      }

      res.status(200).json({
        success: true,
        message: 'Progreso actualizado exitosamente',
        data: lessonProgress
      });
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener progreso de lección
   */
  public async getLessonProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const progress = await LessonProgress.findOne({
        where: { lessonId: id, studentId },
        include: [
          { model: Lesson, as: 'lesson' },
          { model: Course, as: 'course' }
        ]
      });

      res.status(200).json({
        success: true,
        data: progress || { progress: 0, isCompleted: false }
      });
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Obtener siguiente lección disponible (desbloqueo progresivo)
   */
  public async getNextLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const currentLesson = await Lesson.findByPk(id);
      if (!currentLesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      const nextLesson = await Lesson.findOne({
        where: {
          courseId: currentLesson.courseId,
          orderIndex: currentLesson.orderIndex + 1
        }
      });

      res.status(200).json({
        success: true,
        data: nextLesson
      });
    } catch (error) {
      console.error('Error obteniendo siguiente lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Verificar prerrequisitos de la lección
   */
  public async checkPrerequisites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      const previousLessons = await Lesson.findAll({
        where: {
          courseId: lesson.courseId,
          orderIndex: { [Op.lt]: lesson.orderIndex }
        }
      });

      const progressList = await LessonProgress.findAll({
        where: {
          studentId,
          lessonId: { [Op.in]: previousLessons.map(l => l.id) },
          isCompleted: true
        }
      });

      const completedIds = progressList.map(p => p.lessonId);
      const incompletePrerequisites = previousLessons.filter(l => !completedIds.includes(l.id));

      res.status(200).json({
        success: true,
        data: {
          canAccess: incompletePrerequisites.length === 0,
          missingPrerequisites: incompletePrerequisites.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            orderIndex: lesson.orderIndex
          }))
        }
      });
    } catch (error) {
      console.error('Error verificando prerrequisitos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Desbloquear lección manualmente (solo instructores)
   */
  public async unlockLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { studentId } = req.body;

      const lesson = await Lesson.findByPk(id, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      const course = (lesson as any).course;
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para desbloquear lecciones'
        });
        return;
      }

      let lessonProgress = await LessonProgress.findOne({
        where: { lessonId: id, studentId }
      });

      if (!lessonProgress) {
        lessonProgress = await LessonProgress.create({
          lessonId: id,
          studentId,
          courseId: lesson.courseId,
          isCompleted: false,
          progress: 0
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lección desbloqueada exitosamente',
        data: lessonProgress
      });
    } catch (error) {
      console.error('Error desbloqueando lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
