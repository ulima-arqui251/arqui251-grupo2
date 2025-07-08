import React from 'react'

function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border'
  }

  return (
    <div className="text-center">
      <div 
        className={`spinner-border text-primary ${sizeClasses[size]}`} 
        role="status"
        style={{ width: '2rem', height: '2rem' }}
      >
        <span className="visually-hidden">{text}</span>
      </div>
      {text && (
        <div className="mt-2">
          <small className="text-muted">{text}</small>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
