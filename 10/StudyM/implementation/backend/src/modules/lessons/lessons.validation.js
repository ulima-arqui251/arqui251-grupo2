import Joi from 'joi';

// Esquema para crear lección
export const createLessonSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título es requerido'
    }),
    
  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    
  content: Joi.string()
    .min(50)
    .required()
    .messages({
      'string.min': 'El contenido debe tener al menos 50 caracteres',
      'any.required': 'El contenido es requerido'
    }),
    
  subject: Joi.string()
    .valid('mathematics', 'science', 'language', 'history', 'geography', 'art', 'music', 'physical_education', 'technology', 'other')
    .required()
    .messages({
      'any.only': 'La materia debe ser una de las opciones válidas',
      'any.required': 'La materia es requerida'
    }),
    
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .required()
    .messages({
      'any.only': 'El nivel debe ser: beginner, intermediate o advanced',
      'any.required': 'El nivel es requerido'
    }),
    
  estimatedDuration: Joi.number()
    .integer()
    .min(1)
    .max(480) // Máximo 8 horas
    .required()
    .messages({
      'number.integer': 'La duración debe ser un número entero',
      'number.min': 'La duración debe ser al menos 1 minuto',
      'number.max': 'La duración no puede exceder 480 minutos (8 horas)',
      'any.required': 'La duración estimada es requerida'
    }),
    
  points: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(10)
    .messages({
      'number.integer': 'Los puntos deben ser un número entero',
      'number.min': 'Los puntos deben ser al menos 1',
      'number.max': 'Los puntos no pueden exceder 1000'
    }),
    
  tags: Joi.array()
    .items(Joi.string().min(2).max(30))
    .max(10)
    .default([])
    .messages({
      'array.max': 'No se pueden tener más de 10 etiquetas',
      'string.min': 'Cada etiqueta debe tener al menos 2 caracteres',
      'string.max': 'Cada etiqueta no puede exceder 30 caracteres'
    }),
    
  thumbnailUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'La URL de la miniatura debe ser válida'
    }),
    
  videoUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'La URL del video debe ser válida'
    })
});

// Esquema para actualizar lección
export const updateLessonSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
    
  description: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
    
  content: Joi.string()
    .min(50)
    .messages({
      'string.min': 'El contenido debe tener al menos 50 caracteres'
    }),
    
  subject: Joi.string()
    .valid('mathematics', 'science', 'language', 'history', 'geography', 'art', 'music', 'physical_education', 'technology', 'other')
    .messages({
      'any.only': 'La materia debe ser una de las opciones válidas'
    }),
    
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .messages({
      'any.only': 'El nivel debe ser: beginner, intermediate o advanced'
    }),
    
  estimatedDuration: Joi.number()
    .integer()
    .min(1)
    .max(480)
    .messages({
      'number.integer': 'La duración debe ser un número entero',
      'number.min': 'La duración debe ser al menos 1 minuto',
      'number.max': 'La duración no puede exceder 480 minutos (8 horas)'
    }),
    
  points: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .messages({
      'number.integer': 'Los puntos deben ser un número entero',
      'number.min': 'Los puntos deben ser al menos 1',
      'number.max': 'Los puntos no pueden exceder 1000'
    }),
    
  tags: Joi.array()
    .items(Joi.string().min(2).max(30))
    .max(10)
    .messages({
      'array.max': 'No se pueden tener más de 10 etiquetas',
      'string.min': 'Cada etiqueta debe tener al menos 2 caracteres',
      'string.max': 'Cada etiqueta no puede exceder 30 caracteres'
    }),
    
  thumbnailUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'La URL de la miniatura debe ser válida'
    }),
    
  videoUrl: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'La URL del video debe ser válida'
    }),
    
  isPublished: Joi.boolean()
    .messages({
      'boolean.base': 'isPublished debe ser verdadero o falso'
    }),
    
  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso'
    })
});

// Esquema para actualizar progreso
export const updateProgressSchema = Joi.object({
  progressPercentage: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.min': 'El porcentaje de progreso debe ser al menos 0',
      'number.max': 'El porcentaje de progreso no puede exceder 100'
    }),
    
  timeSpent: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.integer': 'El tiempo gastado debe ser un número entero',
      'number.min': 'El tiempo gastado debe ser al menos 0'
    }),
    
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 1000 caracteres'
    })
});

// Esquema para completar lección
export const completeLessonSchema = Joi.object({
  score: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.min': 'La puntuación debe ser al menos 0',
      'number.max': 'La puntuación no puede exceder 100'
    })
});

// Esquema para filtros de lecciones
export const getLessonsSchema = Joi.object({
  subject: Joi.string()
    .valid('mathematics', 'science', 'language', 'history', 'geography', 'art', 'music', 'physical_education', 'technology', 'other'),
    
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced'),
    
  search: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'La búsqueda debe tener al menos 2 caracteres',
      'string.max': 'La búsqueda no puede exceder 100 caracteres'
    }),
    
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'La página debe ser un número entero',
      'number.min': 'La página debe ser al menos 1'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede exceder 100'
    })
});

// Esquema para filtros de progreso del usuario
export const getUserProgressSchema = Joi.object({
  subject: Joi.string()
    .valid('mathematics', 'science', 'language', 'history', 'geography', 'art', 'music', 'physical_education', 'technology', 'other'),
    
  status: Joi.string()
    .valid('not_started', 'in_progress', 'completed')
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
