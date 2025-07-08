import Joi from 'joi';

// Esquema para agregar puntos
export const addPointsSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
      'any.required': 'El ID del usuario es requerido'
    }),
    
  points: Joi.number()
    .integer()
    .min(-10000)
    .max(10000)
    .required()
    .messages({
      'number.base': 'Los puntos deben ser un número',
      'number.integer': 'Los puntos deben ser un número entero',
      'number.min': 'Los puntos no pueden ser menores a -10000',
      'number.max': 'Los puntos no pueden ser mayores a 10000',
      'any.required': 'Los puntos son requeridos'
    }),
    
  type: Joi.string()
    .valid(
      'lesson_completed',
      'achievement_unlocked',
      'daily_bonus',
      'streak_bonus',
      'perfect_score',
      'first_lesson',
      'quiz_completed',
      'challenge_completed',
      'referral_bonus',
      'admin_adjustment'
    )
    .default('admin_adjustment')
    .messages({
      'any.only': 'Tipo de transacción no válido'
    }),
    
  description: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'La descripción debe tener al menos 5 caracteres',
      'string.max': 'La descripción no puede exceder 255 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    
  metadata: Joi.object()
    .allow(null)
    .messages({
      'object.base': 'Los metadatos deben ser un objeto válido'
    })
});

// Esquema para desbloquear logro
export const unlockAchievementSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
      'any.required': 'El ID del usuario es requerido'
    }),
    
  achievementId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del logro debe ser un número',
      'number.integer': 'El ID del logro debe ser un número entero',
      'number.positive': 'El ID del logro debe ser positivo',
      'any.required': 'El ID del logro es requerido'
    })
});

// Esquema para filtros de ranking
export const leaderboardQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.integer': 'La página debe ser un número entero',
      'number.min': 'La página debe ser al menos 1'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede exceder 100'
    })
});

// Esquema para filtros de logros
export const achievementsQuerySchema = Joi.object({
  category: Joi.string()
    .valid('lessons', 'points', 'streak', 'subject', 'time', 'social', 'special')
    .messages({
      'any.only': 'Categoría de logro no válida'
    }),
    
  rarity: Joi.string()
    .valid('common', 'uncommon', 'rare', 'epic', 'legendary')
    .messages({
      'any.only': 'Rareza de logro no válida'
    }),
    
  includeProgress: Joi.string()
    .valid('true', 'false')
    .default('true')
    .messages({
      'any.only': 'includeProgress debe ser true o false'
    })
});

// Validación para parámetros de materia
export const subjectParamSchema = Joi.object({
  subject: Joi.string()
    .valid(
      'mathematics', 
      'science', 
      'language', 
      'history', 
      'geography', 
      'art', 
      'music', 
      'physicalEducation', 
      'technology', 
      'other'
    )
    .required()
    .messages({
      'any.only': 'Materia no válida',
      'any.required': 'La materia es requerida'
    })
});

// Validación para parámetros de usuario
export const userParamSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
      'any.required': 'El ID del usuario es requerido'
    })
});

// Middleware de validación para body
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

// Middleware de validación para query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.query = value;
    next();
  };
};

// Middleware de validación para parámetros de ruta
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de ruta inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.params = value;
    next();
  };
};
