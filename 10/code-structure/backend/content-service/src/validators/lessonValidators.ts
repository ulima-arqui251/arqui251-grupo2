import { body, param, query } from 'express-validator';
import { LessonType } from '../types/common';

/**
 * Validador para crear lección
 */
export const validateCreateLesson = [
  body('courseId')
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),

  body('type')
    .isIn(Object.values(LessonType))
    .withMessage(`Tipo de lección debe ser uno de: ${Object.values(LessonType).join(', ')}`),

  body('content')
    .optional()
    .isString()
    .withMessage('El contenido debe ser texto'),

  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video debe ser válida'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview debe ser un valor booleano')
];

/**
 * Validador para actualizar lección
 */
export const validateUpdateLesson = [
  param('id')
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),

  body('type')
    .optional()
    .isIn(Object.values(LessonType))
    .withMessage(`Tipo de lección debe ser uno de: ${Object.values(LessonType).join(', ')}`),

  body('content')
    .optional()
    .isString()
    .withMessage('El contenido debe ser texto'),

  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video debe ser válida'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview debe ser un valor booleano')
];

/**
 * Validador para progreso de lección
 */
export const validateLessonProgress = [
  param('id')
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El progreso debe estar entre 0 y 100'),

  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El tiempo gastado debe ser un número entero positivo'),

  body('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted debe ser un valor booleano')
];

/**
 * Validador para búsqueda de lecciones
 */
export const validateLessonSearch = [
  query('courseId')
    .optional()
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  query('type')
    .optional()
    .isIn(Object.values(LessonType))
    .withMessage(`Tipo de lección debe ser uno de: ${Object.values(LessonType).join(', ')}`),

  query('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview debe ser un valor booleano'),

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
 * Validador para ID de lección
 */
export const validateLessonId = [
  param('id')
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido')
];
