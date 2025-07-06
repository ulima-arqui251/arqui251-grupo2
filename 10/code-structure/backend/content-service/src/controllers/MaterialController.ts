import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { 
  CreateMaterialRequest, 
  UpdateMaterialRequest,
  MaterialType
} from '../types';
import { Material, Course, Lesson } from '../models';
import path from 'path';
import fs from 'fs/promises';

export class MaterialController {
  /**
   * RF-07: Obtener materiales con filtros
   */
  public async getAllMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const type = req.query.type as MaterialType;
      const courseId = req.query.courseId as string;
      const lessonId = req.query.lessonId as string;
      const isDownloadable = req.query.isDownloadable as string;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (courseId) {
        where.courseId = courseId;
      }

      if (lessonId) {
        where.lessonId = lessonId;
      }

      if (isDownloadable !== undefined) {
        where.isDownloadable = isDownloadable === 'true';
      }

      const { rows: materials, count: total } = await Material.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ['orderIndex', 'ASC'],
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: materials,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error obteniendo materiales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Obtener detalles de material específico
   */
  public async getMaterialById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const material = await Material.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description']
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'description']
          }
        ]
      });

      if (!material) {
        res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
        return;
      }

      // Verificar si el usuario tiene acceso al material
      // Si el material pertenece a un curso, verificar enrollment
      if (material.courseId) {
        const course = await Course.findByPk(material.courseId);
        if (!course) {
          res.status(404).json({
            success: false,
            message: 'Curso no encontrado'
          });
          return;
        }

        // Aquí se debería verificar si el usuario está enrollado en el curso
        // Por ahora, asumimos que el middleware de auth maneja esto
      }

      res.status(200).json({
        success: true,
        data: material
      });
    } catch (error) {
      console.error('Error obteniendo material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Crear nuevo material
   */
  public async createMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const materialData: CreateMaterialRequest = req.body;
      
      // Verificar que el usuario sea instructor o admin
      if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear materiales'
        });
        return;
      }

      // Verificar que el curso o lección existe y pertenece al instructor
      if (materialData.courseId) {
        const course = await Course.findByPk(materialData.courseId);
        if (!course) {
          res.status(404).json({
            success: false,
            message: 'Curso no encontrado'
          });
          return;
        }

        // Verificar que el instructor es propietario del curso
        if (req.user.role === 'instructor' && (course as any).instructorId !== req.user.userId) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para crear materiales en este curso'
          });
          return;
        }
      }

      if (materialData.lessonId) {
        const lesson = await Lesson.findByPk(materialData.lessonId);
        
        if (!lesson) {
          res.status(404).json({
            success: false,
            message: 'Lección no encontrada'
          });
          return;
        }

        // Obtener el curso de la lección para verificar permisos
        if (lesson.courseId) {
          const course = await Course.findByPk(lesson.courseId);
          
          // Verificar que el instructor es propietario del curso de la lección
          if (req.user.role === 'instructor' && course && (course as any).instructorId !== req.user.userId) {
            res.status(403).json({
              success: false,
              message: 'No tienes permisos para crear materiales en esta lección'
            });
            return;
          }
        }
      }

      // Si hay archivo subido, agregar información del archivo
      if (req.file) {
        materialData.fileName = req.file.originalname;
        materialData.fileUrl = req.file.path;
        materialData.fileSize = req.file.size;
        materialData.mimeType = req.file.mimetype;
      }

      // Validar que para tipos de archivo se tenga el archivo
      if (materialData.type !== MaterialType.LINK && !materialData.fileUrl) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un archivo para este tipo de material'
        });
        return;
      }

      // Validar que para enlaces se tenga la URL externa
      if (materialData.type === MaterialType.LINK && !materialData.externalUrl) {
        res.status(400).json({
          success: false,
          message: 'Se requiere una URL externa para materiales tipo enlace'
        });
        return;
      }

      const material = await Material.create(materialData);

      res.status(201).json({
        success: true,
        message: 'Material creado exitosamente',
        data: material
      });
    } catch (error) {
      console.error('Error creando material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Actualizar material existente
   */
  public async updateMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const updateData: UpdateMaterialRequest = req.body;

      // Verificar que el usuario sea instructor o admin
      if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar materiales'
        });
        return;
      }

      // Buscar el material existente
      const material = await Material.findByPk(id);
      if (!material) {
        res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
        return;
      }

      // Verificar permisos según el curso o lección del material
      if (material.courseId) {
        const course = await Course.findByPk(material.courseId);
        if (req.user.role === 'instructor' && course && (course as any).instructorId !== req.user.userId) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para actualizar este material'
          });
          return;
        }
      }

      if (material.lessonId) {
        const lesson = await Lesson.findByPk(material.lessonId);
        if (lesson?.courseId) {
          const course = await Course.findByPk(lesson.courseId);
          if (req.user.role === 'instructor' && course && (course as any).instructorId !== req.user.userId) {
            res.status(403).json({
              success: false,
              message: 'No tienes permisos para actualizar este material'
            });
            return;
          }
        }
      }

      // Si hay nuevo archivo subido, actualizar información del archivo
      if (req.file) {
        // Eliminar archivo anterior si existe
        if (material.fileUrl) {
          try {
            await fs.unlink(material.fileUrl);
          } catch (error) {
            console.warn('No se pudo eliminar el archivo anterior:', error);
          }
        }

        updateData.fileName = req.file.originalname;
        updateData.fileUrl = req.file.path;
        updateData.fileSize = req.file.size;
        updateData.mimeType = req.file.mimetype;
      }

      // Validaciones específicas por tipo
      if (updateData.type === MaterialType.LINK) {
        if (!updateData.externalUrl && !material.externalUrl) {
          res.status(400).json({
            success: false,
            message: 'Se requiere una URL externa para materiales tipo enlace'
          });
          return;
        }
      } else {
        if (!updateData.fileUrl && !material.fileUrl) {
          res.status(400).json({
            success: false,
            message: 'Se requiere un archivo para este tipo de material'
          });
          return;
        }
      }

      // Actualizar el material
      await material.update(updateData);

      // Obtener el material actualizado con las relaciones
      const updatedMaterial = await Material.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Material actualizado exitosamente',
        data: updatedMaterial
      });
    } catch (error) {
      console.error('Error actualizando material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar material
   */
  public async deleteMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar que el usuario sea instructor o admin
      if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar materiales'
        });
        return;
      }

      // Buscar el material existente
      const material = await Material.findByPk(id);
      if (!material) {
        res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
        return;
      }

      // Verificar permisos según el curso o lección del material
      if (material.courseId) {
        const course = await Course.findByPk(material.courseId);
        if (req.user.role === 'instructor' && course && (course as any).instructorId !== req.user.userId) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para eliminar este material'
          });
          return;
        }
      }

      if (material.lessonId) {
        const lesson = await Lesson.findByPk(material.lessonId);
        if (lesson?.courseId) {
          const course = await Course.findByPk(lesson.courseId);
          if (req.user.role === 'instructor' && course && (course as any).instructorId !== req.user.userId) {
            res.status(403).json({
              success: false,
              message: 'No tienes permisos para eliminar este material'
            });
            return;
          }
        }
      }

      // Eliminar archivo físico si existe
      if (material.fileUrl && material.type !== MaterialType.LINK) {
        try {
          await fs.unlink(material.fileUrl);
        } catch (error) {
          console.warn('No se pudo eliminar el archivo físico:', error);
        }
      }

      // Eliminar el material de la base de datos
      await material.destroy();

      res.status(200).json({
        success: true,
        message: 'Material eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Descargar material (si es descargable)
   */
  public async downloadMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Buscar el material
      const material = await Material.findByPk(id);
      if (!material) {
        res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
        return;
      }

      // Verificar que el material sea descargable
      if (!material.isDownloadable) {
        res.status(403).json({
          success: false,
          message: 'Este material no está disponible para descarga'
        });
        return;
      }

      // Verificar que el material tenga un archivo
      if (!material.fileUrl || material.type === MaterialType.LINK) {
        res.status(400).json({
          success: false,
          message: 'No hay archivo disponible para descarga'
        });
        return;
      }

      // Verificar que el usuario tenga acceso al material
      if (material.courseId && req.user) {
        // Aquí se debería verificar el enrollment del usuario en el curso
        // Por ahora, solo verificamos que el usuario esté autenticado
      }

      // Verificar que el archivo existe
      try {
        await fs.access(material.fileUrl);
      } catch (error) {
        res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
        return;
      }

      // Configurar headers para la descarga
      const fileName = material.fileName || path.basename(material.fileUrl);
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
      
      if (material.fileSize) {
        res.setHeader('Content-Length', material.fileSize);
      }

      // Enviar el archivo
      res.sendFile(path.resolve(material.fileUrl));
    } catch (error) {
      console.error('Error descargando material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-16: Subir archivo de material
   */
  public async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
        return;
      }

      // Verificar que el usuario sea instructor o admin
      if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir archivos'
        });
        return;
      }

      const fileInfo = {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: `/uploads/${req.file.filename}` // URL relativa para acceso público
      };

      res.status(200).json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: fileInfo
      });
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Obtener materiales de un curso específico
   */
  public async getMaterialsByCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as MaterialType;

      // Verificar que el curso existe
      const course = await Course.findByPk(courseId);
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
        return;
      }

      // Verificar acceso al curso (enrollment)
      // Por ahora, asumimos que el middleware de auth maneja esto

      const offset = (page - 1) * limit;
      const where: any = {
        courseId,
        lessonId: null // Solo materiales del curso, no de lecciones específicas
      };

      if (type) {
        where.type = type;
      }

      const { rows: materials, count: total } = await Material.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ['orderIndex', 'ASC'],
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: materials,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error obteniendo materiales del curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * RF-07: Obtener materiales de una lección específica
   */
  public async getMaterialsByLesson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as MaterialType;

      // Verificar que la lección existe
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
        return;
      }

      // Verificar acceso a la lección (enrollment en el curso)
      // Por ahora, asumimos que el middleware de auth maneja esto

      const offset = (page - 1) * limit;
      const where: any = { lessonId };

      if (type) {
        where.type = type;
      }

      const { rows: materials, count: total } = await Material.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ['orderIndex', 'ASC'],
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: materials,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error obteniendo materiales de la lección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
