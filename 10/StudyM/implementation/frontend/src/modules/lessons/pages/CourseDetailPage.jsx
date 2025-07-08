import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { lessonsAPI } from '../../../shared/services/lessonsService'
import { useNotifications } from '../../../shared/context/NotificationContext'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import LessonCard from '../components/LessonCard'

function CourseDetailPage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  
  const { showSuccess, showError } = useNotifications()

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      // Simulated data - in real app, use API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCourse = {
        id: parseInt(courseId),
        title: 'Introducción a React',
        description: 'Aprende los fundamentos de React desde cero con este curso completo',
        longDescription: 'Este curso te llevará desde los conceptos básicos de React hasta la creación de aplicaciones completas. Aprenderás sobre componentes, hooks, estado, props, routing y mucho más.',
        instructor: 'Juan Pérez',
        duration: '6 horas',
        level: 'Principiante',
        icon: '⚛️',
        progress: 75,
        lessonsCount: 12,
        studentsCount: 1250,
        rating: 4.8
      }

      const mockLessons = [
        {
          id: 1,
          title: 'Introducción a React',
          description: 'Qué es React y por qué usarlo',
          duration: '20 min',
          difficulty: 'Principiante',
          isCompleted: true,
          progress: 100
        },
        {
          id: 2,
          title: 'JSX y Componentes',
          description: 'Sintaxis JSX y creación de componentes',
          duration: '30 min',
          difficulty: 'Principiante',
          isCompleted: true,
          progress: 100
        },
        {
          id: 3,
          title: 'Props y Estado',
          description: 'Manejo de props y estado en React',
          duration: '25 min',
          difficulty: 'Principiante',
          isCompleted: true,
          progress: 100
        },
        {
          id: 4,
          title: 'Eventos y Formularios',
          description: 'Manejo de eventos y formularios en React',
          duration: '35 min',
          difficulty: 'Intermedio',
          isCompleted: false,
          progress: 60
        },
        {
          id: 5,
          title: 'Hooks Básicos',
          description: 'useState y useEffect',
          duration: '40 min',
          difficulty: 'Intermedio',
          isCompleted: false,
          progress: 0,
          isLocked: true
        }
      ]
      
      setCourse(mockCourse)
      setLessons(mockLessons)
      setIsEnrolled(true) // Simular que está inscrito
    } catch (error) {
      showError('Error al cargar el curso')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      // await lessonsAPI.enrollInCourse(courseId)
      setIsEnrolled(true)
      showSuccess('Te has inscrito exitosamente al curso')
    } catch (error) {
      showError('Error al inscribirse al curso')
    }
  }

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner text="Cargando curso..." />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Curso no encontrado</h4>
          <p>El curso que buscas no existe o no está disponible.</p>
          <Link to="/lessons" className="btn btn-primary">
            Volver a Lecciones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/lessons">Lecciones</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {course.title}
          </li>
        </ol>
      </nav>

      {/* Course Header */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <span className="display-4">{course.icon}</span>
            </div>
            <div>
              <h1 className="mb-1">{course.title}</h1>
              <p className="text-muted mb-0">Por {course.instructor}</p>
            </div>
          </div>
          
          <p className="lead">{course.description}</p>
          <p>{course.longDescription}</p>

          <div className="d-flex flex-wrap gap-4 mb-3">
            <div className="d-flex align-items-center">
              <i className="fas fa-clock text-muted me-2"></i>
              <span>{course.duration}</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-signal text-muted me-2"></i>
              <span>{course.level}</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-users text-muted me-2"></i>
              <span>{course.studentsCount} estudiantes</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-star text-warning me-2"></i>
              <span>{course.rating} ({course.studentsCount} reseñas)</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body text-center">
              {isEnrolled ? (
                <>
                  <h5 className="text-success mb-3">
                    <i className="fas fa-check-circle"></i> Inscrito
                  </h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm mb-1">
                      <span>Progreso del curso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress progress-studymate">
                      <div 
                        className="progress-bar progress-bar-studymate" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="btn btn-studymate w-100 mb-2">
                    Continuar Aprendiendo
                  </button>
                </>
              ) : (
                <>
                  <h5 className="mb-3">¿Listo para empezar?</h5>
                  <button 
                    className="btn btn-studymate w-100 mb-2"
                    onClick={handleEnroll}
                  >
                    Inscribirse Gratis
                  </button>
                </>
              )}
              <small className="text-muted">
                {course.lessonsCount} lecciones incluidas
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Contenido del Curso
              </h5>
            </div>
            <div className="card-body p-0">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="border-bottom last:border-bottom-0">
                  <div className="p-3">
                    <LessonCard
                      lesson={lesson}
                      courseId={courseId}
                      isCompleted={lesson.isCompleted}
                      isLocked={lesson.isLocked && !isEnrolled}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Lo que aprenderás</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Fundamentos de React
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Componentes y JSX
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Estado y Props
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Hooks principales
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Manejo de eventos
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Proyecto práctico
                </li>
              </ul>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Requisitos</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-dot-circle text-muted me-2"></i>
                  Conocimientos básicos de HTML
                </li>
                <li className="mb-2">
                  <i className="fas fa-dot-circle text-muted me-2"></i>
                  Conocimientos básicos de CSS
                </li>
                <li className="mb-2">
                  <i className="fas fa-dot-circle text-muted me-2"></i>
                  Fundamentos de JavaScript
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
