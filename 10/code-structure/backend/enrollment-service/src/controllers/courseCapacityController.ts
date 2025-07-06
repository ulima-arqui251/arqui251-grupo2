import { Request, Response } from 'express';
import { CourseCapacity } from '../models';
import { CourseCapacityData, AuthenticatedRequest } from '../types';

/**
 * Controlador para gestionar la capacidad de cursos
 */
export class CourseCapacityController {
  
  /**
   * Crear configuración de capacidad para un curso
   */
  static async createCourseCapacity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId, maxCapacity, allowWaitlist }: CourseCapacityData = req.body;

      // Verificar si ya existe configuración para este curso
      const existingCapacity = await CourseCapacity.findOne({
        where: { courseId }
      });

      if (existingCapacity) {
        res.status(409).json({
          success: false,
          message: 'Ya existe configuración de capacidad para este curso'
        });
        return;
      }

      const courseCapacity = await CourseCapacity.create({
        courseId,
        maxCapacity,
        currentEnrollments: 0,
        allowWaitlist: allowWaitlist !== undefined ? allowWaitlist : true,
        waitlistCount: 0
      });

      res.status(201).json({
        success: true,
        message: 'Configuración de capacidad creada exitosamente',
        data: courseCapacity
      });

    } catch (error) {
      console.error('Error creating course capacity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener configuración de capacidad de un curso
   */
  static async getCourseCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;

      const courseCapacity = await CourseCapacity.findOne({
        where: { courseId }
      });

      if (!courseCapacity) {
        res.status(404).json({
          success: false,
          message: 'Configuración de capacidad no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...courseCapacity.toJSON(),
          availableSpots: courseCapacity.getAvailableSpots(),
          utilizationRate: Math.round((courseCapacity.currentEnrollments / courseCapacity.maxCapacity) * 100),
          isFull: courseCapacity.isFull(),
          isWaitlistAvailable: courseCapacity.isWaitlistAvailable()
        }
      });

    } catch (error) {
      console.error('Error fetching course capacity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar configuración de capacidad
   */
  static async updateCourseCapacity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { maxCapacity, allowWaitlist }: Partial<CourseCapacityData> = req.body;

      const courseCapacity = await CourseCapacity.findOne({
        where: { courseId }
      });

      if (!courseCapacity) {
        res.status(404).json({
          success: false,
          message: 'Configuración de capacidad no encontrada'
        });
        return;
      }

      // Verificar que la nueva capacidad no sea menor que las inscripciones actuales
      if (maxCapacity && maxCapacity < courseCapacity.currentEnrollments) {
        res.status(400).json({
          success: false,
          message: `No se puede reducir la capacidad por debajo de las inscripciones actuales (${courseCapacity.currentEnrollments})`
        });
        return;
      }

      await courseCapacity.update({
        maxCapacity: maxCapacity || courseCapacity.maxCapacity,
        allowWaitlist: allowWaitlist !== undefined ? allowWaitlist : courseCapacity.allowWaitlist
      });

      res.status(200).json({
        success: true,
        message: 'Configuración de capacidad actualizada exitosamente',
        data: {
          ...courseCapacity.toJSON(),
          availableSpots: courseCapacity.getAvailableSpots(),
          utilizationRate: Math.round((courseCapacity.currentEnrollments / courseCapacity.maxCapacity) * 100),
          isFull: courseCapacity.isFull(),
          isWaitlistAvailable: courseCapacity.isWaitlistAvailable()
        }
      });

    } catch (error) {
      console.error('Error updating course capacity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener cursos cerca de la capacidad máxima
   */
  static async getCoursesNearCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 0.9 } = req.query;

      const coursesNearCapacity = await CourseCapacity.getCoursesNearCapacity(Number(threshold));

      const enrichedCourses = coursesNearCapacity.map(course => ({
        ...course.toJSON(),
        availableSpots: course.getAvailableSpots(),
        utilizationRate: Math.round((course.currentEnrollments / course.maxCapacity) * 100),
        isFull: course.isFull(),
        isWaitlistAvailable: course.isWaitlistAvailable()
      }));

      res.status(200).json({
        success: true,
        data: enrichedCourses
      });

    } catch (error) {
      console.error('Error fetching courses near capacity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener cursos llenos
   */
  static async getFullCourses(req: Request, res: Response): Promise<void> {
    try {
      const fullCourses = await CourseCapacity.getFullCourses();

      const enrichedCourses = fullCourses.map(course => ({
        ...course.toJSON(),
        availableSpots: 0,
        utilizationRate: 100,
        isFull: true,
        isWaitlistAvailable: course.isWaitlistAvailable()
      }));

      res.status(200).json({
        success: true,
        data: enrichedCourses
      });

    } catch (error) {
      console.error('Error fetching full courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas generales de capacidad
   */
  static async getCapacityStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalCourses,
        fullCourses,
        nearCapacityCourses,
        totalCapacity,
        totalEnrollments,
        totalWaitlist
      ] = await Promise.all([
        CourseCapacity.count(),
        CourseCapacity.getFullCourses(),
        CourseCapacity.getCoursesNearCapacity(0.9),
        CourseCapacity.sum('maxCapacity'),
        CourseCapacity.sum('currentEnrollments'),
        CourseCapacity.sum('waitlistCount')
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalCourses,
          fullCourses: fullCourses.length,
          nearCapacityCourses: nearCapacityCourses.length,
          totalCapacity: totalCapacity || 0,
          totalEnrollments: totalEnrollments || 0,
          totalWaitlist: totalWaitlist || 0,
          overallUtilization: totalCapacity ? Math.round(((totalEnrollments || 0) / totalCapacity) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Error fetching capacity stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
