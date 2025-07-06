import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { QuizController } from '../controllers/QuizController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../types/common';
import {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateQuizAttempt
} from '../validators/quizValidators';

const router = Router();
const quizController = new QuizController();

// Rate limiting para quizzes
const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // máximo 50 intentos de quiz por IP cada 15 min
  message: {
    success: false,
    message: 'Demasiados intentos de quiz. Intenta de nuevo más tarde.'
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

router.use(generalLimiter);

/**
 * @route   GET /api/quizzes
 * @desc    RF-07: Obtener quizzes con filtros
 * @access  Private (enrolled students)
 */
router.get('/', authenticateToken, quizController.getAllQuizzes);

/**
 * @route   GET /api/quizzes/:id
 * @desc    RF-07: Obtener detalles de quiz específico
 * @access  Private (enrolled students)
 */
router.get('/:id', authenticateToken, quizController.getQuizById);

/**
 * @route   POST /api/quizzes
 * @desc    RF-16: Crear nuevo quiz (solo instructores/admins)
 * @access  Private (Instructor/Admin)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateCreateQuiz, 
  quizController.createQuiz
);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    RF-16: Actualizar quiz existente
 * @access  Private (Instructor/Admin)
 */
router.put('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  validateUpdateQuiz, 
  quizController.updateQuiz
);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Eliminar quiz
 * @access  Private (Instructor/Admin)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  quizController.deleteQuiz
);

/**
 * @route   POST /api/quizzes/:id/attempt
 * @desc    RF-10: Iniciar nuevo intento de quiz
 * @access  Private (Student)
 */
router.post('/:id/attempt', 
  quizLimiter,
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  validateQuizAttempt, 
  quizController.startQuizAttempt
);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    RF-10: Enviar respuestas del quiz
 * @access  Private (Student)
 */
router.post('/:id/submit', 
  quizLimiter,
  authenticateToken, 
  authorizeRoles([UserRole.STUDENT]), 
  quizController.submitQuizAttempt
);

/**
 * @route   GET /api/quizzes/:id/attempts
 * @desc    RF-10: Obtener intentos del quiz por estudiante
 * @access  Private (Student/Instructor)
 */
router.get('/:id/attempts', 
  authenticateToken, 
  quizController.getQuizAttempts
);

/**
 * @route   GET /api/quizzes/:id/attempts/:attemptId
 * @desc    RF-10: Obtener detalles de intento específico
 * @access  Private (Student/Instructor)
 */
router.get('/:id/attempts/:attemptId', 
  authenticateToken, 
  quizController.getQuizAttemptById
);

/**
 * @route   GET /api/quizzes/:id/results
 * @desc    RF-15: Obtener resultados del quiz (solo instructores)
 * @access  Private (Instructor/Admin)
 */
router.get('/:id/results', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  quizController.getQuizResults
);

/**
 * @route   GET /api/quizzes/:id/analytics
 * @desc    RF-15: Obtener analíticas del quiz
 * @access  Private (Instructor/Admin)
 */
router.get('/:id/analytics', 
  authenticateToken, 
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), 
  quizController.getQuizAnalytics
);

/**
 * @route   GET /api/quizzes/course/:courseId
 * @desc    RF-07: Obtener quizzes de un curso específico
 * @access  Private (enrolled students)
 */
router.get('/course/:courseId', 
  authenticateToken, 
  quizController.getQuizzesByCourse
);

/**
 * @route   GET /api/quizzes/lesson/:lessonId
 * @desc    RF-07: Obtener quizzes de una lección específica
 * @access  Private (enrolled students)
 */
router.get('/lesson/:lessonId', 
  authenticateToken, 
  quizController.getQuizzesByLesson
);

export default router;
