import Joi from 'joi';

const communityValidation = {
  // Validación para crear post
  createPost: {
    body: Joi.object({
      title: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
          'string.empty': 'El título es requerido',
          'string.min': 'El título debe tener al menos 3 caracteres',
          'string.max': 'El título no puede exceder 200 caracteres',
          'any.required': 'El título es requerido'
        }),
      content: Joi.string()
        .min(10)
        .max(5000)
        .required()
        .messages({
          'string.empty': 'El contenido es requerido',
          'string.min': 'El contenido debe tener al menos 10 caracteres',
          'string.max': 'El contenido no puede exceder 5000 caracteres',
          'any.required': 'El contenido es requerido'
        }),
      type: Joi.string()
        .valid('question', 'discussion', 'resource', 'announcement')
        .default('discussion')
        .messages({
          'any.only': 'El tipo debe ser: question, discussion, resource o announcement'
        }),
      subject: Joi.string()
        .valid('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general')
        .optional()
        .messages({
          'any.only': 'La materia debe ser: matematicas, ciencias, lenguaje, historia, arte, tecnologia o general'
        }),
      tags: Joi.array()
        .items(Joi.string().max(50))
        .max(10)
        .optional()
        .messages({
          'array.max': 'Máximo 10 tags permitidos',
          'string.max': 'Cada tag no puede exceder 50 caracteres'
        })
    })
  },

  // Validación para actualizar post
  updatePost: {
    body: Joi.object({
      title: Joi.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
          'string.min': 'El título debe tener al menos 3 caracteres',
          'string.max': 'El título no puede exceder 200 caracteres'
        }),
      content: Joi.string()
        .min(10)
        .max(5000)
        .optional()
        .messages({
          'string.min': 'El contenido debe tener al menos 10 caracteres',
          'string.max': 'El contenido no puede exceder 5000 caracteres'
        }),
      subject: Joi.string()
        .valid('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general')
        .optional()
        .messages({
          'any.only': 'La materia debe ser: matematicas, ciencias, lenguaje, historia, arte, tecnologia o general'
        }),
      tags: Joi.array()
        .items(Joi.string().max(50))
        .max(10)
        .optional()
        .messages({
          'array.max': 'Máximo 10 tags permitidos',
          'string.max': 'Cada tag no puede exceder 50 caracteres'
        }),
      isResolved: Joi.boolean().optional()
    })
  },

  // Validación para like/dislike post
  togglePostLike: {
    body: Joi.object({
      type: Joi.string()
        .valid('like', 'dislike')
        .default('like')
        .messages({
          'any.only': 'El tipo debe ser "like" o "dislike"'
        })
    })
  },

  // Validación para crear comentario
  createComment: {
    body: Joi.object({
      content: Joi.string()
        .min(1)
        .max(2000)
        .required()
        .messages({
          'string.empty': 'El contenido del comentario es requerido',
          'string.min': 'El comentario debe tener al menos 1 carácter',
          'string.max': 'El comentario no puede exceder 2000 caracteres',
          'any.required': 'El contenido del comentario es requerido'
        }),
      postId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'El ID del post debe ser un número',
          'number.integer': 'El ID del post debe ser un número entero',
          'number.positive': 'El ID del post debe ser positivo',
          'any.required': 'El ID del post es requerido'
        }),
      parentCommentId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
          'number.base': 'El ID del comentario padre debe ser un número',
          'number.integer': 'El ID del comentario padre debe ser un número entero',
          'number.positive': 'El ID del comentario padre debe ser positivo'
        })
    })
  },

  // Validación para like/dislike comentario
  toggleCommentLike: {
    body: Joi.object({
      type: Joi.string()
        .valid('like', 'dislike')
        .default('like')
        .messages({
          'any.only': 'El tipo debe ser "like" o "dislike"'
        })
    })
  },

  // Validación para crear grupo de estudio
  createStudyGroup: {
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
          'string.empty': 'El nombre del grupo es requerido',
          'string.min': 'El nombre debe tener al menos 3 caracteres',
          'string.max': 'El nombre no puede exceder 100 caracteres',
          'any.required': 'El nombre del grupo es requerido'
        }),
      description: Joi.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
          'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
      subject: Joi.string()
        .valid('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general')
        .required()
        .messages({
          'any.only': 'La materia debe ser: matematicas, ciencias, lenguaje, historia, arte, tecnologia o general',
          'any.required': 'La materia es requerida'
        }),
      level: Joi.string()
        .valid('principiante', 'intermedio', 'avanzado')
        .default('principiante')
        .messages({
          'any.only': 'El nivel debe ser: principiante, intermedio o avanzado'
        }),
      isPrivate: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'isPrivate debe ser true o false'
        }),
      maxMembers: Joi.number()
        .integer()
        .min(2)
        .max(50)
        .default(20)
        .messages({
          'number.base': 'El máximo de miembros debe ser un número',
          'number.integer': 'El máximo de miembros debe ser un número entero',
          'number.min': 'El grupo debe permitir al menos 2 miembros',
          'number.max': 'El grupo no puede tener más de 50 miembros'
        })
    })
  },

  // Validación para parámetros de consulta de posts
  getPosts: {
    query: Joi.object({
      type: Joi.string()
        .valid('question', 'discussion', 'resource', 'announcement')
        .optional(),
      subject: Joi.string()
        .valid('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general')
        .optional(),
      search: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'La búsqueda no puede exceder 100 caracteres'
        }),
      userId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
          'number.base': 'El ID de usuario debe ser un número',
          'number.integer': 'El ID de usuario debe ser un número entero',
          'number.positive': 'El ID de usuario debe ser positivo'
        }),
      isPinned: Joi.string()
        .valid('true', 'false')
        .optional(),
      isResolved: Joi.string()
        .valid('true', 'false')
        .optional(),
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .messages({
          'number.base': 'La página debe ser un número',
          'number.integer': 'La página debe ser un número entero',
          'number.min': 'La página debe ser al menos 1'
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .optional()
        .messages({
          'number.base': 'El límite debe ser un número',
          'number.integer': 'El límite debe ser un número entero',
          'number.min': 'El límite debe ser al menos 1',
          'number.max': 'El límite no puede exceder 100'
        }),
      sortBy: Joi.string()
        .valid('createdAt', 'likeCount', 'viewCount', 'title')
        .default('createdAt')
        .optional(),
      sortOrder: Joi.string()
        .valid('ASC', 'DESC')
        .default('DESC')
        .optional()
    })
  },

  // Validación para parámetros de consulta de grupos
  getStudyGroups: {
    query: Joi.object({
      subject: Joi.string()
        .valid('matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general')
        .optional(),
      level: Joi.string()
        .valid('principiante', 'intermedio', 'avanzado')
        .optional(),
      search: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'La búsqueda no puede exceder 100 caracteres'
        }),
      isPrivate: Joi.string()
        .valid('true', 'false')
        .optional(),
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .messages({
          'number.base': 'La página debe ser un número',
          'number.integer': 'La página debe ser un número entero',
          'number.min': 'La página debe ser al menos 1'
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
        .optional()
        .messages({
          'number.base': 'El límite debe ser un número',
          'number.integer': 'El límite debe ser un número entero',
          'number.min': 'El límite debe ser al menos 1',
          'number.max': 'El límite no puede exceder 50'
        })
    })
  },

  // Validación para parámetros de ID
  idParam: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'El ID debe ser un número',
          'number.integer': 'El ID debe ser un número entero',
          'number.positive': 'El ID debe ser positivo',
          'any.required': 'El ID es requerido'
        })
    })
  },

  // Validación para parámetros de userId
  userIdParam: {
    params: Joi.object({
      userId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'El ID de usuario debe ser un número',
          'number.integer': 'El ID de usuario debe ser un número entero',
          'number.positive': 'El ID de usuario debe ser positivo',
          'any.required': 'El ID de usuario es requerido'
        })
    })
  }
};

export default communityValidation;
