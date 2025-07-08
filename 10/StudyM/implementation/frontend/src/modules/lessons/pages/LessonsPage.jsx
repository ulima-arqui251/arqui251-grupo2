import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { lessonsAPI } from '../../../shared/services/lessonsService'
import { useNotifications } from '../../../shared/context/NotificationContext'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import CourseCard from '../components/CourseCard'
import Icon from '../../../shared/components/Icon'

function LessonsPage() {
  const [courses, setCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { showSuccess, showError } = useNotifications()

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'programming', label: 'Programación' },
    { value: 'design', label: 'Diseño' },
    { value: 'business', label: 'Negocios' },
    { value: 'science', label: 'Ciencias' },
  ]

  useEffect(() => {
    loadCourses()
    loadEnrolledCourses()
  }, [])

  const loadCourses = async () => {
    try {
      // Simulated data - in real app, use: const response = await lessonsAPI.getCourses()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCourses = [
        {
          id: 1,
          title: 'Introducción a React',
          description: 'Aprende los fundamentos de React desde cero',
          category: 'programming',
          lessonsCount: 12,
          duration: '6 horas',
          icon: '⚛️',
          progress: 75
        },
        {
          id: 2,
          title: 'Diseño UX/UI',
          description: 'Principios de diseño de experiencia de usuario',
          category: 'design',
          lessonsCount: 8,
          duration: '4 horas',
          icon: '🎨',
          progress: 30
        },
        {
          id: 3,
          title: 'JavaScript Avanzado',
          description: 'Conceptos avanzados de JavaScript',
          category: 'programming',
          lessonsCount: 15,
          duration: '8 horas',
          icon: '🟨',
          progress: 0
        },
        {
          id: 4,
          title: 'Marketing Digital',
          description: 'Estrategias de marketing en el mundo digital',
          category: 'business',
          lessonsCount: 10,
          duration: '5 horas',
          icon: '📈',
          progress: 0
        }
      ]
      
      setCourses(mockCourses)
    } catch (error) {
      showError('Error al cargar los cursos')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEnrolledCourses = async () => {
    try {
      // Simulated enrolled courses
      setEnrolledCourses([1, 2]) // IDs of enrolled courses
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      // await lessonsAPI.enrollInCourse(courseId)
      setEnrolledCourses(prev => [...prev, courseId])
      showSuccess('Te has inscrito exitosamente al curso')
    } catch (error) {
      showError('Error al inscribirse al curso')
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const enrolledCoursesData = filteredCourses.filter(course => 
    enrolledCourses.includes(course.id)
  )

  const availableCoursesData = filteredCourses.filter(course => 
    !enrolledCourses.includes(course.id)
  )

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner text="Cargando cursos..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-3 d-flex align-items-center">
            <Icon name="books" size={32} color="#007bff" className="me-2" />
            Lecciones y Cursos
          </h1>
          <p className="text-muted">Explora nuestro catálogo de cursos y continúa tu aprendizaje</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enrolled Courses */}
      {enrolledCoursesData.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 d-flex align-items-center">
            <Icon name="book" size={24} color="#28a745" className="me-2" />
            Mis Cursos
          </h3>
          <div className="row">
            {enrolledCoursesData.map(course => (
              <div key={course.id} className="col-md-6 col-lg-4 mb-4">
                <CourseCard 
                  course={course} 
                  onEnroll={handleEnroll}
                  isEnrolled={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div className="mb-5">
        <h3 className="mb-3 d-flex align-items-center">
          <Icon name="star" size={24} color="#ffc107" className="me-2" />
          Cursos Disponibles
        </h3>
        {availableCoursesData.length > 0 ? (
          <div className="row">
            {availableCoursesData.map(course => (
              <div key={course.id} className="col-md-6 col-lg-4 mb-4">
                <CourseCard 
                  course={course} 
                  onEnroll={handleEnroll}
                  isEnrolled={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="display-1 mb-3">🔍</div>
            <h4>No se encontraron cursos</h4>
            <p className="text-muted">Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="row">
        <div className="col-12">
          <div className="card bg-light text-center">
            <div className="card-body p-4">
              <h4>¿No encuentras lo que buscas?</h4>
              <p className="text-muted mb-3">
                Contáctanos para sugerir nuevos cursos o temas de tu interés
              </p>
              <button className="btn btn-studymate">
                Solicitar Curso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonsPage
