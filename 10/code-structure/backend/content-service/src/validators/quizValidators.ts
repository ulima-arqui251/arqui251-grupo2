import { body, param, query } from 'express-validator';
import { QuizType } from '../types/common';

/**
 * Validador para crear quiz
 */
export const validateCreateQuiz = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Las instrucciones no pueden exceder 2000 caracteres'),

  body('lessonId')
    .optional()
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  body('courseId')
    .optional()
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El límite de tiempo debe ser al menos 1 minuto'),

  body('passingScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La puntuación de aprobación debe estar entre 0 y 100'),

  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número máximo de intentos debe ser al menos 1'),

  body('shuffleQuestions')
    .optional()
    .isBoolean()
    .withMessage('shuffleQuestions debe ser un valor booleano'),

  body('showCorrectAnswers')
    .optional()
    .isBoolean()
    .withMessage('showCorrectAnswers debe ser un valor booleano'),

  body('isGraded')
    .optional()
    .isBoolean()
    .withMessage('isGraded debe ser un valor booleano'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  // Validación de preguntas
  body('questions')
    .optional()
    .isArray()
    .withMessage('Las preguntas deben ser un array'),

  body('questions.*.type')
    .optional()
    .isIn(Object.values(QuizType))
    .withMessage(`Tipo de pregunta debe ser uno de: ${Object.values(QuizType).join(', ')}`),

  body('questions.*.question')
    .optional()
    .isLength({ min: 5, max: 1000 })
    .withMessage('La pregunta debe tener entre 5 y 1000 caracteres'),

  body('questions.*.points')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Los puntos deben ser un número positivo'),

  body('questions.*.orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  // Validación personalizada: debe pertenecer a lección O curso
  body().custom((body) => {
    if (!body.lessonId && !body.courseId) {
      throw new Error('El quiz debe pertenecer a una lección o a un curso');
    }
    return true;
  }),

  // Validación personalizada: puntuación de aprobación para quizzes calificados
  body().custom((body) => {
    if (body.isGraded && body.passingScore === undefined) {
      throw new Error('La puntuación de aprobación es requerida para quizzes calificados');
    }
    return true;
  })
];

/**
 * Validador para actualizar quiz
 */
export const validateUpdateQuiz = [
  param('id')
    .isUUID(4)
    .withMessage('ID del quiz debe ser un UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Las instrucciones no pueden exceder 2000 caracteres'),

  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El límite de tiempo debe ser al menos 1 minuto'),

  body('passingScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La puntuación de aprobación debe estar entre 0 y 100'),

  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número máximo de intentos debe ser al menos 1'),

  body('shuffleQuestions')
    .optional()
    .isBoolean()
    .withMessage('shuffleQuestions debe ser un valor booleano'),

  body('showCorrectAnswers')
    .optional()
    .isBoolean()
    .withMessage('showCorrectAnswers debe ser un valor booleano'),

  body('isGraded')
    .optional()
    .isBoolean()
    .withMessage('isGraded debe ser un valor booleano'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo')
];

/**
 * Validador para intento de quiz
 */
export const validateQuizAttempt = [
  param('id')
    .isUUID(4)
    .withMessage('ID del quiz debe ser un UUID válido'),

  body('answers')
    .optional()
    .isArray()
    .withMessage('Las respuestas deben ser un array'),

  body('answers.*.questionId')
    .optional()
    .isUUID(4)
    .withMessage('ID de la pregunta debe ser un UUID válido'),

  body('answers.*.answer')
    .optional()
    .custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('La respuesta debe ser un string o array de strings');
    })
];

/**
 * Validador para búsqueda de quizzes
 */
export const validateQuizSearch = [
  query('courseId')
    .optional()
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  query('lessonId')
    .optional()
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  query('isGraded')
    .optional()
    .isBoolean()
    .withMessage('isGraded debe ser un valor booleano'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
];

/**
 * Validador para ID de quiz
 */
export const validateQuizId = [
  param('id')
    .isUUID(4)
    .withMessage('ID del quiz debe ser un UUID válido')
];

/**
 * Validador para ID de intento
 */
export const validateAttemptId = [
  param('attemptId')
    .isUUID(4)
    .withMessage('ID del intento debe ser un UUID válido')
];
