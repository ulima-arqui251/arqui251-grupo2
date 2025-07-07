import { LessonsService } from './lessons.service.js';

const lessonsService = new LessonsService();

export class LessonsController {
  
  // GET /api/lessons - Obtener lecciones con filtros
  async getLessons(req, res) {
    try {
      const filters = {
        ...req.query,
        userId: req.user?.id // Incluir ID del usuario si está autenticado
      };
      
      const result = await lessonsService.getLessons(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener lecciones',
        error: error.message
      });
    }
  }
  
  // GET /api/lessons/:id - Obtener lección por ID
  async getLessonById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const lesson = await lessonsService.getLessonById(id, userId);
      
      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      if (error.message === 'Lección no encontrada' || error.message === 'Lección no disponible') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al obtener lección',
        error: error.message
      });
    }
  }
  
  // POST /api/lessons - Crear nueva lección (solo docentes)
  async createLesson(req, res) {
    try {
      // Verificar que el usuario sea docente
      if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los docentes pueden crear lecciones'
        });
      }
      
      const lesson = await lessonsService.createLesson(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Lección creada correctamente',
        data: lesson
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear lección',
        error: error.message
      });
    }
  }
  
  // PUT /api/lessons/:id - Actualizar lección
  async updateLesson(req, res) {
    try {
      const { id } = req.params;
      
      const lesson = await lessonsService.updateLesson(id, req.body, req.user.id);
      
      res.json({
        success: true,
        message: 'Lección actualizada correctamente',
        data: lesson
      });
    } catch (error) {
      if (error.message === 'Lección no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'No tienes permisos para editar esta lección') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al actualizar lección',
        error: error.message
      });
    }
  }
  
  // DELETE /api/lessons/:id - Eliminar lección
  async deleteLesson(req, res) {
    try {
      const { id } = req.params;
      
      const result = await lessonsService.deleteLesson(id, req.user.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Lección no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'No tienes permisos para eliminar esta lección') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al eliminar lección',
        error: error.message
      });
    }
  }
  
  // POST /api/lessons/:id/start - Iniciar una lección
  async startLesson(req, res) {
    try {
      const { id } = req.params;
      
      const progress = await lessonsService.startLesson(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Lección iniciada correctamente',
        data: progress
      });
    } catch (error) {
      if (error.message === 'Lección no disponible') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al iniciar lección',
        error: error.message
      });
    }
  }
  
  // PUT /api/lessons/:id/progress - Actualizar progreso de lección
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      
      const progress = await lessonsService.updateProgress(id, req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Progreso actualizado correctamente',
        data: progress
      });
    } catch (error) {
      if (error.message === 'Progreso no encontrado. Inicia la lección primero.') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al actualizar progreso',
        error: error.message
      });
    }
  }
  
  // POST /api/lessons/:id/complete - Completar lección
  async completeLesson(req, res) {
    try {
      const { id } = req.params;
      const { score } = req.body;
      
      const result = await lessonsService.completeLesson(id, req.user.id, score);
      
      res.json({
        success: true,
        message: 'Lección completada correctamente',
        data: result
      });
    } catch (error) {
      if (error.message === 'Lección no encontrada' || 
          error.message === 'Progreso no encontrado. Inicia la lección primero.') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al completar lección',
        error: error.message
      });
    }
  }
  
  // GET /api/lessons/progress - Obtener progreso del usuario autenticado
  async getUserProgress(req, res) {
    try {
      const filters = req.query;
      
      const progress = await lessonsService.getUserProgress(req.user.id, filters);
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener progreso',
        error: error.message
      });
    }
  }
  
  // GET /api/lessons/:id/stats - Obtener estadísticas de una lección (solo docentes)
  async getLessonStats(req, res) {
    try {
      // Verificar que el usuario sea docente o admin
      if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los docentes pueden ver estadísticas'
        });
      }
      
      const { id } = req.params;
      
      const stats = await lessonsService.getLessonStats(id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      if (error.message === 'Lección no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}
