import apiManager from './apiManager'

class TeacherService {
  // Dashboard
  async getDashboard() {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          totalCourses: 5,
          totalStudents: 127,
          totalAssignments: 23,
          pendingSubmissions: 14,
          averageGrade: 8.4,
          coursesStats: [
            { id: 1, name: 'Matemáticas Básicas', students: 32, progress: 78 },
            { id: 2, name: 'Física I', students: 28, progress: 65 },
            { id: 3, name: 'Química General', students: 35, progress: 82 },
            { id: 4, name: 'Cálculo I', students: 22, progress: 71 },
            { id: 5, name: 'Álgebra Lineal', students: 10, progress: 45 }
          ],
          recentActivity: [
            { type: 'submission', studentName: 'Juan Pérez', assignmentName: 'Tarea 5', time: '2 horas', status: 'pending' },
            { type: 'grade', studentName: 'María García', assignmentName: 'Examen Parcial', time: '4 horas', status: 'graded', grade: 9.2 },
            { type: 'submission', studentName: 'Carlos López', assignmentName: 'Laboratorio 3', time: '6 horas', status: 'pending' },
            { type: 'grade', studentName: 'Ana Martínez', assignmentName: 'Proyecto Final', time: '1 día', status: 'graded', grade: 8.8 }
          ],
          monthlyStats: {
            assignmentsCreated: 8,
            submissionsGraded: 45,
            averageResponseTime: '2.3 días',
            studentSatisfaction: 4.6
          }
        }
      }
    }
    
    const response = await apiManager.request('/teacher/dashboard')
    return response.data
  }

  // Courses
  async getCourses(page = 1, limit = 10) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          courses: [
            {
              id: 1,
              title: 'Matemáticas Básicas',
              description: 'Fundamentos de matemáticas para estudiantes universitarios',
              studentsCount: 32,
              lessonsCount: 24,
              completionRate: 78,
              status: 'active',
              startDate: '2024-09-01',
              endDate: '2024-12-15',
              image: 'https://via.placeholder.com/300x200?text=Matemáticas'
            },
            {
              id: 2,
              title: 'Física I',
              description: 'Introducción a la física clásica y mecánica',
              studentsCount: 28,
              lessonsCount: 20,
              completionRate: 65,
              status: 'active',
              startDate: '2024-09-01',
              endDate: '2024-12-15',
              image: 'https://via.placeholder.com/300x200?text=Física'
            },
            {
              id: 3,
              title: 'Química General',
              description: 'Conceptos fundamentales de química',
              studentsCount: 35,
              lessonsCount: 18,
              completionRate: 82,
              status: 'active',
              startDate: '2024-09-01',
              endDate: '2024-12-15',
              image: 'https://via.placeholder.com/300x200?text=Química'
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalItems: 3,
            itemsPerPage: limit
          }
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/courses?page=${page}&limit=${limit}`)
    return response.data
  }

  async getCourseStudents(courseId, page = 1, limit = 20) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          students: [
            {
              id: 1,
              name: 'Juan Pérez',
              email: 'juan.perez@email.com',
              enrolledAt: '2024-09-01',
              progress: 85,
              lastActivity: '2024-07-06',
              totalGrade: 8.7,
              assignmentsCompleted: 12,
              totalAssignments: 15
            },
            {
              id: 2,
              name: 'María García',
              email: 'maria.garcia@email.com',
              enrolledAt: '2024-09-01',
              progress: 92,
              lastActivity: '2024-07-07',
              totalGrade: 9.2,
              assignmentsCompleted: 14,
              totalAssignments: 15
            },
            {
              id: 3,
              name: 'Carlos López',
              email: 'carlos.lopez@email.com',
              enrolledAt: '2024-09-02',
              progress: 78,
              lastActivity: '2024-07-05',
              totalGrade: 8.1,
              assignmentsCompleted: 11,
              totalAssignments: 15
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 2,
            totalItems: 32,
            itemsPerPage: limit
          }
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/courses/${courseId}/students?page=${page}&limit=${limit}`)
    return response.data
  }

  async getCourseReport(courseId) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          courseInfo: {
            id: courseId,
            name: 'Matemáticas Básicas',
            studentsCount: 32,
            lessonsCount: 24,
            assignmentsCount: 15
          },
          statistics: {
            averageGrade: 8.4,
            completionRate: 78,
            passRate: 87,
            attendanceRate: 91
          },
          gradeDistribution: [
            { range: '9.0-10.0', count: 8, percentage: 25 },
            { range: '8.0-8.9', count: 12, percentage: 37.5 },
            { range: '7.0-7.9', count: 7, percentage: 21.9 },
            { range: '6.0-6.9', count: 3, percentage: 9.4 },
            { range: '0.0-5.9', count: 2, percentage: 6.2 }
          ],
          progressByWeek: [
            { week: 1, completed: 95 },
            { week: 2, completed: 89 },
            { week: 3, completed: 83 },
            { week: 4, completed: 78 }
          ]
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/courses/${courseId}/report`)
    return response.data
  }

  // Assignments
  async getAssignments(page = 1, limit = 10, courseId = null, status = null) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          assignments: [
            {
              id: 1,
              title: 'Tarea 5: Ecuaciones Cuadráticas',
              description: 'Resolver los ejercicios del capítulo 5',
              courseId: 1,
              courseName: 'Matemáticas Básicas',
              dueDate: '2024-07-15',
              status: 'active',
              submissionsCount: 28,
              totalStudents: 32,
              maxGrade: 10,
              averageGrade: 8.2
            },
            {
              id: 2,
              title: 'Examen Parcial',
              description: 'Evaluación de los primeros 4 capítulos',
              courseId: 1,
              courseName: 'Matemáticas Básicas',
              dueDate: '2024-07-20',
              status: 'active',
              submissionsCount: 15,
              totalStudents: 32,
              maxGrade: 10,
              averageGrade: 7.8
            },
            {
              id: 3,
              title: 'Laboratorio 3: Cinemática',
              description: 'Experimentos de movimiento rectilíneo uniforme',
              courseId: 2,
              courseName: 'Física I',
              dueDate: '2024-07-18',
              status: 'active',
              submissionsCount: 25,
              totalStudents: 28,
              maxGrade: 10,
              averageGrade: 8.9
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 3,
            totalItems: 23,
            itemsPerPage: limit
          }
        }
      }
    }
    
    let url = `/teacher/assignments?page=${page}&limit=${limit}`
    if (courseId) url += `&courseId=${courseId}`
    if (status) url += `&status=${status}`
    
    const response = await apiManager.request(url)
    return response.data
  }

  async createAssignment(assignmentData) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          id: Date.now(),
          ...assignmentData,
          status: 'active',
          submissionsCount: 0,
          averageGrade: 0
        }
      }
    }
    
    const response = await apiManager.request('/teacher/assignments', {
      method: 'POST',
      data: assignmentData
    })
    return response.data
  }

  async updateAssignment(assignmentId, assignmentData) {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          id: assignmentId,
          ...assignmentData
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/assignments/${assignmentId}`, {
      method: 'PUT',
      data: assignmentData
    })
    return response.data
  }

  async deleteAssignment(assignmentId) {
    if (process.env.NODE_ENV === 'development') {
      return { data: { message: 'Asignación eliminada exitosamente' } }
    }
    
    const response = await apiManager.request(`/teacher/assignments/${assignmentId}`, {
      method: 'DELETE'
    })
    return response.data
  }

  // Submissions
  async getSubmissions(page = 1, limit = 10, status = 'pending') {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          submissions: [
            {
              id: 1,
              studentName: 'Juan Pérez',
              studentEmail: 'juan.perez@email.com',
              assignmentTitle: 'Tarea 5: Ecuaciones Cuadráticas',
              courseName: 'Matemáticas Básicas',
              submittedAt: '2024-07-06T10:30:00Z',
              status: 'pending',
              grade: null,
              submissionText: 'Adjunto la resolución de todos los ejercicios del capítulo 5.',
              attachments: ['ejercicios_cap5.pdf']
            },
            {
              id: 2,
              studentName: 'María García',
              studentEmail: 'maria.garcia@email.com',
              assignmentTitle: 'Laboratorio 3: Cinemática',
              courseName: 'Física I',
              submittedAt: '2024-07-05T14:20:00Z',
              status: 'graded',
              grade: 9.2,
              submissionText: 'Reporte completo del experimento de cinemática.',
              attachments: ['laboratorio3_reporte.pdf', 'datos_experimentales.xlsx']
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 2,
            totalItems: 14,
            itemsPerPage: limit
          }
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/submissions?page=${page}&limit=${limit}&status=${status}`)
    return response.data
  }

  async gradeSubmission(submissionId, grade, feedback = '') {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          id: submissionId,
          grade,
          feedback,
          gradedAt: new Date().toISOString(),
          status: 'graded'
        }
      }
    }
    
    const response = await apiManager.request(`/teacher/submissions/${submissionId}/grade`, {
      method: 'PUT',
      data: {
        grade,
        feedback
      }
    })
    return response.data
  }

  // Analytics
  async getAnalyticsOverview() {
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          totalHours: 45.2,
          studentsReached: 127,
          coursesActive: 5,
          satisfactionRate: 4.6,
          trendsData: {
            engagement: [78, 82, 85, 79, 88, 92, 87],
            performance: [8.1, 8.3, 8.5, 8.2, 8.7, 8.9, 8.4],
            submissions: [23, 28, 31, 27, 35, 39, 33]
          },
          topPerformingCourses: [
            { name: 'Química General', score: 9.2 },
            { name: 'Matemáticas Básicas', score: 8.7 },
            { name: 'Física I', score: 8.1 }
          ]
        }
      }
    }
    
    const response = await apiManager.request('/teacher/analytics/overview')
    return response.data
  }
}

export default new TeacherService()
