import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { 
  Course, 
  Lesson, 
  CourseEnrollment, 
  LessonProgress,
  Quiz,
  QuizAttempt 
} from '../models';
import { ApiResponse } from '../types';

export class ProgressController {
  /**
   * RF-15: Obtener progreso general del estudiante en un curso
   */
  public async getCourseProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const studentId = req.user!.userId;

      // Verificar inscripción en el curso
      const enrollment = await CourseEnrollment.findOne({
        where: { courseId, studentId, isActive: true }
      });

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'No estás inscrito en este curso'
        });
        return;
      }

      // Obtener todas las lecciones del curso
      const lessons = await Lesson.findAll({
        where: { courseId },
        order: [['orderIndex', 'ASC']],
        include: [
          {
            model: LessonProgress,
            as: 'progress',
            where: { studentId },
            required: false
          }
        ]
      });

      // Calcular estadísticas de progreso
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(lesson => 
        (lesson as any).progress && (lesson as any).progress.length > 0 && (lesson as any).progress[0].isCompleted
      ).length;

      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Obtener progreso de quizzes
      const quizzes = await Quiz.findAll({
        where: { courseId },
        include: [
          {
            model: QuizAttempt,
            as: 'attempts',
            where: { studentId },
            required: false,
            order: [['startedAt', 'DESC']]
          }
        ]
      });

      const quizStats = {
        totalQuizzes: quizzes.length,
        completedQuizzes: quizzes.filter(quiz => 
          (quiz as any).attempts && (quiz as any).attempts.length > 0 && 
          (quiz as any).attempts[0].completedAt
        ).length,
        passedQuizzes: quizzes.filter(quiz => 
          (quiz as any).attempts && (quiz as any).attempts.length > 0 && 
          (quiz as any).attempts[0].isPassed
        ).length
      };

      // Preparar datos detallados del progreso
      const lessonProgress = lessons.map(lesson => {
        const progress = (lesson as any).progress && (lesson as any).progress.length > 0 
          ? (lesson as any).progress[0] 
          : null;
        
        return {
          lessonId: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          isCompleted: progress?.isCompleted || false,
          progress: progress?.progress || 0,
          timeSpent: progress?.timeSpent || 0,
          lastAccessedAt: progress?.lastAccessedAt || null,
          completedAt: progress?.completedAt || null
        };
      });

      // Actualizar progreso en la inscripción
      await enrollment.update({ 
        progress: overallProgress,
        lastAccessedAt: new Date()
      });

      res.status(200).json({
        success: true,
        data: {
          courseId,
          studentId,
          overallProgress,
          totalLessons,
          completedLessons,
          quizStats,
          lessonProgress,
          enrollmentDate: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          isCompleted: overallProgress === 100,
          completedAt: enrollment.completedAt
        }
      });
    } catch (error) {
      console.error('Error obteniendo progreso del curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener progreso específico de una lección
   */
  public async getLessonProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(lessonId, {
        include: [
          { model: Course, as: 'course' },
          {
            model: LessonProgress,
            as: 'progress',
            where: { studentId },
            required: false
          }
        ]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar inscripción en el curso
      const enrollment = await CourseEnrollment.findOne({
        where: { 
          courseId: lesson.courseId, 
          studentId, 
          isActive: true 
        }
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta lección'
        });
        return;
      }

      const progress = (lesson as any).progress && (lesson as any).progress.length > 0 
        ? (lesson as any).progress[0] 
        : null;

      res.status(200).json({
        success: true,
        data: {
          lessonId,
          courseId: lesson.courseId,
          studentId,
          isCompleted: progress?.isCompleted || false,
          progress: progress?.progress || 0,
          timeSpent: progress?.timeSpent || 0,
          lastAccessedAt: progress?.lastAccessedAt || null,
          completedAt: progress?.completedAt || null
        }
      });
    } catch (error) {
      console.error('Error obteniendo progreso de lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Actualizar progreso de una lección
   */
  public async updateLessonProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const { progress, timeSpent, isCompleted } = req.body;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(lessonId, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar inscripción en el curso
      const enrollment = await CourseEnrollment.findOne({
        where: { 
          courseId: lesson.courseId, 
          studentId, 
          isActive: true 
        }
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta lección'
        });
        return;
      }

      // Buscar o crear progreso de la lección
      let lessonProgress = await LessonProgress.findOne({
        where: { lessonId, studentId }
      });

      if (!lessonProgress) {
        lessonProgress = await LessonProgress.create({
          lessonId,
          studentId,
          courseId: lesson.courseId,
          isCompleted: isCompleted || false,
          progress: progress || 0,
          timeSpent: timeSpent || 0
        });
      } else {
        await lessonProgress.update({
          isCompleted: isCompleted !== undefined ? isCompleted : lessonProgress.isCompleted,
          progress: progress !== undefined ? progress : lessonProgress.progress,
          timeSpent: timeSpent !== undefined ? 
            (lessonProgress.timeSpent || 0) + timeSpent : 
            lessonProgress.timeSpent
        });
      }

      res.status(200).json({
        success: true,
        message: 'Progreso actualizado exitosamente',
        data: lessonProgress
      });
    } catch (error) {
      console.error('Error actualizando progreso de lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-09: Marcar lección como completada
   */
  public async completeLessonProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const studentId = req.user!.userId;

      const lesson = await Lesson.findByPk(lessonId, {
        include: [{ model: Course, as: 'course' }]
      });

      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar inscripción en el curso
      const enrollment = await CourseEnrollment.findOne({
        where: { 
          courseId: lesson.courseId, 
          studentId, 
          isActive: true 
        }
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta lección'
        });
        return;
      }

      // Buscar o crear progreso de la lección
      let lessonProgress = await LessonProgress.findOne({
        where: { lessonId, studentId }
      });

      if (!lessonProgress) {
        lessonProgress = await LessonProgress.create({
          lessonId,
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

      // Verificar si se desbloqueó la siguiente lección
      const nextLesson = await Lesson.findOne({
        where: { 
          courseId: lesson.courseId,
          orderIndex: lesson.orderIndex + 1
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lección completada exitosamente',
        data: {
          completedLesson: lessonProgress,
          nextLesson: nextLesson ? {
            id: nextLesson.id,
            title: nextLesson.title,
            orderIndex: nextLesson.orderIndex
          } : null
        }
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
   * RF-15: Obtener estadísticas generales del estudiante
   */
  public async getStudentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;

      // Obtener todas las inscripciones activas
      const enrollments = await CourseEnrollment.findAll({
        where: { studentId, isActive: true },
        include: [
          { 
            model: Course, 
            as: 'course',
            include: [
              { model: Lesson, as: 'lessons' }
            ]
          }
        ]
      });

      // Calcular estadísticas
      const totalCourses = enrollments.length;
      const completedCourses = enrollments.filter(e => e.progress === 100).length;
      const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

      // Obtener progreso total de lecciones
      const totalLessonsProgress = await LessonProgress.findAll({
        where: { studentId }
      });

      const totalLessonsCompleted = totalLessonsProgress.filter(p => p.isCompleted).length;
      const totalTimeSpent = totalLessonsProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

      // Obtener estadísticas de quizzes
      const quizAttempts = await QuizAttempt.findAll({
        where: { 
          studentId,
          completedAt: { [Op.not]: null as any }
        }
      });

      const totalQuizzesCompleted = quizAttempts.length;
      const totalQuizzesPassed = quizAttempts.filter(a => a.isPassed).length;
      const averageQuizScore = quizAttempts.length > 0 ? 
        Math.round(quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length) : 0;

      res.status(200).json({
        success: true,
        data: {
          studentId,
          courses: {
            total: totalCourses,
            completed: completedCourses,
            inProgress: inProgressCourses,
            notStarted: totalCourses - completedCourses - inProgressCourses
          },
          lessons: {
            completed: totalLessonsCompleted,
            totalTimeSpent: totalTimeSpent
          },
          quizzes: {
            completed: totalQuizzesCompleted,
            passed: totalQuizzesPassed,
            averageScore: averageQuizScore
          },
          enrollments: enrollments.map(e => ({
            courseId: e.courseId,
            courseName: (e as any).course?.title,
            progress: e.progress,
            enrolledAt: e.enrolledAt,
            lastAccessedAt: e.lastAccessedAt
          }))
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener progreso específico de estudiante en curso
   */
  public async getStudentCourseProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, studentId } = req.params;

      const courseProgress = await this.getCourseProgressForStudent(courseId, studentId);

      res.status(200).json({
        success: true,
        data: courseProgress
      });
    } catch (error) {
      console.error('Error obteniendo progreso del estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener resumen de progreso del curso
   */
  public async getCourseProgressOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Obtener estadísticas generales del curso
      const totalLessons = await Lesson.count({ where: { courseId } });
      const totalQuizzes = await Quiz.count({ where: { courseId } });

      // Obtener progreso de todos los estudiantes
      const enrollments = await CourseEnrollment.findAll({
        where: { courseId }
      });

      const studentsProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const progress = await this.getCourseProgressForStudent(courseId, enrollment.studentId);
          return {
            studentId: enrollment.studentId,
            ...progress
          };
        })
      );

      const completedStudents = studentsProgress.filter(p => p.isCompleted).length;

      res.status(200).json({
        success: true,
        data: {
          courseInfo: {
            totalLessons,
            totalQuizzes,
            totalStudents: enrollments.length,
            completedStudents,
            completionRate: enrollments.length > 0 ? (completedStudents / enrollments.length) * 100 : 0
          },
          studentsProgress
        }
      });
    } catch (error) {
      console.error('Error obteniendo resumen de progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener resumen general de progreso del estudiante
   */
  public async getStudentProgressOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;

      // Obtener todos los cursos enrollados
      const enrollments = await CourseEnrollment.findAll({
        where: { studentId },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description']
          }
        ]
      });

      const progressData = await Promise.all(
        enrollments.map(async (enrollment) => {
          const courseProgress = await this.getCourseProgressForStudent(
            enrollment.courseId, 
            studentId
          );
          
          return {
            courseId: enrollment.courseId,
            ...courseProgress
          };
        })
      );

      // Estadísticas generales del estudiante
      const totalCourses = enrollments.length;
      const completedCourses = progressData.filter(p => p.isCompleted).length;
      const averageProgress = progressData.length > 0 ? 
        progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / progressData.length : 0;

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalCourses,
            completedCourses,
            inProgress: totalCourses - completedCourses,
            averageProgress
          },
          courses: progressData
        }
      });
    } catch (error) {
      console.error('Error obteniendo resumen de progreso del estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Resetear progreso del curso (admin)
   */
  public async resetCourseProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, studentId } = req.params;

      // Eliminar progreso de lecciones
      await LessonProgress.destroy({
        where: { courseId, studentId }
      });

      // Eliminar intentos de quiz
      await QuizAttempt.destroy({
        where: { courseId, studentId }
      });

      res.status(200).json({
        success: true,
        message: 'Progreso del curso reseteado exitosamente'
      });
    } catch (error) {
      console.error('Error reseteando progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener leaderboard del curso
   */
  public async getCourseLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const enrollments = await CourseEnrollment.findAll({
        where: { courseId }
      });

      const leaderboard = await Promise.all(
        enrollments.map(async (enrollment) => {
          const progress = await this.getCourseProgressForStudent(courseId, enrollment.studentId);
          return {
            studentId: enrollment.studentId,
            ...progress
          };
        })
      );

      // Ordenar por progreso y tiempo
      leaderboard.sort((a, b) => {
        if (a.progressPercentage !== b.progressPercentage) {
          return b.progressPercentage - a.progressPercentage;
        }
        return a.totalTimeSpent - b.totalTimeSpent;
      });

      res.status(200).json({
        success: true,
        data: leaderboard.slice(0, limit)
      });
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Método helper para obtener progreso de un estudiante en un curso
   */
  private async getCourseProgressForStudent(courseId: string, studentId: string) {
    // Obtener lecciones del curso
    const totalLessons = await Lesson.count({ where: { courseId } });
    
    // Obtener progreso de lecciones
    const lessonProgress = await LessonProgress.findAll({
      where: { courseId, studentId }
    });

    const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
    const totalTimeSpent = lessonProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

    // Obtener quizzes del curso
    const totalQuizzes = await Quiz.count({ where: { courseId } });
    
    // Obtener intentos de quiz completados
    const quizAttempts = await QuizAttempt.findAll({
      where: { 
        courseId, 
        studentId,
        completedAt: { [Op.not]: null as any }
      }
    });

    const passedQuizzes = quizAttempts.filter(a => a.isPassed).length;
    const averageQuizScore = quizAttempts.length > 0 ? 
      quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length : 0;

    // Calcular progreso general
    const lessonsWeight = 0.7; // 70% del progreso
    const quizzesWeight = 0.3;  // 30% del progreso

    const lessonProgress_percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const quizProgress_percentage = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

    const progressPercentage = (lessonProgress_percentage * lessonsWeight) + (quizProgress_percentage * quizzesWeight);
    const isCompleted = progressPercentage >= 100;

    return {
      progressPercentage,
      isCompleted,
      lessonsCompleted: completedLessons,
      totalLessons,
      quizzesPassed: passedQuizzes,
      totalQuizzes,
      totalTimeSpent,
      averageQuizScore,
      lastActivity: Date.now()
    };
  }
}
