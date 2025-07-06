import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Course, Lesson, Material, Quiz, Category } from '../models';
import { 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseSearchFilters,
  ApiResponse,
  PaginationResponse,
  CourseStatus,
  UserRole
} from '../types';

export class CourseController {
  /**
   * RF-07: Obtener catálogo de cursos con filtros
   */
  public async getAllCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de búsqueda inválidos',
          errors: errors.array()
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const filters: any = {
        isPublic: true,
        status: 'published'
      };

      // Construir filtros de búsqueda
      if (req.query.search) {
        filters[Op.or] = [
          { title: { [Op.like]: `%${req.query.search}%` } },
          { description: { [Op.like]: `%${req.query.search}%` } }
        ];
      }

      if (req.query.category) {
        filters.categoryId = req.query.category;
      }

      if (req.query.instructor) {
        filters.instructorId = req.query.instructor;
      }

      if (req.query.difficultyLevel) {
        filters.difficultyLevel = req.query.difficultyLevel;
      }

      if (req.query.priceMin || req.query.priceMax) {
        filters.price = {};
        if (req.query.priceMin) filters.price[Op.gte] = parseFloat(req.query.priceMin as string);
        if (req.query.priceMax) filters.price[Op.lte] = parseFloat(req.query.priceMax as string);
      }

      if (req.query.rating) {
        filters.averageRating = { [Op.gte]: parseFloat(req.query.rating as string) };
      }

      const { count, rows: courses } = await Course.findAndCountAll({
        where: filters,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id', 'title', 'orderIndex', 'isPreview'],
            limit: 3 // Solo las primeras 3 lecciones para vista previa
          }
        ],
        limit,
        offset,
        order: [
          ['averageRating', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      const response: PaginationResponse<any> = {
        success: true,
        data: courses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error obteniendo cursos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Búsqueda avanzada de cursos
   */
  public async searchCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de búsqueda inválidos',
          errors: errors.array()
        });
        return;
      }

      const filters = req.query as CourseSearchFilters;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const whereClause: any = {
        isPublic: true,
        status: 'published'
      };

      // Aplicar filtros avanzados
      if (filters.search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { tags: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Más filtros específicos...
      if (filters.category) whereClause.categoryId = filters.category;
      if (filters.instructor) whereClause.instructorId = filters.instructor;
      if (filters.difficultyLevel) whereClause.difficultyLevel = filters.difficultyLevel;
      if (filters.status) whereClause.status = filters.status;

      const courses = await Course.findAll({
        where: whereClause,
        include: [
          { model: Category, as: 'category' },
          { model: Lesson, as: 'lessons', limit: 3 }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error en búsqueda de cursos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Obtener detalles específicos de un curso
   */
  public async getCourseById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { 
            model: Lesson, 
            as: 'lessons',
            order: [['orderIndex', 'ASC']],
            include: [
              { model: Material, as: 'materials' },
              { model: Quiz, as: 'quizzes' }
            ]
          },
          { model: Material, as: 'materials' },
          { model: Quiz, as: 'quizzes' }
        ]
      });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si el curso es público o si el usuario tiene acceso
      if (!course.isPublic && (!req.user || 
          (req.user.role !== 'admin' && req.user.role !== 'instructor'))) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado al curso'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error obteniendo curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Crear nuevo curso (solo instructores/admins)
   */
  public async createCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const courseData: CreateCourseRequest = req.body;
      
      // Asignar el instructor actual si no se especifica
      if (!courseData.instructorId) {
        courseData.instructorId = req.user!.userId;
      }

      // Solo admins pueden asignar otros instructores
      if (courseData.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para asignar otros instructores'
        });
        return;
      }

      const course = await Course.create(courseData);

      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: course
      });
    } catch (error) {
      console.error('Error creando curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Actualizar curso existente
   */
  public async updateCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateCourseRequest = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar permisos (solo el instructor propietario o admin)
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este curso'
        });
        return;
      }

      await course.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Curso actualizado exitosamente',
        data: course
      });
    } catch (error) {
      console.error('Error actualizando curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar curso (solo administradores)
   */
  public async deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      await course.destroy();

      res.status(200).json({
        success: true,
        message: 'Curso eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-08: Inscribirse en un curso
   */
  public async enrollInCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar si el curso está publicado y disponible
      if (course.status !== 'published' || !course.isPublic) {
        res.status(400).json({
          success: false,
          message: 'El curso no está disponible para inscripción'
        });
        return;
      }

      // Verificar límite de estudiantes
      if (course.maxStudents && course.currentStudents! >= course.maxStudents) {
        res.status(400).json({
          success: false,
          message: 'El curso ha alcanzado el límite máximo de estudiantes'
        });
        return;
      }

      // TODO: Crear registro de inscripción
      // Por ahora, solo actualizamos el contador
      await course.update({
        currentStudents: (course.currentStudents || 0) + 1
      });

      res.status(200).json({
        success: true,
        message: 'Inscripción exitosa al curso'
      });
    } catch (error) {
      console.error('Error en inscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-08: Desinscribirse de un curso
   */
  public async unenrollFromCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // TODO: Eliminar registro de inscripción
      // Por ahora, solo actualizamos el contador
      await course.update({
        currentStudents: Math.max((course.currentStudents || 1) - 1, 0)
      });

      res.status(200).json({
        success: true,
        message: 'Desinscripción exitosa del curso'
      });
    } catch (error) {
      console.error('Error en desinscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener categorías de cursos
   */
  public async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'description', 'parentId'],
        order: [['name', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener estudiantes inscritos (solo instructores/admins)
   */
  public async getCourseEnrollments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implementar cuando tengamos el modelo de inscripciones
      res.status(200).json({
        success: true,
        data: [],
        message: 'Funcionalidad en desarrollo'
      });
    } catch (error) {
      console.error('Error obteniendo inscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener progreso general del curso
   */
  public async getCourseProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implementar cuando tengamos el modelo de progreso
      res.status(200).json({
        success: true,
        data: { progress: 0 },
        message: 'Funcionalidad en desarrollo'
      });
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Publicar curso (cambiar estado a published)
   */
  public async publishCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar permisos
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para publicar este curso'
        });
        return;
      }

      await course.update({ status: CourseStatus.PUBLISHED });

      res.status(200).json({
        success: true,
        message: 'Curso publicado exitosamente',
        data: course
      });
    } catch (error) {
      console.error('Error publicando curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Archivar curso
   */
  public async archiveCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar permisos
      if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para archivar este curso'
        });
        return;
      }

      await course.update({ status: CourseStatus.ARCHIVED });

      res.status(200).json({
        success: true,
        message: 'Curso archivado exitosamente',
        data: course
      });
    } catch (error) {
      console.error('Error archivando curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-15: Obtener analíticas del curso
   */
  public async getCourseAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implementar analíticas completas
      res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          averageProgress: 0,
          completionRate: 0,
          averageRating: 0
        },
        message: 'Funcionalidad en desarrollo'
      });
    } catch (error) {
      console.error('Error obteniendo analíticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
