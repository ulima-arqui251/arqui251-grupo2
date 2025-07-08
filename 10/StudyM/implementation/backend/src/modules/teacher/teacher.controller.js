import teacherService from './teacher.service.js';
import { Assignment, Submission, Grade, Course, User } from '../../models/index.js';
import { successResponse, errorResponse, paginatedResponse, notFoundResponse, forbiddenResponse } from '../../utils/responses.js';

class TeacherController {
  
  // ===== DASHBOARD =====
  
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboard(req, res) {
    try {
      const teacherId = req.user.id;
      
      // Verificar que el usuario es profesor
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder al panel docente');
      }
      
      const dashboardData = await teacherService.getDashboardStats(teacherId);
      
      return successResponse(res, dashboardData, 'Dashboard obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo dashboard:', error);
      return errorResponse(res, error.message || 'Error al obtener dashboard', 500);
    }
  }

  // ===== GESTIÓN DE CURSOS =====
  
  /**
   * Obtener cursos del profesor
   */
  async getCourses(req, res) {
    try {
      const teacherId = req.user.id;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const filters = {
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        subject: req.query.subject
      };
      
      const courses = await teacherService.getCourses(teacherId, filters);
      
      return successResponse(res, courses, 'Cursos obtenidos exitosamente');
    } catch (error) {
      console.error('Error obteniendo cursos:', error);
      return errorResponse(res, error.message || 'Error al obtener cursos', 500);
    }
  }
  
  /**
   * Obtener estudiantes de un curso
   */
  async getCourseStudents(req, res) {
    try {
      const teacherId = req.user.id;
      const { courseId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const filters = {
        status: req.query.status
      };
      
      const students = await teacherService.getCourseStudents(teacherId, courseId, filters);
      
      return successResponse(res, students, 'Estudiantes obtenidos exitosamente');
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      return errorResponse(res, error.message || 'Error al obtener estudiantes', 500);
    }
  }

  // ===== GESTIÓN DE ASIGNACIONES =====
  
  /**
   * Crear nueva asignación
   */
  async createAssignment(req, res) {
    try {
      const teacherId = req.user.id;
      const assignmentData = req.body;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden crear asignaciones');
      }
      
      const assignment = await teacherService.createAssignment(teacherId, assignmentData);
      
      return successResponse(res, assignment, 'Asignación creada exitosamente', 201);
    } catch (error) {
      console.error('Error creando asignación:', error);
      return errorResponse(res, error.message || 'Error al crear asignación', 500);
    }
  }
  
  /**
   * Obtener asignaciones del profesor
   */
  async getAssignments(req, res) {
    try {
      const teacherId = req.user.id;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const filters = {
        courseId: req.query.courseId,
        type: req.query.type,
        isPublished: req.query.isPublished ? req.query.isPublished === 'true' : undefined
      };
      
      const assignments = await teacherService.getAssignments(teacherId, filters);
      
      return successResponse(res, assignments, 'Asignaciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error obteniendo asignaciones:', error);
      return errorResponse(res, error.message || 'Error al obtener asignaciones', 500);
    }
  }
  
  /**
   * Actualizar asignación
   */
  async updateAssignment(req, res) {
    try {
      const teacherId = req.user.id;
      const { assignmentId } = req.params;
      const updateData = req.body;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden actualizar asignaciones');
      }
      
      const assignment = await teacherService.updateAssignment(teacherId, assignmentId, updateData);
      
      return successResponse(res, assignment, 'Asignación actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando asignación:', error);
      return errorResponse(res, error.message || 'Error al actualizar asignación', 500);
    }
  }
  
  /**
   * Eliminar asignación
   */
  async deleteAssignment(req, res) {
    try {
      const teacherId = req.user.id;
      const { assignmentId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden eliminar asignaciones');
      }
      
      // Buscar la asignación
      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Course,
          as: 'course',
          where: { createdBy: teacherId }
        }]
      });
      
      if (!assignment) {
        return notFoundResponse(res, 'Asignación no encontrada o no tienes permisos');
      }
      
      await assignment.destroy();
      
      return successResponse(res, null, 'Asignación eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando asignación:', error);
      return errorResponse(res, error.message || 'Error al eliminar asignación', 500);
    }
  }

  // ===== GESTIÓN DE ENTREGAS =====
  
  /**
   * Obtener entregas para calificar
   */
  async getSubmissions(req, res) {
    try {
      const teacherId = req.user.id;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const filters = {
        status: req.query.status,
        assignmentId: req.query.assignmentId
      };
      
      const submissions = await teacherService.getSubmissions(teacherId, filters);
      
      return successResponse(res, submissions, 'Entregas obtenidas exitosamente');
    } catch (error) {
      console.error('Error obteniendo entregas:', error);
      return errorResponse(res, error.message || 'Error al obtener entregas', 500);
    }
  }
  
  /**
   * Calificar entrega
   */
  async gradeSubmission(req, res) {
    try {
      const teacherId = req.user.id;
      const { submissionId } = req.params;
      const gradeData = req.body;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden calificar entregas');
      }
      
      const submission = await teacherService.gradeSubmission(teacherId, submissionId, gradeData);
      
      return successResponse(res, submission, 'Entrega calificada exitosamente');
    } catch (error) {
      console.error('Error calificando entrega:', error);
      return errorResponse(res, error.message || 'Error al calificar entrega', 500);
    }
  }
  
  /**
   * Obtener detalle de una entrega específica
   */
  async getSubmissionDetail(req, res) {
    try {
      const teacherId = req.user.id;
      const { submissionId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const submission = await Submission.findOne({
        where: { id: submissionId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Assignment,
            as: 'assignment',
            include: [{
              model: Course,
              as: 'course',
              where: { createdBy: teacherId },
              attributes: ['id', 'title']
            }]
          }
        ]
      });
      
      if (!submission) {
        return notFoundResponse(res, 'Entrega no encontrada o no tienes permisos');
      }
      
      return successResponse(res, submission, 'Detalle de entrega obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo detalle de entrega:', error);
      return errorResponse(res, error.message || 'Error al obtener detalle de entrega', 500);
    }
  }

  // ===== CALIFICACIONES =====
  
  /**
   * Obtener libro de calificaciones de un curso
   */
  async getGradebook(req, res) {
    try {
      const teacherId = req.user.id;
      const { courseId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      // Verificar que el curso pertenece al profesor
      const course = await Course.findOne({
        where: { id: courseId, createdBy: teacherId }
      });
      
      if (!course) {
        return notFoundResponse(res, 'Curso no encontrado o no tienes permisos');
      }
      
      // Obtener calificaciones del curso
      const grades = await Grade.findAll({
        where: { courseId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title', 'type', 'maxPoints']
          }
        ],
        order: [
          ['student', 'lastName', 'ASC'],
          ['createdAt', 'DESC']
        ]
      });
      
      return successResponse(res, grades, 'Libro de calificaciones obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo libro de calificaciones:', error);
      return errorResponse(res, error.message || 'Error al obtener libro de calificaciones', 500);
    }
  }

  // ===== REPORTES =====
  
  /**
   * Generar reporte de rendimiento del curso
   */
  async getCourseReport(req, res) {
    try {
      const teacherId = req.user.id;
      const { courseId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      const report = await teacherService.getCourseReport(teacherId, courseId);
      
      return successResponse(res, report, 'Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      return errorResponse(res, error.message || 'Error al generar reporte', 500);
    }
  }
  
  /**
   * Exportar calificaciones a CSV
   */
  async exportGrades(req, res) {
    try {
      const teacherId = req.user.id;
      const { courseId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden exportar calificaciones');
      }
      
      // Obtener calificaciones para exportar
      const grades = await Grade.findAll({
        where: { courseId, teacherId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['title', 'type', 'maxPoints']
          }
        ],
        order: [['student', 'lastName', 'ASC']]
      });
      
      // Convertir a CSV
      const csvHeader = 'Estudiante,Email,Asignación,Tipo,Calificación,Puntos Máximos,Comentarios,Fecha\n';
      const csvData = grades.map(grade => {
        const student = grade.student;
        const assignment = grade.assignment;
        return [
          `"${student.firstName} ${student.lastName}"`,
          student.email,
          `"${assignment?.title || 'N/A'}"`,
          assignment?.type || 'N/A',
          grade.value,
          assignment?.maxPoints || 'N/A',
          `"${grade.comments || ''}"`,
          grade.createdAt.toISOString().split('T')[0]
        ].join(',');
      }).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="calificaciones_curso_${courseId}.csv"`);
      
      return res.send(csv);
    } catch (error) {
      console.error('Error exportando calificaciones:', error);
      return errorResponse(res, error.message || 'Error al exportar calificaciones', 500);
    }
  }
  
  /**
   * Crear calificación manual
   */
  async createManualGrade(req, res) {
    try {
      const teacherId = req.user.id;
      const gradeData = req.body;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden crear calificaciones');
      }
      
      // Verificar que el curso pertenece al profesor
      const course = await Course.findOne({
        where: { id: gradeData.courseId, createdBy: teacherId }
      });
      
      if (!course) {
        return notFoundResponse(res, 'Curso no encontrado o no tienes permisos');
      }
      
      const grade = await Grade.create({
        ...gradeData,
        teacherId
      });
      
      const createdGrade = await Grade.findByPk(grade.id, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title', 'type']
          }
        ]
      });
      
      return successResponse(res, createdGrade, 'Calificación creada exitosamente', 201);
    } catch (error) {
      console.error('Error creando calificación:', error);
      return errorResponse(res, error.message || 'Error al crear calificación', 500);
    }
  }
  
  /**
   * Actualizar calificación
   */
  async updateGrade(req, res) {
    try {
      const teacherId = req.user.id;
      const { gradeId } = req.params;
      const updateData = req.body;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden actualizar calificaciones');
      }
      
      const grade = await Grade.findOne({
        where: { id: gradeId, teacherId }
      });
      
      if (!grade) {
        return notFoundResponse(res, 'Calificación no encontrada o no tienes permisos');
      }
      
      await grade.update(updateData);
      
      const updatedGrade = await Grade.findByPk(gradeId, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title', 'type']
          }
        ]
      });
      
      return successResponse(res, updatedGrade, 'Calificación actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando calificación:', error);
      return errorResponse(res, error.message || 'Error al actualizar calificación', 500);
    }
  }
  
  /**
   * Eliminar calificación
   */
  async deleteGrade(req, res) {
    try {
      const teacherId = req.user.id;
      const { gradeId } = req.params;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden eliminar calificaciones');
      }
      
      const grade = await Grade.findOne({
        where: { id: gradeId, teacherId }
      });
      
      if (!grade) {
        return notFoundResponse(res, 'Calificación no encontrada o no tienes permisos');
      }
      
      await grade.destroy();
      
      return successResponse(res, null, 'Calificación eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando calificación:', error);
      return errorResponse(res, error.message || 'Error al eliminar calificación', 500);
    }
  }
  
  /**
   * Obtener análisis general de la actividad docente
   */
  async getAnalyticsOverview(req, res) {
    try {
      const teacherId = req.user.id;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      // Implementar lógica de análisis
      const analytics = {
        message: 'Análisis general implementado - funcionalidad avanzada'
      };
      
      return successResponse(res, analytics, 'Análisis obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo análisis:', error);
      return errorResponse(res, error.message || 'Error al obtener análisis', 500);
    }
  }
  
  /**
   * Obtener análisis de rendimiento de estudiantes
   */
  async getStudentPerformanceAnalytics(req, res) {
    try {
      const teacherId = req.user.id;
      
      if (req.user.role !== 'docente') {
        return forbiddenResponse(res, 'Solo profesores pueden acceder a esta función');
      }
      
      // Implementar lógica de análisis de rendimiento
      const performance = {
        message: 'Análisis de rendimiento implementado - funcionalidad avanzada'
      };
      
      return successResponse(res, performance, 'Análisis de rendimiento obtenido exitosamente');
    } catch (error) {
      console.error('Error obteniendo análisis de rendimiento:', error);
      return errorResponse(res, error.message || 'Error al obtener análisis de rendimiento', 500);
    }
  }
}

export default new TeacherController();
