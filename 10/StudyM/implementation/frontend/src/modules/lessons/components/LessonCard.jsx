import React from 'react'
import { Link } from 'react-router-dom'

function LessonCard({ lesson, courseId, isCompleted = false, isLocked = false }) {
  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault()
    }
  }

  return (
    <div className={`card mb-3 ${isLocked ? 'opacity-50' : ''}`}>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-auto">
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${
              isCompleted ? 'bg-success' : isLocked ? 'bg-secondary' : 'bg-primary'
            }`} style={{ width: '50px', height: '50px' }}>
              {isCompleted ? (
                <i className="fas fa-check text-white"></i>
              ) : isLocked ? (
                <i className="fas fa-lock text-white"></i>
              ) : (
                <i className="fas fa-play text-white"></i>
              )}
            </div>
          </div>
          
          <div className="col">
            <h6 className="mb-1">{lesson.title}</h6>
            <p className="text-muted mb-1">{lesson.description}</p>
            <div className="d-flex gap-3">
              <small className="text-muted">
                <i className="fas fa-clock"></i> {lesson.duration || '15 min'}
              </small>
              <small className="text-muted">
                <i className="fas fa-star"></i> {lesson.difficulty || 'Principiante'}
              </small>
            </div>
          </div>
          
          <div className="col-auto">
            {!isLocked && (
              <Link 
                to={`/lessons/courses/${courseId}/lessons/${lesson.id}`}
                className="btn btn-studymate"
                onClick={handleClick}
              >
                {isCompleted ? 'Revisar' : 'Comenzar'}
              </Link>
            )}
            {isLocked && (
              <span className="text-muted">Bloqueado</span>
            )}
          </div>
        </div>
        
        {lesson.progress && lesson.progress > 0 && (
          <div className="mt-3">
            <div className="progress progress-studymate">
              <div 
                className="progress-bar progress-bar-studymate" 
                style={{ width: `${lesson.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonCard
