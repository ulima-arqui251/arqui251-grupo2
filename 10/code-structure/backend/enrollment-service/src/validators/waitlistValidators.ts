import { body, param, query } from 'express-validator';

/**
 * Validadores para lista de espera
 */
export const addToWaitlistValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido'),
  
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('priority debe ser un número entero entre 1 y 10')
];

export const waitlistParamValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido')
];

export const notifyWaitlistValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido'),
  
  body('count')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('count debe ser un número entero entre 1 y 50')
];

export const waitlistQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un número entero entre 1 y 100')
];

export const waitlistStatsValidation = [
  query('courseId')
    .optional()
    .isUUID()
    .withMessage('courseId debe ser un UUID válido')
];
