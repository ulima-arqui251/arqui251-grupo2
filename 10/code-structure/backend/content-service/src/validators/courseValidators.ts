import { body, param, query } from 'express-validator';
import { CourseStatus, DifficultyLevel } from '../types/common';

/**
 * Validador para crear curso
 */
export const validateCreateCourse = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('instructorId')
    .isUUID(4)
    .withMessage('ID del instructor debe ser un UUID válido'),

  body('categoryId')
    .optional()
    .isUUID(4)
    .withMessage('ID de categoría debe ser un UUID válido'),

  body('status')
    .optional()
    .isIn(Object.values(CourseStatus))
    .withMessage(`Estado debe ser uno de: ${Object.values(CourseStatus).join(', ')}`),

  body('difficultyLevel')
    .isIn(Object.values(DifficultyLevel))
    .withMessage(`Nivel de dificultad debe ser uno de: ${Object.values(DifficultyLevel).join(', ')}`),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),

  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la miniatura debe ser válida'),

  body('previewVideoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video de vista previa debe ser válida'),

  body('requirements')
    .optional()
    .isArray()
    .withMessage('Los requisitos deben ser un array'),

  body('learningOutcomes')
    .optional()
    .isArray()
    .withMessage('Los objetivos de aprendizaje deben ser un array'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),

  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número máximo de estudiantes debe ser al menos 1'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

/**
 * Validador para actualizar curso
 */
export const validateUpdateCourse = [
  param('id')
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),

  body('description')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('categoryId')
    .optional()
    .isUUID(4)
    .withMessage('ID de categoría debe ser un UUID válido'),

  body('status')
    .optional()
    .isIn(Object.values(CourseStatus))
    .withMessage(`Estado debe ser uno de: ${Object.values(CourseStatus).join(', ')}`),

  body('difficultyLevel')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage(`Nivel de dificultad debe ser uno de: ${Object.values(DifficultyLevel).join(', ')}`),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),

  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la miniatura debe ser válida'),

  body('previewVideoUrl')
    .optional()
    .isURL()
    .withMessage('La URL del video de vista previa debe ser válida'),

  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número máximo de estudiantes debe ser al menos 1'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

/**
 * Validador para búsqueda de cursos
 */
export const validateCourseSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('El término de búsqueda debe tener entre 1 y 255 caracteres'),

  query('category')
    .optional()
    .isUUID(4)
    .withMessage('La categoría debe ser un UUID válido'),

  query('instructor')
    .optional()
    .isUUID(4)
    .withMessage('El instructor debe ser un UUID válido'),

  query('difficultyLevel')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage(`Nivel de dificultad debe ser uno de: ${Object.values(DifficultyLevel).join(', ')}`),

  query('priceMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),

  query('priceMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo'),

  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La calificación debe estar entre 0 y 5'),

  query('status')
    .optional()
    .isIn(Object.values(CourseStatus))
    .withMessage(`Estado debe ser uno de: ${Object.values(CourseStatus).join(', ')}`),

  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string');
      }
      return false;
    })
    .withMessage('Las etiquetas deben ser strings')
];

/**
 * Validador para inscripción en curso
 */
export const validateEnrollment = [
  param('id')
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido')
];

/**
 * Validador para parámetros de ID
 */
export const validateCourseId = [
  param('id')
    .isUUID(4)
    .withMessage('ID del curso debe ser un UUID válido')
];
