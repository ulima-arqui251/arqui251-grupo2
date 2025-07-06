import { body, param } from 'express-validator';

/**
 * Validadores para capacidad de cursos
 */
export const createCourseCapacityValidation = [
  body('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido'),
  
  body('maxCapacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('maxCapacity debe ser un número entero entre 1 y 10000'),
  
  body('allowWaitlist')
    .optional()
    .isBoolean()
    .withMessage('allowWaitlist debe ser un valor booleano')
];

export const updateCourseCapacityValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido'),
  
  body('maxCapacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('maxCapacity debe ser un número entero entre 1 y 10000'),
  
  body('allowWaitlist')
    .optional()
    .isBoolean()
    .withMessage('allowWaitlist debe ser un valor booleano')
];

export const courseCapacityParamValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido')
];
