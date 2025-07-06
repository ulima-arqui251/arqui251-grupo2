import { body, param, query } from 'express-validator';
import { MaterialType } from '../types/common';

/**
 * Validador para crear material
 */
export const validateCreateMaterial = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('type')
    .isIn(Object.values(MaterialType))
    .withMessage(`Tipo de material debe ser uno de: ${Object.values(MaterialType).join(', ')}`),

  body('lessonId')
    .optional()
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  body('courseId')
    .optional()
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  body('externalUrl')
    .optional()
    .isURL()
    .withMessage('La URL externa debe ser válida'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  body('isDownloadable')
    .optional()
    .isBoolean()
    .withMessage('isDownloadable debe ser un valor booleano'),

  // Validación personalizada: debe pertenecer a lección O curso
  body().custom((body) => {
    if (!body.lessonId && !body.courseId) {
      throw new Error('El material debe pertenecer a una lección o a un curso');
    }
    return true;
  }),

  // Validación personalizada: URL externa para tipo LINK
  body().custom((body) => {
    if (body.type === MaterialType.LINK && !body.externalUrl) {
      throw new Error('URL externa es requerida para materiales tipo LINK');
    }
    return true;
  })
];

/**
 * Validador para actualizar material
 */
export const validateUpdateMaterial = [
  param('id')
    .isUUID(4)
    .withMessage('ID del material debe ser un UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('type')
    .optional()
    .isIn(Object.values(MaterialType))
    .withMessage(`Tipo de material debe ser uno de: ${Object.values(MaterialType).join(', ')}`),

  body('externalUrl')
    .optional()
    .isURL()
    .withMessage('La URL externa debe ser válida'),

  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El índice de orden debe ser un número entero positivo'),

  body('isDownloadable')
    .optional()
    .isBoolean()
    .withMessage('isDownloadable debe ser un valor booleano')
];

/**
 * Validador para búsqueda de materiales
 */
export const validateMaterialSearch = [
  query('courseId')
    .optional()
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  query('lessonId')
    .optional()
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido'),

  query('type')
    .optional()
    .isIn(Object.values(MaterialType))
    .withMessage(`Tipo de material debe ser uno de: ${Object.values(MaterialType).join(', ')}`),

  query('isDownloadable')
    .optional()
    .isBoolean()
    .withMessage('isDownloadable debe ser un valor booleano'),

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
 * Validador para ID de material
 */
export const validateMaterialId = [
  param('id')
    .isUUID(4)
    .withMessage('ID del material debe ser un UUID válido')
];

/**
 * Validador para parámetros de curso en materiales
 */
export const validateCourseIdParam = [
  param('courseId')
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido')
];

/**
 * Validador para parámetros de lección en materiales
 */
export const validateLessonIdParam = [
  param('lessonId')
    .isUUID(4)
    .withMessage('ID de la lección debe ser un UUID válido')
];
