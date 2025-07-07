import api from './api'
import apiManager from './apiManager'

// Mock data para desarrollo
const mockCourses = [
  {
    id: 1,
    title: 'Matemáticas Básicas',
    description: 'Fundamentos de matemáticas para estudiantes universitarios',
    subject: 'mathematics',
    level: 'beginner',
    duration: 120,
    lessonsCount: 24,
    enrolledStudents: 150,
    rating: 4.8,
    instructor: 'Dr. Ana García',
    isActive: true,
    image: 'https://via.placeholder.com/300x200?text=Matemáticas',
    createdAt: '2024-01-15',
    progress: 0
  },
  {
    id: 2,
    title: 'Física I',
    description: 'Introducción a la física clásica y mecánica',
    subject: 'physics',
    level: 'beginner',
    duration: 100,
    lessonsCount: 20,
    enrolledStudents: 120,
    rating: 4.6,
    instructor: 'Prof. Carlos Mendez',
    isActive: true,
    image: 'https://via.placeholder.com/300x200?text=Física',
    createdAt: '2024-02-01',
    progress: 25
  },
  {
    id: 3,
    title: 'Química General',
    description: 'Conceptos fundamentales de química',
    subject: 'chemistry',
    level: 'intermediate',
    duration: 90,
    lessonsCount: 18,
    enrolledStudents: 95,
    rating: 4.7,
    instructor: 'Dra. María López',
    isActive: true,
    image: 'https://via.placeholder.com/300x200?text=Química',
    createdAt: '2024-01-20',
    progress: 60
  }
]

const mockLessons = [
  {
    id: 1,
    courseId: 1,
    title: 'Introducción a los números',
    description: 'Conceptos básicos de números naturales, enteros y racionales',
    duration: 45,
    order: 1,
    isCompleted: true,
    type: 'video',
    content: {
      videoUrl: 'https://example.com/video1',
      materials: ['Guía de números.pdf', 'Ejercicios.pdf']
    }
  },
  {
    id: 2,
    courseId: 1,
    title: 'Operaciones básicas',
    description: 'Suma, resta, multiplicación y división',
    duration: 50,
    order: 2,
    isCompleted: true,
    type: 'video',
    content: {
      videoUrl: 'https://example.com/video2',
      materials: ['Tabla de multiplicar.pdf']
    }
  },
  {
    id: 3,
    courseId: 1,
    title: 'Ecuaciones lineales',
    description: 'Resolución de ecuaciones de primer grado',
    duration: 60,
    order: 3,
    isCompleted: false,
    type: 'video',
    content: {
      videoUrl: 'https://example.com/video3',
      materials: ['Método de resolución.pdf', 'Ejercicios prácticos.pdf']
    }
  }
]

// Lessons service
export const lessonsAPI = {
  // Get all courses
  getCourses: async (params = {}) => {
    return await apiManager.executeRequest(
      () => api.get('/lessons/courses', { params }),
      mockCourses
    )
  },

  // Get course by ID
  getCourse: async (courseId) => {
    return await apiManager.executeRequest(
      () => api.get(`/lessons/courses/${courseId}`),
      mockCourses.find(course => course.id === parseInt(courseId))
    )
  },

  // Get lessons for a course
  getLessons: async (courseId, params = {}) => {
    return await apiManager.executeRequest(
      () => api.get(`/lessons/courses/${courseId}/lessons`, { params }),
      mockLessons.filter(lesson => lesson.courseId === parseInt(courseId))
    )
  },

  // Get lesson by ID
  getLesson: async (lessonId) => {
    return await apiManager.executeRequest(
      () => api.get(`/lessons/${lessonId}`),
      mockLessons.find(lesson => lesson.id === parseInt(lessonId))
    )
  },

  // Start lesson
  startLesson: async (lessonId) => {
    return await apiManager.executeRequest(
      () => api.post(`/lessons/${lessonId}/start`),
      { started: true, startedAt: new Date().toISOString() }
    )
  },

  // Complete lesson
  completeLesson: async (lessonId, completionData) => {
    return await apiManager.executeRequest(
      () => api.post(`/lessons/${lessonId}/complete`, completionData),
      { completed: true, completedAt: new Date().toISOString(), ...completionData }
    )
  },

  // Update lesson progress
  updateProgress: async (lessonId, progressData) => {
    return await apiManager.executeRequest(
      () => api.put(`/lessons/${lessonId}/progress`, progressData),
      { progress: progressData.progress, updatedAt: new Date().toISOString() }
    )
  },

  // Get user's lesson progress
  getProgress: async (lessonId) => {
    return await apiManager.executeRequest(
      () => api.get(`/lessons/${lessonId}/progress`),
      { progress: 75, timeSpent: 1800, lastAccessed: new Date().toISOString() }
    )
  },

  // Get user's course progress
  getCourseProgress: async (courseId) => {
    return await apiManager.executeRequest(
      () => api.get(`/lessons/courses/${courseId}/progress`),
      { 
        courseId: parseInt(courseId),
        totalLessons: 24,
        completedLessons: 8,
        progress: 33,
        timeSpent: 14400,
        lastAccessed: new Date().toISOString()
      }
    )
  },

  // Search lessons
  searchLessons: async (query, params = {}) => {
    return await apiManager.executeRequest(
      () => api.get('/lessons/search', { params: { query, ...params } }),
      mockLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(query.toLowerCase()) ||
        lesson.description.toLowerCase().includes(query.toLowerCase())
      )
    )
  },

  // Get user's enrolled courses
  getEnrolledCourses: async () => {
    return await apiManager.executeRequest(
      () => api.get('/lessons/enrolled'),
      mockCourses.filter(course => course.progress > 0)
    )
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    return await apiManager.executeRequest(
      () => api.post(`/lessons/courses/${courseId}/enroll`),
      { enrolled: true, enrolledAt: new Date().toISOString() }
    )
  }
}

export default lessonsAPI
