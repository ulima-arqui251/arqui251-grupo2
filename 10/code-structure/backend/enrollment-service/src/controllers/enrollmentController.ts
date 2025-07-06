import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { 
  Enrollment, 
  CourseCapacity, 
  EnrollmentHistory, 
  Waitlist 
} from '../models';
import { 
  EnrollmentStatus, 
  PaymentStatus,
  CreateEnrollmentData,
  UpdateEnrollmentData,
  AuthenticatedRequest
} from '../types';

/**
 * Controlador para gestionar inscripciones a cursos
 */
export class EnrollmentController {
  
  /**
   * Crear una nueva inscripción
   */
  static async createEnrollment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, paymentMethod, notes }: CreateEnrollmentData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      // Verificar si ya existe una inscripción activa
      const existingEnrollment = await Enrollment.findOne({
        where: {
          userId,
          courseId,
          status: {
            [Op.in]: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING]
          }
        }
      });

      if (existingEnrollment) {
        res.status(409).json({
          success: false,
          message: 'Ya existe una inscripción activa para este curso'
        });
        return;
      }

      // Verificar capacidad del curso
      const courseCapacity = await CourseCapacity.findOne({
        where: { courseId }
      });

      if (!courseCapacity) {
        res.status(404).json({
          success: false,
          message: 'Configuración de capacidad no encontrada para este curso'
        });
        return;
      }

      const currentEnrollments = await Enrollment.count({
        where: {
          courseId,
          status: {
            [Op.in]: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING]
          }
        }
      });

      let enrollmentStatus = EnrollmentStatus.PENDING;
      let waitlistPosition = null;

      // Si el curso está lleno, agregar a lista de espera
      if (currentEnrollments >= courseCapacity.maxCapacity) {
        if (!courseCapacity.allowWaitlist) {
          res.status(409).json({
            success: false,
            message: 'El curso está lleno y no permite lista de espera'
          });
          return;
        }

        // Agregar a lista de espera
        // Calcular la siguiente posición en la waitlist
        const maxPosition = await Waitlist.max('position', { 
          where: { courseId } 
        }) as number || 0;
        
        const waitlistEntry = await Waitlist.create({
          userId,
          courseId,
          position: maxPosition + 1,
          requestedAt: new Date(),
          priority: 1 // Se puede ajustar según lógica de negocio
        });

        // Actualizar contador de waitlist en la capacidad del curso
        await CourseCapacity.increment('waitlistCount', {
          where: { courseId }
        });

        waitlistPosition = await Waitlist.count({
          where: {
            courseId,
            requestedAt: {
              [Op.lte]: waitlistEntry.requestedAt
            }
          }
        });

        res.status(200).json({
          success: true,
          message: 'Agregado a la lista de espera',
          data: {
            waitlistPosition,
            estimatedWaitTime: waitlistPosition * 24 // Estimación en horas
          }
        });
        return;
      }

      // Crear inscripción
      const enrollment = await Enrollment.create({
        userId,
        courseId,
        status: enrollmentStatus,
        enrolledAt: new Date(),
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod,
        notes
      });

      // Actualizar contador de inscripciones en la capacidad del curso
      await CourseCapacity.increment('currentEnrollments', {
        where: { courseId }
      });

      // TEMPORARILY DISABLED: Crear registro en historial
      // await EnrollmentHistory.create({
      //   enrollmentId: enrollment.id,
      //   previousStatus: null,
      //   newStatus: enrollmentStatus,
      //   changedAt: new Date(),
      //   changedBy: userId,
      //   reason: 'Inscripción inicial'
      // });

      res.status(201).json({
        success: true,
        message: 'Inscripción creada exitosamente',
        data: enrollment
      });

    } catch (error) {
      console.error('Error creating enrollment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener inscripciones del usuario
   */
  static async getUserEnrollments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { status, page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = { userId };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Enrollment.findAndCountAll({
        where: whereClause,
        include: [{
          model: EnrollmentHistory,
          as: 'history',
          limit: 5,
          order: [['changedAt', 'DESC']]
        }],
        offset,
        limit: Number(limit),
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          enrollments: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener inscripciones de un curso específico
   */
  static async getCourseEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = { courseId };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Enrollment.findAndCountAll({
        where: whereClause,
        include: [{
          model: EnrollmentHistory,
          as: 'history',
          limit: 3,
          order: [['changedAt', 'DESC']]
        }],
        offset,
        limit: Number(limit),
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          enrollments: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado de inscripción
   */
  static async updateEnrollmentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { enrollmentId } = req.params;
      const { status, reason, paymentStatus }: UpdateEnrollmentData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const enrollment = await Enrollment.findByPk(enrollmentId);

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar permisos (solo el usuario o administrador puede modificar)
      if (enrollment.userId !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta inscripción'
        });
        return;
      }

      const previousStatus = enrollment.status;

      // Actualizar inscripción
      await enrollment.update({
        status: status || enrollment.status,
        paymentStatus: paymentStatus || enrollment.paymentStatus,
        updatedAt: new Date()
      });

      // Crear registro en historial
      await EnrollmentHistory.create({
        enrollmentId: enrollment.id,
        previousStatus,
        newStatus: status || enrollment.status,
        changedAt: new Date(),
        changedBy: userId,
        reason: reason || 'Actualización de estado'
      });

      // Si se cancela una inscripción, procesar lista de espera
      if (status === EnrollmentStatus.CANCELLED) {
        await EnrollmentController.processWaitlist(enrollment.courseId);
      }

      res.status(200).json({
        success: true,
        message: 'Inscripción actualizada exitosamente',
        data: enrollment
      });

    } catch (error) {
      console.error('Error updating enrollment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancelar inscripción
   */
  static async cancelEnrollment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { enrollmentId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const enrollment = await Enrollment.findByPk(enrollmentId);

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
        return;
      }

      // Verificar permisos
      if (enrollment.userId !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta inscripción'
        });
        return;
      }

      // No se puede cancelar si ya está cancelada o completada
      if ([EnrollmentStatus.CANCELLED, EnrollmentStatus.COMPLETED].includes(enrollment.status)) {
        res.status(400).json({
          success: false,
          message: 'No se puede cancelar una inscripción en este estado'
        });
        return;
      }

      const previousStatus = enrollment.status;

      // Cancelar inscripción
      await enrollment.update({
        status: EnrollmentStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date()
      });

      // Decrementar contador de inscripciones si era una inscripción activa
      if (previousStatus === EnrollmentStatus.ACTIVE) {
        await CourseCapacity.decrement('currentEnrollments', {
          where: { courseId: enrollment.courseId }
        });
      }

      // Crear registro en historial
      await EnrollmentHistory.create({
        enrollmentId: enrollment.id,
        previousStatus,
        newStatus: EnrollmentStatus.CANCELLED,
        changedAt: new Date(),
        changedBy: userId,
        reason: reason || 'Cancelación por usuario'
      });

      // Procesar lista de espera
      await EnrollmentController.processWaitlist(enrollment.courseId);

      res.status(200).json({
        success: true,
        message: 'Inscripción cancelada exitosamente'
      });

    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Procesar lista de espera cuando se libera un cupo
   */
  private static async processWaitlist(courseId: string): Promise<void> {
    try {
      // Verificar si hay cupos disponibles
      const courseCapacity = await CourseCapacity.findOne({
        where: { courseId }
      });

      if (!courseCapacity) return;

      const currentEnrollments = await Enrollment.count({
        where: {
          courseId,
          status: {
            [Op.in]: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING]
          }
        }
      });

      if (currentEnrollments >= courseCapacity.maxCapacity) return;

      // Obtener el siguiente en la lista de espera
      const nextWaitlistEntry = await Waitlist.findOne({
        where: { courseId },
        order: [['requestedAt', 'ASC']]
      });

      if (!nextWaitlistEntry) return;

      // Crear inscripción automática
      await Enrollment.create({
        userId: nextWaitlistEntry.userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Inscripción automática desde lista de espera'
      });

      // Actualizar contadores: incrementar inscripciones, decrementar waitlist
      await CourseCapacity.increment('currentEnrollments', {
        where: { courseId }
      });
      await CourseCapacity.decrement('waitlistCount', {
        where: { courseId }
      });

      // Eliminar de lista de espera
      await nextWaitlistEntry.destroy();

      console.log(`✅ Usuario ${nextWaitlistEntry.userId} promovido de lista de espera para curso ${courseId}`);

    } catch (error) {
      console.error('Error processing waitlist:', error);
    }
  }

  /**
   * Obtener estadísticas de inscripciones
   */
  static async getEnrollmentStats(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const stats = await Promise.all([
        Enrollment.count({
          where: {
            courseId,
            status: EnrollmentStatus.ACTIVE
          }
        }),
        Enrollment.count({
          where: {
            courseId,
            status: EnrollmentStatus.PENDING
          }
        }),
        Enrollment.count({
          where: {
            courseId,
            status: EnrollmentStatus.CANCELLED
          }
        }),
        Enrollment.count({
          where: {
            courseId,
            status: EnrollmentStatus.COMPLETED
          }
        }),
        Waitlist.count({
          where: { courseId }
        }),
        CourseCapacity.findOne({
          where: { courseId }
        })
      ]);

      const [active, pending, cancelled, completed, waitlist, capacity] = stats;

      res.status(200).json({
        success: true,
        data: {
          enrollments: {
            active,
            pending,
            cancelled,
            completed,
            total: active + pending + cancelled + completed
          },
          waitlist,
          capacity: capacity ? {
            max: capacity.maxCapacity,
            available: Math.max(0, capacity.maxCapacity - active),
            utilizationRate: Math.round((active / capacity.maxCapacity) * 100)
          } : null
        }
      });

    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
