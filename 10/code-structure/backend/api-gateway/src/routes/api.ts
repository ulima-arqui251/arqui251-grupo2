import { Router } from 'express';

const router = Router();

// Información general de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api/docs',
    health: '/health',
    services: {
      auth: '/api/auth',
      users: '/api/users',
      content: '/api/content',
      enrollment: '/api/enrollment',
      notifications: '/api/notifications',
      analytics: '/api/analytics'
    }
  });
});

// Documentación completa de la API
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      description: 'Obtén el token haciendo login en /api/auth/login'
    },
    rateLimit: {
      general: {
        window: '15 minutes',
        max: '1000 requests',
        description: 'Límite general para todas las APIs'
      },
      auth: {
        window: '15 minutes',
        max: '10 requests',
        description: 'Límite para endpoints de autenticación'
      },
      write: {
        window: '1 minute',
        max: '50 requests',
        description: 'Límite para operaciones de escritura (POST, PUT, DELETE)'
      },
      upload: {
        window: '10 minutes',
        max: '20 requests',
        description: 'Límite para subida de archivos'
      }
    },
    services: {
      auth: {
        baseUrl: '/api/auth',
        description: 'Servicio de autenticación y autorización',
        endpoints: [
          {
            method: 'POST',
            path: '/api/auth/register',
            description: 'Registro de nuevos usuarios',
            auth: false,
            rateLimit: 'auth',
            body: {
              email: 'string (required)',
              password: 'string (required, min 8 chars)',
              firstName: 'string (required)',
              lastName: 'string (required)',
              role: 'string (optional, default: student)'
            }
          },
          {
            method: 'POST',
            path: '/api/auth/login',
            description: 'Inicio de sesión',
            auth: false,
            rateLimit: 'auth',
            body: {
              email: 'string (required)',
              password: 'string (required)'
            }
          },
          {
            method: 'POST',
            path: '/api/auth/refresh',
            description: 'Renovar token de acceso',
            auth: false,
            rateLimit: 'auth',
            body: {
              refreshToken: 'string (required)'
            }
          },
          {
            method: 'POST',
            path: '/api/auth/logout',
            description: 'Cerrar sesión',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/auth/verify-email',
            description: 'Verificar email con token',
            auth: false,
            rateLimit: 'auth',
            body: {
              token: 'string (required)'
            }
          },
          {
            method: 'POST',
            path: '/api/auth/reset-password',
            description: 'Restablecer contraseña',
            auth: false,
            rateLimit: 'auth',
            body: {
              email: 'string (required)'
            }
          }
        ]
      },
      users: {
        baseUrl: '/api/users',
        description: 'Servicio de gestión de perfiles de usuario',
        endpoints: [
          {
            method: 'GET',
            path: '/api/users/profile',
            description: 'Obtener perfil del usuario autenticado',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'PUT',
            path: '/api/users/profile',
            description: 'Actualizar perfil del usuario',
            auth: true,
            rateLimit: 'write',
            body: {
              firstName: 'string (optional)',
              lastName: 'string (optional)',
              bio: 'string (optional)',
              avatar: 'file (optional)'
            }
          },
          {
            method: 'GET',
            path: '/api/users/preferences',
            description: 'Obtener preferencias del usuario',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'PUT',
            path: '/api/users/preferences',
            description: 'Actualizar preferencias del usuario',
            auth: true,
            rateLimit: 'write',
            body: {
              language: 'string (optional)',
              theme: 'string (optional)',
              notifications: 'object (optional)'
            }
          },
          {
            method: 'DELETE',
            path: '/api/users/account',
            description: 'Eliminar cuenta del usuario',
            auth: true,
            rateLimit: 'write'
          }
        ]
      },
      content: {
        baseUrl: '/api/content',
        description: 'Servicio de gestión de contenido educativo',
        endpoints: [
          {
            method: 'GET',
            path: '/api/content/courses',
            description: 'Listar cursos disponibles',
            auth: false,
            rateLimit: 'general',
            query: {
              page: 'number (optional, default: 1)',
              limit: 'number (optional, default: 10)',
              search: 'string (optional)',
              category: 'string (optional)',
              level: 'string (optional)'
            }
          },
          {
            method: 'POST',
            path: '/api/content/courses',
            description: 'Crear nuevo curso (solo instructores)',
            auth: true,
            roles: ['instructor', 'admin'],
            rateLimit: 'write',
            body: {
              title: 'string (required)',
              description: 'string (required)',
              categoryId: 'string (required)',
              level: 'string (required)',
              price: 'number (optional)',
              thumbnail: 'file (optional)'
            }
          },
          {
            method: 'GET',
            path: '/api/content/courses/:id',
            description: 'Obtener detalles de un curso',
            auth: false,
            rateLimit: 'general'
          },
          {
            method: 'PUT',
            path: '/api/content/courses/:id',
            description: 'Actualizar curso (solo propietario)',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'DELETE',
            path: '/api/content/courses/:id',
            description: 'Eliminar curso (solo propietario)',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'GET',
            path: '/api/content/courses/:id/lessons',
            description: 'Listar lecciones de un curso',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/content/courses/:id/lessons',
            description: 'Crear lección en un curso',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'GET',
            path: '/api/content/lessons/:id',
            description: 'Obtener detalles de una lección',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'PUT',
            path: '/api/content/lessons/:id',
            description: 'Actualizar lección',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'DELETE',
            path: '/api/content/lessons/:id',
            description: 'Eliminar lección',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'GET',
            path: '/api/content/materials',
            description: 'Listar materiales educativos',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/content/materials',
            description: 'Subir material educativo',
            auth: true,
            rateLimit: 'upload'
          },
          {
            method: 'GET',
            path: '/api/content/quizzes',
            description: 'Listar quizzes disponibles',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/content/quizzes',
            description: 'Crear nuevo quiz',
            auth: true,
            rateLimit: 'write'
          },
          {
            method: 'GET',
            path: '/api/content/progress',
            description: 'Obtener progreso del usuario',
            auth: true,
            rateLimit: 'general'
          }
        ]
      },
      enrollment: {
        baseUrl: '/api/enrollment',
        description: 'Servicio de gestión de inscripciones a cursos',
        endpoints: [
          {
            method: 'POST',
            path: '/api/enrollment/enrollments',
            description: 'Crear nueva inscripción a curso',
            auth: true,
            rateLimit: 'write',
            body: {
              courseId: 'string (required, UUID)',
              paymentMethod: 'string (optional)',
              notes: 'string (optional)'
            }
          },
          {
            method: 'GET',
            path: '/api/enrollment/enrollments/me',
            description: 'Obtener inscripciones del usuario autenticado',
            auth: true,
            rateLimit: 'general',
            query: {
              status: 'string (optional: active, completed, dropped, suspended, pending, cancelled)',
              page: 'number (optional, default: 1)',
              limit: 'number (optional, default: 10)'
            }
          },
          {
            method: 'GET',
            path: '/api/enrollment/enrollments/course/:courseId',
            description: 'Obtener inscripciones de un curso específico (instructores/admin)',
            auth: true,
            roles: ['instructor', 'admin'],
            rateLimit: 'general'
          },
          {
            method: 'PUT',
            path: '/api/enrollment/enrollments/:enrollmentId/status',
            description: 'Actualizar estado de inscripción',
            auth: true,
            rateLimit: 'write',
            body: {
              status: 'string (optional)',
              paymentStatus: 'string (optional)',
              reason: 'string (optional)'
            }
          },
          {
            method: 'DELETE',
            path: '/api/enrollment/enrollments/:enrollmentId',
            description: 'Cancelar inscripción',
            auth: true,
            rateLimit: 'write',
            body: {
              reason: 'string (optional)'
            }
          },
          {
            method: 'GET',
            path: '/api/enrollment/enrollments/course/:courseId/stats',
            description: 'Obtener estadísticas de inscripciones de un curso',
            auth: true,
            roles: ['instructor', 'admin'],
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/enrollment/capacity',
            description: 'Crear configuración de capacidad para un curso',
            auth: true,
            roles: ['instructor', 'admin'],
            rateLimit: 'write',
            body: {
              courseId: 'string (required, UUID)',
              maxCapacity: 'number (required, 1-10000)',
              allowWaitlist: 'boolean (optional)'
            }
          },
          {
            method: 'GET',
            path: '/api/enrollment/capacity/:courseId',
            description: 'Obtener configuración de capacidad de un curso',
            auth: false,
            rateLimit: 'general'
          },
          {
            method: 'POST',
            path: '/api/enrollment/waitlist/:courseId',
            description: 'Agregar usuario a lista de espera',
            auth: true,
            rateLimit: 'write',
            body: {
              priority: 'number (optional, 1-10)'
            }
          },
          {
            method: 'GET',
            path: '/api/enrollment/waitlist/:courseId/position',
            description: 'Obtener posición en lista de espera',
            auth: true,
            rateLimit: 'general'
          },
          {
            method: 'GET',
            path: '/api/enrollment/waitlist/me',
            description: 'Obtener todas las listas de espera del usuario',
            auth: true,
            rateLimit: 'general'
          }
        ]
      },
      notifications: {
        baseUrl: '/api/notifications',
        description: 'Servicio de notificaciones (en desarrollo)',
        status: 'coming_soon'
      },
      analytics: {
        baseUrl: '/api/analytics',
        description: 'Servicio de analytics y métricas (en desarrollo)',
        status: 'coming_soon'
      }
    },
    errorCodes: {
      400: 'Bad Request - Datos de entrada inválidos',
      401: 'Unauthorized - Token de autenticación requerido',
      403: 'Forbidden - Permisos insuficientes',
      404: 'Not Found - Recurso no encontrado',
      429: 'Too Many Requests - Rate limit excedido',
      500: 'Internal Server Error - Error interno del servidor',
      503: 'Service Unavailable - Servicio temporalmente no disponible'
    },
    examples: {
      loginRequest: {
        url: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          email: 'usuario@ejemplo.com',
          password: 'miPassword123'
        }
      },
      authenticatedRequest: {
        url: '/api/users/profile',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Content-Type': 'application/json'
        }
      }
    }
  });
});

export default router;
