import Joi from 'joi';

// Esquemas de validación para Panel Docente

// Validación para crear asignación
export const createAssignmentSchema = {
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.min': 'El título debe tener al menos 3 caracteres',
        'string.max': 'El título no puede tener más de 255 caracteres',
        'any.required': 'El título es requerido'
      }),
      
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede tener más de 1000 caracteres'
      }),
      
    instructions: Joi.string()
      .min(10)
      .required()
      .messages({
        'string.min': 'Las instrucciones deben tener al menos 10 caracteres',
        'any.required': 'Las instrucciones son requeridas'
      }),
      
    dueDate: Joi.date()
      .iso()
      .greater('now')
      .required()
      .messages({
        'date.greater': 'La fecha de entrega debe ser en el futuro',
        'any.required': 'La fecha de entrega es requerida'
      }),
      
    maxPoints: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .default(100)
      .messages({
        'number.min': 'Los puntos máximos deben ser al menos 1',
        'number.max': 'Los puntos máximos no pueden ser más de 1000'
      }),
      
    type: Joi.string()
      .valid('homework', 'quiz', 'exam', 'project', 'essay')
      .default('homework')
      .messages({
        'any.only': 'El tipo debe ser uno de: homework, quiz, exam, project, essay'
      }),
      
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .default('medium')
      .messages({
        'any.only': 'La dificultad debe ser: easy, medium o hard'
      }),
      
    isPublished: Joi.boolean()
      .default(false),
      
    allowLateSubmission: Joi.boolean()
      .default(false),
      
    attachments: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().required()
      }))
      .default([]),
      
    courseId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID del curso debe ser un UUID válido',
        'any.required': 'El ID del curso es requerido'
      })
  })
};

// Validación para actualizar asignación
export const updateAssignmentSchema = {
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .optional(),
      
    description: Joi.string()
      .max(1000)
      .optional()
      .allow(''),
      
    instructions: Joi.string()
      .min(10)
      .optional(),
      
    dueDate: Joi.date()
      .iso()
      .greater('now')
      .optional(),
      
    maxPoints: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional(),
      
    type: Joi.string()
      .valid('homework', 'quiz', 'exam', 'project', 'essay')
      .optional(),
      
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .optional(),
      
    isPublished: Joi.boolean()
      .optional(),
      
    allowLateSubmission: Joi.boolean()
      .optional(),
      
    attachments: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().required()
      }))
      .optional()
  }).min(1)
};

// Validación para calificar entrega
export const gradeSubmissionSchema = {
  body: Joi.object({
    grade: Joi.number()
      .min(0)
      .max(100)
      .precision(2)
      .required()
      .messages({
        'number.min': 'La calificación no puede ser menor a 0',
        'number.max': 'La calificación no puede ser mayor a 100',
        'any.required': 'La calificación es requerida'
      }),
      
    feedback: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La retroalimentación no puede tener más de 2000 caracteres'
      })
  })
};

// Validación para crear calificación manual
export const createGradeSchema = {
  body: Joi.object({
    value: Joi.number()
      .min(0)
      .max(100)
      .precision(2)
      .required()
      .messages({
        'number.min': 'La calificación no puede ser menor a 0',
        'number.max': 'La calificación no puede ser mayor a 100',
        'any.required': 'La calificación es requerida'
      }),
      
    weight: Joi.number()
      .min(0)
      .max(10)
      .precision(2)
      .default(1.0)
      .messages({
        'number.min': 'El peso no puede ser menor a 0',
        'number.max': 'El peso no puede ser mayor a 10'
      }),
      
    type: Joi.string()
      .valid('assignment', 'quiz', 'exam', 'participation', 'project')
      .required()
      .messages({
        'any.only': 'El tipo debe ser uno de: assignment, quiz, exam, participation, project',
        'any.required': 'El tipo es requerido'
      }),
      
    comments: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Los comentarios no pueden tener más de 1000 caracteres'
      }),
      
    isExcused: Joi.boolean()
      .default(false),
      
    studentId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID del estudiante debe ser un UUID válido',
        'any.required': 'El ID del estudiante es requerido'
      }),
      
    courseId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID del curso debe ser un UUID válido',
        'any.required': 'El ID del curso es requerido'
      }),
      
    assignmentId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.uuid': 'El ID de la asignación debe ser un UUID válido'
      })
  })
};

// Validación para filtros de asignaciones
export const getAssignmentsSchema = {
  query: Joi.object({
    courseId: Joi.string()
      .uuid()
      .optional(),
      
    type: Joi.string()
      .valid('homework', 'quiz', 'exam', 'project', 'essay')
      .optional(),
      
    isPublished: Joi.string()
      .valid('true', 'false')
      .optional(),
      
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
      
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
      
    sortBy: Joi.string()
      .valid('title', 'dueDate', 'createdAt', 'type')
      .default('dueDate'),
      
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('ASC')
  })
};

// Validación para filtros de entregas
export const getSubmissionsSchema = {
  query: Joi.object({
    status: Joi.string()
      .valid('submitted', 'graded', 'returned', 'late')
      .optional(),
      
    assignmentId: Joi.string()
      .uuid()
      .optional(),
      
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
      
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
      
    sortBy: Joi.string()
      .valid('submittedAt', 'status', 'grade')
      .default('submittedAt'),
      
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
  })
};

// Validación para filtros de estudiantes
export const getCourseStudentsSchema = {
  query: Joi.object({
    status: Joi.string()
      .valid('active', 'completed', 'dropped', 'suspended')
      .optional(),
      
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
      
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
      
    sortBy: Joi.string()
      .valid('enrolledAt', 'progress', 'finalGrade', 'lastName')
      .default('enrolledAt'),
      
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
  })
};

// Validación para filtros de cursos
export const getCoursesSchema = {
  query: Joi.object({
    isActive: Joi.string()
      .valid('true', 'false')
      .optional(),
      
    subject: Joi.string()
      .max(100)
      .optional(),
      
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
      
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
      
    sortBy: Joi.string()
      .valid('title', 'createdAt', 'updatedAt', 'subject')
      .default('updatedAt'),
      
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
  })
};

// Validación para parámetros de ID
export const idParamSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID debe ser un UUID válido',
        'any.required': 'El ID es requerido'
      })
  })
};

export const courseIdParamSchema = {
  params: Joi.object({
    courseId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID del curso debe ser un UUID válido',
        'any.required': 'El ID del curso es requerido'
      })
  })
};

export const assignmentIdParamSchema = {
  params: Joi.object({
    assignmentId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID de la asignación debe ser un UUID válido',
        'any.required': 'El ID de la asignación es requerido'
      })
  })
};

export const submissionIdParamSchema = {
  params: Joi.object({
    submissionId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'El ID de la entrega debe ser un UUID válido',
        'any.required': 'El ID de la entrega es requerido'
      })
  })
};
