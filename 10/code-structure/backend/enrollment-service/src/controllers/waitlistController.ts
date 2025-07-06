import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Waitlist } from '../models';
import { AuthenticatedRequest } from '../types';

/**
 * Controlador para gestionar listas de espera
 */
export class WaitlistController {
  
  /**
   * Agregar usuario a lista de espera
   */
  static async addToWaitlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { priority = 1 } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      // Verificar si ya está en la lista de espera
      const existingEntry = await Waitlist.findOne({
        where: { userId, courseId }
      });

      if (existingEntry) {
        res.status(409).json({
          success: false,
          message: 'Ya estás en la lista de espera para este curso'
        });
        return;
      }

      const waitlistEntry = await Waitlist.addToWaitlist(userId, courseId);

      // Actualizar prioridad si se especifica
      if (priority !== 1) {
        await waitlistEntry.update({ priority });
      }

      const position = await Waitlist.count({
        where: {
          courseId,
          requestedAt: {
            [Op.lte]: waitlistEntry.requestedAt
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Agregado a la lista de espera exitosamente',
        data: {
          ...waitlistEntry.toJSON(),
          position
        }
      });

    } catch (error) {
      console.error('Error adding to waitlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Remover usuario de lista de espera
   */
  static async removeFromWaitlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const removed = await Waitlist.removeFromWaitlist(userId, courseId);

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'No se encontró en la lista de espera'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Removido de la lista de espera exitosamente'
      });

    } catch (error) {
      console.error('Error removing from waitlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener posición en lista de espera
   */
  static async getWaitlistPosition(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const waitlistEntry = await Waitlist.findOne({
        where: { userId, courseId }
      });

      if (!waitlistEntry) {
        res.status(404).json({
          success: false,
          message: 'No se encontró en la lista de espera'
        });
        return;
      }

      const position = await Waitlist.count({
        where: {
          courseId,
          requestedAt: {
            [Op.lte]: waitlistEntry.requestedAt
          }
        }
      });

      const totalInWaitlist = await Waitlist.count({
        where: { courseId }
      });

      res.status(200).json({
        success: true,
        data: {
          ...waitlistEntry.toJSON(),
          position,
          totalInWaitlist,
          estimatedWaitTime: position * 24 // Estimación en horas
        }
      });

    } catch (error) {
      console.error('Error fetching waitlist position:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener lista de espera de un curso (solo para administradores/instructores)
   */
  static async getCourseWaitlist(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await Waitlist.findAndCountAll({
        where: { courseId },
        offset,
        limit: Number(limit),
        order: [['requestedAt', 'ASC'], ['priority', 'DESC']]
      });

      // Agregar posición a cada entrada
      const waitlistWithPositions = rows.map((entry, index) => ({
        ...entry.toJSON(),
        position: offset + index + 1
      }));

      res.status(200).json({
        success: true,
        data: {
          waitlist: waitlistWithPositions,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching course waitlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todas las listas de espera del usuario
   */
  static async getUserWaitlists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await Waitlist.findAndCountAll({
        where: { userId },
        offset,
        limit: Number(limit),
        order: [['requestedAt', 'DESC']]
      });

      // Agregar posición para cada entrada
      const waitlistsWithPositions = await Promise.all(
        rows.map(async (entry) => {
          const position = await Waitlist.count({
            where: {
              courseId: entry.courseId,
              requestedAt: {
                [Op.lte]: entry.requestedAt
              }
            }
          });

          return {
            ...entry.toJSON(),
            position
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          waitlists: waitlistsWithPositions,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user waitlists:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Notificar a usuarios en lista de espera
   */
  static async notifyWaitlistUsers(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { count = 1 } = req.body;

      const waitlistEntries = await Waitlist.findAll({
        where: { 
          courseId,
          notified: false 
        },
        order: [['requestedAt', 'ASC'], ['priority', 'DESC']],
        limit: count
      });

      if (waitlistEntries.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No hay usuarios en lista de espera para notificar'
        });
        return;
      }

      // Marcar como notificados
      await Promise.all(
        waitlistEntries.map(entry => entry.markAsNotified())
      );

      // TODO: Aquí se enviarían las notificaciones reales
      // - Email notifications
      // - In-app notifications
      // - Push notifications

      res.status(200).json({
        success: true,
        message: `${waitlistEntries.length} usuarios notificados exitosamente`,
        data: {
          notifiedUsers: waitlistEntries.map(entry => ({
            userId: entry.userId,
            position: entry.position
          }))
        }
      });

    } catch (error) {
      console.error('Error notifying waitlist users:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de lista de espera
   */
  static async getWaitlistStats(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.query;

      const stats = await Waitlist.getWaitlistStats(courseId as string);

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching waitlist stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
