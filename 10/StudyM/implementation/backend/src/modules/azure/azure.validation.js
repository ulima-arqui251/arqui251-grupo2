import Joi from 'joi';

const azureValidation = {
  // Validación para análisis de sentimiento
  analyzeSentiment: {
    body: Joi.object({
      text: Joi.string()
        .min(1)
        .max(5000)
        .required()
        .messages({
          'string.empty': 'El texto no puede estar vacío',
          'string.min': 'El texto debe tener al menos 1 carácter',
          'string.max': 'El texto no puede exceder 5000 caracteres',
          'any.required': 'El texto es requerido'
        })
    })
  },

  // Validación para extracción de frases clave
  extractKeyPhrases: {
    body: Joi.object({
      text: Joi.string()
        .min(1)
        .max(5000)
        .required()
        .messages({
          'string.empty': 'El texto no puede estar vacío',
          'string.min': 'El texto debe tener al menos 1 carácter',
          'string.max': 'El texto no puede exceder 5000 caracteres',
          'any.required': 'El texto es requerido'
        })
    })
  },

  // Validación para detección de idioma
  detectLanguage: {
    body: Joi.object({
      text: Joi.string()
        .min(1)
        .max(5000)
        .required()
        .messages({
          'string.empty': 'El texto no puede estar vacío',
          'string.min': 'El texto debe tener al menos 1 carácter',
          'string.max': 'El texto no puede exceder 5000 caracteres',
          'any.required': 'El texto es requerido'
        })
    })
  },

  // Validación para análisis de imagen
  analyzeImage: {
    body: Joi.object({
      imageUrl: Joi.string()
        .uri()
        .required()
        .messages({
          'string.uri': 'Debe ser una URL válida',
          'any.required': 'La URL de la imagen es requerida'
        })
    })
  },

  // Validación para extracción de texto de imagen
  extractTextFromImage: {
    body: Joi.object({
      imageUrl: Joi.string()
        .uri()
        .required()
        .messages({
          'string.uri': 'Debe ser una URL válida',
          'any.required': 'La URL de la imagen es requerida'
        })
    })
  },

  // Validación para traducción de texto
  translateText: {
    body: Joi.object({
      text: Joi.string()
        .min(1)
        .max(5000)
        .required()
        .messages({
          'string.empty': 'El texto no puede estar vacío',
          'string.min': 'El texto debe tener al menos 1 carácter',
          'string.max': 'El texto no puede exceder 5000 caracteres',
          'any.required': 'El texto es requerido'
        }),
      targetLanguage: Joi.string()
        .length(2)
        .required()
        .messages({
          'string.length': 'El idioma objetivo debe ser un código de 2 caracteres (ej: "es", "en")',
          'any.required': 'El idioma objetivo es requerido'
        }),
      sourceLanguage: Joi.string()
        .length(2)
        .optional()
        .messages({
          'string.length': 'El idioma origen debe ser un código de 2 caracteres (ej: "es", "en")'
        })
    })
  },

  // Validación para resumen de texto
  summarizeText: {
    body: Joi.object({
      text: Joi.string()
        .min(50)
        .max(10000)
        .required()
        .messages({
          'string.empty': 'El texto no puede estar vacío',
          'string.min': 'El texto debe tener al menos 50 caracteres para generar un resumen',
          'string.max': 'El texto no puede exceder 10000 caracteres',
          'any.required': 'El texto es requerido'
        })
    })
  },

  // Validación para procesamiento de contenido educativo
  processEducationalContent: {
    body: Joi.object({
      content: Joi.string()
        .min(10)
        .max(10000)
        .required()
        .messages({
          'string.empty': 'El contenido no puede estar vacío',
          'string.min': 'El contenido debe tener al menos 10 caracteres',
          'string.max': 'El contenido no puede exceder 10000 caracteres',
          'any.required': 'El contenido es requerido'
        })
    })
  },

  // Validación para análisis de contenido de lección
  analyzeLessonContent: {
    body: Joi.object({
      content: Joi.string()
        .min(1)
        .max(15000)
        .required()
        .messages({
          'string.empty': 'El contenido no puede estar vacío',
          'string.min': 'El contenido debe tener al menos 1 carácter',
          'string.max': 'El contenido no puede exceder 15000 caracteres',
          'any.required': 'El contenido es requerido'
        }),
      type: Joi.string()
        .valid('text', 'image')
        .required()
        .messages({
          'any.only': 'El tipo debe ser "text" o "image"',
          'any.required': 'El tipo de contenido es requerido'
        })
    })
  },

  // Validación para comparación de contenidos educativos
  compareEducationalContent: {
    body: Joi.object({
      content1: Joi.string()
        .min(10)
        .max(10000)
        .required()
        .messages({
          'string.empty': 'El primer contenido no puede estar vacío',
          'string.min': 'El primer contenido debe tener al menos 10 caracteres',
          'string.max': 'El primer contenido no puede exceder 10000 caracteres',
          'any.required': 'El primer contenido es requerido'
        }),
      content2: Joi.string()
        .min(10)
        .max(10000)
        .required()
        .messages({
          'string.empty': 'El segundo contenido no puede estar vacío',
          'string.min': 'El segundo contenido debe tener al menos 10 caracteres',
          'string.max': 'El segundo contenido no puede exceder 10000 caracteres',
          'any.required': 'El segundo contenido es requerido'
        })
    })
  }
};

export default azureValidation;
