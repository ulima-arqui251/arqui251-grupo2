import { body, param, query } from 'express-validator';
import { EnrollmentStatus, PaymentStatus } from '../types';

/**
 * Validadores para inscripciones
 */
export const createEnrollmentValidation = [
  body('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido'),
  
  body('paymentMethod')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('paymentMethod debe tener entre 2 y 50 caracteres'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('notes no puede exceder 1000 caracteres')
];

export const updateEnrollmentValidation = [
  param('enrollmentId')
    .isUUID()
    .withMessage('enrollmentId debe ser un UUID válido'),
  
  body('status')
    .optional()
    .isIn(Object.values(EnrollmentStatus))
    .withMessage(`status debe ser uno de: ${Object.values(EnrollmentStatus).join(', ')}`),
  
  body('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`paymentStatus debe ser uno de: ${Object.values(PaymentStatus).join(', ')}`),
  
  body('reason')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('reason debe tener entre 3 y 500 caracteres')
];

export const cancelEnrollmentValidation = [
  param('enrollmentId')
    .isUUID()
    .withMessage('enrollmentId debe ser un UUID válido'),
  
  body('reason')
    .optional()
    .isLength({ min: 3, max: 500 })
    .withMessage('reason debe tener entre 3 y 500 caracteres')
];

export const courseParamValidation = [
  param('courseId')
    .isUUID()
    .withMessage('courseId debe ser un UUID válido')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un número entero entre 1 y 100')
];

export const enrollmentQueryValidation = [
  query('status')
    .optional()
    .isIn(Object.values(EnrollmentStatus))
    .withMessage(`status debe ser uno de: ${Object.values(EnrollmentStatus).join(', ')}`),
  
  ...paginationValidation
];
