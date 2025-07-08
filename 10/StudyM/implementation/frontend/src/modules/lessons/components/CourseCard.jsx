import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/components/Icon'

function CourseCard({ course, onEnroll, isEnrolled = false }) {
  const progressPercentage = course.progress || 0

  return (
    <div className="card h-100 card-studymate">
      <div className="card-img-top bg-primary d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                    <Icon name="book" size={64} color="#ffffff" />
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{course.title}</h5>
        <p className="card-text flex-grow-1">{course.description}</p>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between text-sm mb-1">
            <span>Progreso</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress progress-studymate">
            <div 
              className="progress-bar progress-bar-studymate" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted">
            <i className="fas fa-book"></i> {course.lessonsCount || 0} lecciones
          </small>
          <small className="text-muted">
            <i className="fas fa-clock"></i> {course.duration || 'Variable'}
          </small>
        </div>

        <div className="d-flex gap-2">
          {isEnrolled ? (
            <Link to={`/lessons/courses/${course.id}`} className="btn btn-studymate flex-grow-1">
              Continuar
            </Link>
          ) : (
            <button 
              className="btn btn-outline-primary flex-grow-1"
              onClick={() => onEnroll(course.id)}
            >
              Inscribirse
            </button>
          )}
          <Link to={`/lessons/courses/${course.id}`} className="btn btn-outline-secondary">
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
