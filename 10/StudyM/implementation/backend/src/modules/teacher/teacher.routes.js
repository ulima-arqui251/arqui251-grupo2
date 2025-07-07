import express from 'express';
import teacherController from './teacher.controller.js';
import { 
  createAssignmentSchema,
  updateAssignmentSchema,
  gradeSubmissionSchema,
  createGradeSchema,
  getAssignmentsSchema,
  getSubmissionsSchema,
  getCourseStudentsSchema,
  getCoursesSchema,
  idParamSchema,
  courseIdParamSchema,
  assignmentIdParamSchema,
  submissionIdParamSchema
} from './teacher.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';

const router = express.Router();

// Middleware para verificar autenticación en todas las rutas
router.use(authenticate);

// ===== DASHBOARD =====

/**
 * @route GET /api/teacher/dashboard
 * @desc Obtener estadísticas del dashboard del profesor
 * @access Private (Teacher only)
 */
router.get('/dashboard', teacherController.getDashboard);

// ===== GESTIÓN DE CURSOS =====

/**
 * @route GET /api/teacher/courses
 * @desc Obtener cursos del profesor
 * @access Private (Teacher only)
 */
router.get('/courses',
  validate(getCoursesSchema),
  teacherController.getCourses
);

/**
 * @route GET /api/teacher/courses/:courseId/students
 * @desc Obtener estudiantes de un curso específico
 * @access Private (Teacher only)
 */
router.get('/courses/:courseId/students',
  validate(courseIdParamSchema),
  validate(getCourseStudentsSchema),
  teacherController.getCourseStudents
);

/**
 * @route GET /api/teacher/courses/:courseId/report
 * @desc Generar reporte de rendimiento del curso
 * @access Private (Teacher only)
 */
router.get('/courses/:courseId/report',
  validate(courseIdParamSchema),
  teacherController.getCourseReport
);

/**
 * @route GET /api/teacher/courses/:courseId/gradebook
 * @desc Obtener libro de calificaciones del curso
 * @access Private (Teacher only)
 */
router.get('/courses/:courseId/gradebook',
  validate(courseIdParamSchema),
  teacherController.getGradebook
);

/**
 * @route GET /api/teacher/courses/:courseId/export-grades
 * @desc Exportar calificaciones del curso a CSV
 * @access Private (Teacher only)
 */
router.get('/courses/:courseId/export-grades',
  validate(courseIdParamSchema),
  teacherController.exportGrades
);

// ===== GESTIÓN DE ASIGNACIONES =====

/**
 * @route GET /api/teacher/assignments
 * @desc Obtener asignaciones del profesor
 * @access Private (Teacher only)
 */
router.get('/assignments',
  validate(getAssignmentsSchema),
  teacherController.getAssignments
);

/**
 * @route POST /api/teacher/assignments
 * @desc Crear nueva asignación
 * @access Private (Teacher only)
 */
router.post('/assignments',
  validate(createAssignmentSchema),
  teacherController.createAssignment
);

/**
 * @route PUT /api/teacher/assignments/:assignmentId
 * @desc Actualizar asignación
 * @access Private (Teacher only)
 */
router.put('/assignments/:assignmentId',
  validate(assignmentIdParamSchema),
  validate(updateAssignmentSchema),
  teacherController.updateAssignment
);

/**
 * @route DELETE /api/teacher/assignments/:assignmentId
 * @desc Eliminar asignación
 * @access Private (Teacher only)
 */
router.delete('/assignments/:assignmentId',
  validate(assignmentIdParamSchema),
  teacherController.deleteAssignment
);

// ===== GESTIÓN DE ENTREGAS =====

/**
 * @route GET /api/teacher/submissions
 * @desc Obtener entregas para calificar
 * @access Private (Teacher only)
 */
router.get('/submissions',
  validate(getSubmissionsSchema),
  teacherController.getSubmissions
);

/**
 * @route GET /api/teacher/submissions/:submissionId
 * @desc Obtener detalle de una entrega específica
 * @access Private (Teacher only)
 */
router.get('/submissions/:submissionId',
  validate(submissionIdParamSchema),
  teacherController.getSubmissionDetail
);

/**
 * @route PUT /api/teacher/submissions/:submissionId/grade
 * @desc Calificar entrega
 * @access Private (Teacher only)
 */
router.put('/submissions/:submissionId/grade',
  validate(submissionIdParamSchema),
  validate(gradeSubmissionSchema),
  teacherController.gradeSubmission
);

// ===== GESTIÓN DE CALIFICACIONES =====

/**
 * @route POST /api/teacher/grades
 * @desc Crear calificación manual
 * @access Private (Teacher only)
 */
router.post('/grades',
  validate(createGradeSchema),
  teacherController.createManualGrade
);

/**
 * @route PUT /api/teacher/grades/:gradeId
 * @desc Actualizar calificación
 * @access Private (Teacher only)
 */
router.put('/grades/:gradeId',
  validate(idParamSchema),
  teacherController.updateGrade
);

/**
 * @route DELETE /api/teacher/grades/:gradeId
 * @desc Eliminar calificación
 * @access Private (Teacher only)
 */
router.delete('/grades/:gradeId',
  validate(idParamSchema),
  teacherController.deleteGrade
);

// ===== ANÁLISIS Y REPORTES =====

/**
 * @route GET /api/teacher/analytics/overview
 * @desc Obtener análisis general de la actividad docente
 * @access Private (Teacher only)
 */
router.get('/analytics/overview',
  teacherController.getAnalyticsOverview
);

/**
 * @route GET /api/teacher/analytics/student-performance
 * @desc Obtener análisis de rendimiento de estudiantes
 * @access Private (Teacher only)
 */
router.get('/analytics/student-performance',
  teacherController.getStudentPerformanceAnalytics
);

export default router;
