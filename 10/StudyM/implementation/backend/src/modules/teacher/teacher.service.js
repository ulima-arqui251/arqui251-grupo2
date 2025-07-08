import { 
  User, 
  Course, 
  Lesson, 
  Assignment, 
  Submission, 
  Grade, 
  Enrollment, 
  LessonProgress,
  UserStats
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

class TeacherService {
  
  // ===== DASHBOARD =====
  
  /**
   * Obtener estadísticas del dashboard del profesor
   */
  async getDashboardStats(teacherId) {
    try {
      const [
        totalCourses,
        totalStudents,
        pendingSubmissions,
        totalAssignments,
        recentActivity
      ] = await Promise.all([
        // Total de cursos creados
        Course.count({
          where: { createdBy: teacherId, isActive: true }
        }),
        
        // Total de estudiantes únicos
        Enrollment.count({
          distinct: true,
          col: 'studentId',
          include: [{
            model: Course,
            as: 'course',
            where: { createdBy: teacherId }
          }]
        }),
        
        // Tareas pendientes de calificar
        Submission.count({
          where: { status: 'submitted' },
          include: [{
            model: Assignment,
            as: 'assignment',
            include: [{
              model: Course,
              as: 'course',
              where: { createdBy: teacherId }
            }]
          }]
        }),
        
        // Total de asignaciones
        Assignment.count({
          include: [{
            model: Course,
            as: 'course',
            where: { createdBy: teacherId }
          }]
        }),
        
        // Actividad reciente (últimas 5 entregas)
        Submission.findAll({
          limit: 5,
          order: [['submittedAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Assignment,
              as: 'assignment',
              attributes: ['id', 'title', 'type'],
              include: [{
                model: Course,
                as: 'course',
                where: { createdBy: teacherId },
                attributes: ['id', 'title']
              }]
            }
          ]
        })
      ]);

      return {
        totalCourses,
        totalStudents,
        pendingSubmissions,
        totalAssignments,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas del dashboard: ${error.message}`);
    }
  }

  // ===== GESTIÓN DE CURSOS =====
  
  /**
   * Obtener cursos del profesor con estadísticas
   */
  async getCourses(teacherId, filters = {}) {
    try {
      const whereClause = {
        createdBy: teacherId
      };
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      if (filters.subject) {
        whereClause.subject = filters.subject;
      }

      const courses = await Course.findAll({
        where: whereClause,
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: { status: 'active' },
            required: false,
            include: [{
              model: User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName']
            }]
          },
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id', 'title', 'isActive']
          },
          {
            model: Assignment,
            as: 'assignments',
            attributes: ['id', 'title', 'isPublished']
          }
        ],
        order: [['updatedAt', 'DESC']]
      });

      // Agregar estadísticas calculadas
      const coursesWithStats = await Promise.all(courses.map(async (course) => {
        const courseData = course.toJSON();
        
        // Calcular progreso promedio del curso
        const avgProgress = await LessonProgress.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
          ],
          include: [{
            model: Lesson,
            as: 'lesson',
            where: { courseId: course.id }
          }]
        });
        
        courseData.stats = {
          studentsCount: courseData.enrollments.length,
          lessonsCount: courseData.lessons.length,
          assignmentsCount: courseData.assignments.length,
          avgProgress: parseFloat(avgProgress[0]?.dataValues?.avgProgress || 0)
        };
        
        return courseData;
      }));

      return coursesWithStats;
    } catch (error) {
      throw new Error(`Error obteniendo cursos: ${error.message}`);
    }
  }
  
  /**
   * Obtener estudiantes de un curso específico
   */
  async getCourseStudents(teacherId, courseId, filters = {}) {
    try {
      // Verificar que el curso pertenece al profesor
      const course = await Course.findOne({
        where: { id: courseId, createdBy: teacherId }
      });
      
      if (!course) {
        throw new Error('Curso no encontrado o no tienes permisos');
      }

      const whereClause = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }

      const students = await Enrollment.findAll({
        where: {
          courseId,
          ...whereClause
        },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
            include: [{
              model: UserStats,
              as: 'stats',
              attributes: ['totalPoints', 'lessonsCompleted', 'level']
            }]
          }
        ],
        order: [['enrolledAt', 'DESC']]
      });

      // Calcular progreso y notas para cada estudiante
      const studentsWithDetails = await Promise.all(students.map(async (enrollment) => {
        const studentData = enrollment.toJSON();
        
        // Progreso en lecciones del curso
        const lessonProgress = await LessonProgress.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'completedLessons']
          ],
          where: { 
            userId: enrollment.studentId,
            isCompleted: true
          },
          include: [{
            model: Lesson,
            as: 'lesson',
            where: { courseId },
            attributes: []
          }]
        });
        
        // Promedio de calificaciones
        const avgGrade = await Grade.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('value')), 'avgGrade']
          ],
          where: {
            studentId: enrollment.studentId,
            courseId
          }
        });

        studentData.courseProgress = {
          avgProgress: parseFloat(lessonProgress[0]?.dataValues?.avgProgress || 0),
          completedLessons: parseInt(lessonProgress[0]?.dataValues?.completedLessons || 0),
          avgGrade: parseFloat(avgGrade[0]?.dataValues?.avgGrade || 0)
        };
        
        return studentData;
      }));

      return studentsWithDetails;
    } catch (error) {
      throw new Error(`Error obteniendo estudiantes del curso: ${error.message}`);
    }
  }

  // ===== GESTIÓN DE ASIGNACIONES =====
  
  /**
   * Crear nueva asignación
   */
  async createAssignment(teacherId, assignmentData) {
    try {
      // Verificar que el curso pertenece al profesor
      const course = await Course.findOne({
        where: { id: assignmentData.courseId, createdBy: teacherId }
      });
      
      if (!course) {
        throw new Error('Curso no encontrado o no tienes permisos');
      }

      const assignment = await Assignment.create({
        ...assignmentData,
        createdBy: teacherId
      });

      return await Assignment.findByPk(assignment.id, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }]
      });
    } catch (error) {
      throw new Error(`Error creando asignación: ${error.message}`);
    }
  }
  
  /**
   * Obtener asignaciones del profesor
   */
  async getAssignments(teacherId, filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.courseId) {
        whereClause.courseId = filters.courseId;
      }
      
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      if (filters.isPublished !== undefined) {
        whereClause.isPublished = filters.isPublished;
      }

      const assignments = await Assignment.findAll({
        where: whereClause,
        include: [
          {
            model: Course,
            as: 'course',
            where: { createdBy: teacherId },
            attributes: ['id', 'title']
          },
          {
            model: Submission,
            as: 'submissions',
            required: false,
            include: [{
              model: User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName']
            }]
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Agregar estadísticas de entregas
      const assignmentsWithStats = assignments.map(assignment => {
        const assignmentData = assignment.toJSON();
        const submissions = assignmentData.submissions || [];
        
        assignmentData.stats = {
          totalSubmissions: submissions.length,
          pendingGrading: submissions.filter(s => s.status === 'submitted').length,
          graded: submissions.filter(s => s.status === 'graded').length,
          lateSubmissions: submissions.filter(s => s.isLate).length
        };
        
        return assignmentData;
      });

      return assignmentsWithStats;
    } catch (error) {
      throw new Error(`Error obteniendo asignaciones: ${error.message}`);
    }
  }

  /**
   * Actualizar asignación
   */
  async updateAssignment(teacherId, assignmentId, updateData) {
    try {
      const assignment = await Assignment.findOne({
        where: { id: assignmentId },
        include: [{
          model: Course,
          as: 'course',
          where: { createdBy: teacherId }
        }]
      });
      
      if (!assignment) {
        throw new Error('Asignación no encontrada o no tienes permisos');
      }

      await assignment.update(updateData);
      
      return await Assignment.findByPk(assignmentId, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }]
      });
    } catch (error) {
      throw new Error(`Error actualizando asignación: ${error.message}`);
    }
  }

  // ===== GESTIÓN DE ENTREGAS =====
  
  /**
   * Obtener entregas para calificar
   */
  async getSubmissions(teacherId, filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.assignmentId) {
        whereClause.assignmentId = filters.assignmentId;
      }

      const submissions = await Submission.findAll({
        where: whereClause,
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
        ],
        order: [['submittedAt', 'DESC']]
      });

      return submissions;
    } catch (error) {
      throw new Error(`Error obteniendo entregas: ${error.message}`);
    }
  }

  /**
   * Calificar entrega
   */
  async gradeSubmission(teacherId, submissionId, gradeData) {
    try {
      const submission = await Submission.findOne({
        where: { id: submissionId },
        include: [{
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Course,
            as: 'course',
            where: { createdBy: teacherId }
          }]
        }]
      });
      
      if (!submission) {
        throw new Error('Entrega no encontrada o no tienes permisos');
      }

      // Actualizar la entrega
      await submission.update({
        grade: gradeData.grade,
        feedback: gradeData.feedback,
        status: 'graded',
        gradedAt: new Date(),
        gradedBy: teacherId
      });

      // Crear registro en la tabla de calificaciones
      await Grade.create({
        value: gradeData.grade,
        type: submission.assignment.type,
        comments: gradeData.feedback,
        courseId: submission.assignment.courseId,
        studentId: submission.studentId,
        teacherId: teacherId,
        assignmentId: submission.assignmentId
      });

      return await Submission.findByPk(submissionId, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title', 'maxPoints']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error calificando entrega: ${error.message}`);
    }
  }

  // ===== REPORTES Y ANÁLISIS =====
  
  /**
   * Generar reporte de rendimiento del curso
   */
  async getCourseReport(teacherId, courseId) {
    try {
      const course = await Course.findOne({
        where: { id: courseId, createdBy: teacherId },
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: { status: 'active' },
            include: [{
              model: User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName']
            }]
          }
        ]
      });
      
      if (!course) {
        throw new Error('Curso no encontrado o no tienes permisos');
      }

      // Estadísticas generales
      const stats = await Promise.all([
        // Progreso promedio del curso
        LessonProgress.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
          ],
          include: [{
            model: Lesson,
            as: 'lesson',
            where: { courseId },
            attributes: []
          }]
        }),
        
        // Calificaciones promedio
        Grade.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('value')), 'avgGrade'],
            [sequelize.fn('MIN', sequelize.col('value')), 'minGrade'],
            [sequelize.fn('MAX', sequelize.col('value')), 'maxGrade']
          ],
          where: { courseId }
        }),
        
        // Distribución de calificaciones
        Grade.findAll({
          attributes: [
            'value',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: { courseId },
          group: ['value'],
          order: [['value', 'DESC']]
        })
      ]);

      return {
        course: course.toJSON(),
        statistics: {
          avgProgress: parseFloat(stats[0][0]?.dataValues?.avgProgress || 0),
          avgGrade: parseFloat(stats[1][0]?.dataValues?.avgGrade || 0),
          minGrade: parseFloat(stats[1][0]?.dataValues?.minGrade || 0),
          maxGrade: parseFloat(stats[1][0]?.dataValues?.maxGrade || 0),
          gradeDistribution: stats[2].map(item => item.toJSON())
        }
      };
    } catch (error) {
      throw new Error(`Error generando reporte del curso: ${error.message}`);
    }
  }
}

export default new TeacherService();
