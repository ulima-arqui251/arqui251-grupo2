import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Quiz, Question, QuizAttempt, Course, Lesson } from '../models';
import { 
  CreateQuizRequest, 
  UpdateQuizRequest,
  QuizAnswer,
  ApiResponse
} from '../types';

export class QuizController {
  /**
   * RF-11: Crear nuevo quiz
   */
  public async createQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const quizData: CreateQuizRequest = req.body;
      
      // Verificar que el usuario tiene permisos sobre el curso/lección
      if (quizData.courseId) {
        const course = await Course.findByPk(quizData.courseId);
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
            message: 'No tienes permisos para crear quizzes en este curso'
          });
          return;
        }
      }

      if (quizData.lessonId) {
        const lesson = await Lesson.findByPk(quizData.lessonId, {
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
            message: 'No tienes permisos para crear quizzes en esta lección'
          });
          return;
        }
      }

      const quiz = await Quiz.create(quizData);

      // Crear preguntas si se proporcionaron
      if (quizData.questions && quizData.questions.length > 0) {
        const questionsData = quizData.questions.map((q, index) => ({
          ...q,
          quizId: quiz.id,
          orderIndex: q.orderIndex || index + 1
        }));
        
        await Question.bulkCreate(questionsData);
      }

      // Obtener el quiz completo con preguntas
      const completeQuiz = await Quiz.findByPk(quiz.id, {
        include: [
          {
            model: Question,
            as: 'questions',
            order: [['orderIndex', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Quiz creado exitosamente',
        data: completeQuiz
      });
    } catch (error) {
      console.error('Error creando quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener quiz por ID
   */
  public async getQuizById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quiz = await Quiz.findByPk(id, {
        include: [
          {
            model: Question,
            as: 'questions',
            order: [['orderIndex', 'ASC']]
          },
          { model: Course, as: 'course' },
          { model: Lesson, as: 'lesson' }
        ]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error obteniendo quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Actualizar quiz
   */
  public async updateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const updateData: UpdateQuizRequest = req.body;

      const quiz = await Quiz.findByPk(id, {
        include: [
          { model: Course, as: 'course' },
          { model: Lesson, as: 'lesson', include: [{ model: Course, as: 'course' }] }
        ]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      // Verificar permisos
      let hasPermission = false;
      if ((quiz as any).course) {
        hasPermission = (quiz as any).course.instructorId === req.user!.userId;
      } else if ((quiz as any).lesson?.course) {
        hasPermission = (quiz as any).lesson.course.instructorId === req.user!.userId;
      }

      if (!hasPermission && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este quiz'
        });
        return;
      }

      await quiz.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Quiz actualizado exitosamente',
        data: quiz
      });
    } catch (error) {
      console.error('Error actualizando quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Eliminar quiz
   */
  public async deleteQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quiz = await Quiz.findByPk(id, {
        include: [
          { model: Course, as: 'course' },
          { model: Lesson, as: 'lesson', include: [{ model: Course, as: 'course' }] }
        ]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      // Verificar permisos
      let hasPermission = false;
      if ((quiz as any).course) {
        hasPermission = (quiz as any).course.instructorId === req.user!.userId;
      } else if ((quiz as any).lesson?.course) {
        hasPermission = (quiz as any).lesson.course.instructorId === req.user!.userId;
      }

      if (!hasPermission && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este quiz'
        });
        return;
      }

      await quiz.destroy();

      res.status(200).json({
        success: true,
        message: 'Quiz eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-12: Iniciar intento de quiz
   */
  public async startQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const quiz = await Quiz.findByPk(id, {
        include: [
          {
            model: Question,
            as: 'questions',
            order: [['orderIndex', 'ASC']]
          },
          { model: Course, as: 'course' },
          { model: Lesson, as: 'lesson' }
        ]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      // Verificar límite de intentos
      if (quiz.maxAttempts) {
        const attemptCount = await QuizAttempt.count({
          where: { quizId: id, studentId }
        });

        if (attemptCount >= quiz.maxAttempts) {
          res.status(400).json({
            success: false,
            message: 'Has alcanzado el límite máximo de intentos para este quiz'
          });
          return;
        }
      }

      // Verificar si ya tiene un intento en progreso
      const ongoingAttempt = await QuizAttempt.findOne({
        where: { 
          quizId: id, 
          studentId,
          completedAt: { [Op.is]: null as any }
        }
      });

      if (ongoingAttempt) {
        res.status(400).json({
          success: false,
          message: 'Ya tienes un intento en progreso para este quiz',
          data: { attemptId: ongoingAttempt.id }
        });
        return;
      }

      // Crear nuevo intento
      const courseId = quiz.courseId || (quiz as any).lesson?.courseId;
      const questions = (quiz as any).questions || [];
      
      const attempt = await QuizAttempt.create({
        quizId: id,
        studentId,
        courseId,
        totalQuestions: questions.length,
        answers: [],
        startedAt: new Date()
      });

      // Preparar preguntas para el estudiante (sin respuestas correctas)
      const studentQuestions = questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        points: q.points,
        orderIndex: q.orderIndex,
        options: q.options
      }));

      res.status(200).json({
        success: true,
        message: 'Intento de quiz iniciado',
        data: {
          attemptId: attempt.id,
          quiz: {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            instructions: quiz.instructions,
            timeLimit: quiz.timeLimit,
            totalQuestions: questions.length,
            shuffleQuestions: quiz.shuffleQuestions
          },
          questions: quiz.shuffleQuestions ? 
            studentQuestions.sort(() => Math.random() - 0.5) : 
            studentQuestions
        }
      });
    } catch (error) {
      console.error('Error iniciando intento de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-12: Enviar respuestas y completar quiz
   */
  public async submitQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: quizId } = req.params;
      const { attemptId, answers } = req.body;
      const studentId = req.user!.userId;

      const attempt = await QuizAttempt.findOne({
        where: { 
          id: attemptId, 
          quizId, 
          studentId
        },
        // Only get attempts that are not completed
      });

      if (!attempt || attempt.completedAt) {
        res.status(404).json({
          success: false,
          message: 'Intento de quiz no encontrado o ya completado'
        });
        return;
      }

      const quiz = await Quiz.findByPk(quizId, {
        include: [
          {
            model: Question,
            as: 'questions',
            order: [['orderIndex', 'ASC']]
          }
        ]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      // Evaluar respuestas
      const questions = (quiz as any).questions || [];
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      const evaluatedAnswers: QuizAnswer[] = answers.map((answer: any) => {
        const question = questions.find((q: any) => q.id === answer.questionId);
        if (!question) {
          return {
            questionId: answer.questionId,
            answer: answer.answer,
            isCorrect: false,
            points: 0
          };
        }

        totalPoints += question.points;
        const isCorrect = this.evaluateAnswer(question, answer.answer);
        if (isCorrect) {
          correctAnswers++;
          earnedPoints += question.points;
        }

        return {
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect,
          points: isCorrect ? question.points : 0
        };
      });

      // Calcular puntuación
      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const isPassed = quiz.passingScore ? score >= quiz.passingScore : score >= 60;

      // Actualizar intento
      await attempt.update({
        completedAt: new Date(),
        score,
        correctAnswers,
        answers: evaluatedAnswers,
        isPassed
      });

      res.status(200).json({
        success: true,
        message: 'Quiz completado exitosamente',
        data: {
          attemptId: attempt.id,
          score,
          correctAnswers,
          totalQuestions: questions.length,
          isPassed,
          answers: quiz.showCorrectAnswers ? evaluatedAnswers : undefined
        }
      });
    } catch (error) {
      console.error('Error enviando respuestas de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-12: Obtener intentos de quiz del estudiante
   */
  public async getStudentQuizAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const attempts = await QuizAttempt.findAll({
        where: { quizId: id, studentId },
        order: [['startedAt', 'DESC']],
        include: [
          { model: Quiz, as: 'quiz' }
        ]
      });

      res.status(200).json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error('Error obteniendo intentos de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener todos los quizzes con filtros
   */
  public async getAllQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const courseId = req.query.courseId as string;
      const lessonId = req.query.lessonId as string;
      const difficulty = req.query.difficulty as string;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (courseId) where.courseId = courseId;
      if (lessonId) where.lessonId = lessonId;
      if (difficulty) where.difficulty = difficulty;

      const { rows: quizzes, count: total } = await Quiz.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: quizzes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error obteniendo quizzes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener intentos de quiz de un estudiante
   */
  public async getQuizAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { quizId } = req.params;
      const studentId = req.user!.userId;

      const attempts = await QuizAttempt.findAll({
        where: { quizId, studentId },
        order: [['startedAt', 'DESC']],
        include: [
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'maxAttempts']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error('Error obteniendo intentos de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener intento específico de quiz
   */
  public async getQuizAttemptById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;
      const studentId = req.user!.userId;

      const attempt = await QuizAttempt.findOne({
        where: { id: attemptId, studentId },
        include: [
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'description']
          }
        ]
      });

      if (!attempt) {
        res.status(404).json({
          success: false,
          message: 'Intento de quiz no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error obteniendo intento de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-12: Obtener resultados de quiz (para instructores)
   */
  public async getQuizResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { quizId } = req.params;

      const results = await QuizAttempt.findAll({
        where: { 
          quizId,
          completedAt: { [Op.not]: null as any }
        },
        order: [['completedAt', 'DESC']],
        include: [
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title']
          }
        ]
      });

      const stats = {
        totalAttempts: results.length,
        averageScore: results.length > 0 ? 
          results.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / results.length : 0,
        passRate: results.length > 0 ? 
          (results.filter(attempt => attempt.isPassed).length / results.length) * 100 : 0
      };

      res.status(200).json({
        success: true,
        data: {
          results,
          statistics: stats
        }
      });
    } catch (error) {
      console.error('Error obteniendo resultados de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-12: Obtener analytics de quiz (para instructores)
   */
  public async getQuizAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { quizId } = req.params;

      const quiz = await Quiz.findByPk(quizId, {
        include: [{ model: Question, as: 'questions' }]
      });

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz no encontrado'
        });
        return;
      }

      const attempts = await QuizAttempt.findAll({
        where: { 
          quizId,
          completedAt: { [Op.not]: null as any }
        }
      });

      const analytics = {
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0 ? 
          attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length : 0,
        averageTime: attempts.length > 0 ? 
          attempts.reduce((sum, attempt) => {
            const duration = attempt.completedAt && attempt.startedAt ? 
              (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000 / 60 : 0;
            return sum + duration;
          }, 0) / attempts.length : 0,
        questionStats: (quiz as any).questions?.map((question: any) => {
          const correctAnswers = attempts.filter(attempt => 
            attempt.answers.some(answer => 
              answer.questionId === question.id && answer.isCorrect
            )
          ).length;
          
          return {
            questionId: question.id,
            question: question.questionText,
            correctAnswers,
            incorrectAnswers: attempts.length - correctAnswers,
            accuracy: attempts.length > 0 ? (correctAnswers / attempts.length) * 100 : 0
          };
        }) || []
      };

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error obteniendo analytics de quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener quizzes por curso
   */
  public async getQuizzesByCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const quizzes = await Quiz.findAll({
        where: { courseId },
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      console.error('Error obteniendo quizzes del curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-11: Obtener quizzes por lección
   */
  public async getQuizzesByLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      const quizzes = await Quiz.findAll({
        where: { lessonId },
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      console.error('Error obteniendo quizzes de la lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Función auxiliar para evaluar respuestas
   */
  private evaluateAnswer(question: any, studentAnswer: string | string[]): boolean {
    const correctAnswer = question.correctAnswer;
    
    if (Array.isArray(correctAnswer)) {
      // Respuesta múltiple
      if (!Array.isArray(studentAnswer)) return false;
      return correctAnswer.length === studentAnswer.length &&
             correctAnswer.every(answer => studentAnswer.includes(answer));
    } else {
      // Respuesta única
      return correctAnswer === studentAnswer;
    }
  }
}
