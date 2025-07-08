import Joi from 'joi';
import { AuthService } from './auth.service.js';

// Esquema para registro
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .custom((value, helpers) => {
      const validationError = AuthService.validatePassword(value);
      if (validationError) {
        return helpers.error('any.custom', { message: validationError });
      }
      return value;
    })
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras',
      'any.required': 'El nombre es requerido'
    }),
    
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'string.pattern.base': 'El apellido solo puede contener letras',
      'any.required': 'El apellido es requerido'
    }),
    
  role: Joi.string()
    .valid('estudiante', 'teacher', 'admin')
    .default('estudiante')
    .messages({
      'any.only': 'Rol debe ser: estudiante, teacher o admin'
    }),
    
  institutionId: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'ID de institución muy largo'
    })
});

// Esquema para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    })
});

// Esquema para login con 2FA opcional
export const loginWith2FASchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    }),
    
  twoFactorToken: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      'string.length': 'El código de 2FA debe tener 6 dígitos',
      'string.pattern.base': 'El código de 2FA debe contener solo números'
    })
});

// Esquema para habilitar 2FA
export const enable2FASchema = Joi.object({
  token: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'El token debe tener 6 dígitos',
      'string.pattern.base': 'El token debe contener solo números',
      'any.required': 'El token es requerido'
    })
});

// Esquema para deshabilitar 2FA
export const disable2FASchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida para deshabilitar 2FA'
    })
});

// Esquema para verificar token 2FA
export const verify2FASchema = Joi.object({
  tempToken: Joi.string()
    .required()
    .messages({
      'any.required': 'El token temporal es requerido'
    }),
    
  twoFactorToken: Joi.alternatives()
    .try(
      // Token normal de 6 dígitos
      Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/),
      // Código de respaldo de 8 caracteres
      Joi.string()
        .length(8)
        .pattern(/^[A-Z0-9]+$/)
    )
    .required()
    .messages({
      'alternatives.match': 'Debe ser un código de 6 dígitos o un código de respaldo de 8 caracteres',
      'any.required': 'El código de 2FA es requerido'
    })
});

// Middleware de validación
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

// Middleware para validar schemas de 2FA
export const validate2FA = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};