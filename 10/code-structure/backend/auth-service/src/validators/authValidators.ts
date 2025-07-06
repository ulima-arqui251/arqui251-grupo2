import { body } from 'express-validator';

/**
 * RF-01: Validaciones para registro de usuario
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
    
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
    
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin', 'support'])
    .withMessage('Rol inválido'),
    
  body('acceptTerms')
    .isBoolean()
    .withMessage('Debe aceptar los términos y condiciones')
    .equals('true')
    .withMessage('Debe aceptar los términos y condiciones para continuar')
];

/**
 * RF-03: Validaciones para login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
    
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('El código 2FA debe tener 6 dígitos')
    .isNumeric()
    .withMessage('El código 2FA debe ser numérico')
];

/**
 * RF-04: Validaciones para solicitud de reset de contraseña
 */
export const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
];

/**
 * RF-04: Validaciones para reset de contraseña
 */
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido')
    .isLength({ min: 32, max: 64 })
    .withMessage('Token inválido'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número')
];

/**
 * RF-03: Validaciones para verificación 2FA
 */
export const validateTwoFactorVerification = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos')
    .isNumeric()
    .withMessage('El código debe ser numérico')
];

/**
 * Validación para actualizar perfil
 */
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
    
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('La URL de la foto debe ser válida')
];
