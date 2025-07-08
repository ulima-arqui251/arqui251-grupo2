import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'
import Icon from '../../../shared/components/Icon'

function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    courses: 0,
    completedLessons: 0,
    points: 0,
    achievements: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      try {
        // In a real app, you would fetch these from the API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          courses: 5,
          completedLessons: 23,
          points: 1250,
          achievements: 8
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner text="Cargando dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body p-4">
              <h1 className="mb-2">
                ¡Bienvenido de vuelta, {user?.firstName || 'Estudiante'}! 👋
              </h1>
              <p className="mb-0 opacity-75">
                Continúa tu viaje de aprendizaje donde lo dejaste
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <div className="mb-2">
                <Icon name="books" size={64} color="#007bff" />
              </div>
              <h3 className="card-title">{stats.courses}</h3>
              <p className="card-text text-muted">Cursos Activos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <div className="mb-2">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="card-title">{stats.completedLessons}</h3>
              <p className="card-text text-muted">Lecciones Completadas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <div className="mb-2">
                <Icon name="star" size={64} color="#ffc107" />
              </div>
              <h3 className="card-title">{stats.points}</h3>
              <p className="card-text text-muted">Puntos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <div className="mb-2">
                <Icon name="trophy" size={64} color="#17a2b8" />
              </div>
              <h3 className="card-title">{stats.achievements}</h3>
              <p className="card-text text-muted">Logros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Continuar Aprendiendo</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/lessons" className="btn btn-primary">
                  Ver Todas las Lecciones
                </Link>
                <Link to="/community" className="btn btn-outline-primary">
                  Explorar Comunidad
                </Link>
                {user?.role === 'teacher' && (
                  <Link to="/teacher" className="btn btn-success">
                    Panel Docente
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Progreso Semanal</h5>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="mb-3">
                  <div className="display-6">75%</div>
                  <small className="text-muted">Meta semanal</small>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '75%' }}
                    aria-valuenow="75" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Actividad Reciente</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Completaste "Introducción a React"</h6>
                    <small className="text-muted">Hace 2 horas</small>
                  </div>
                  <span className="badge bg-success rounded-pill">+50 puntos</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Nuevo logro desbloqueado</h6>
                    <small className="text-muted">Hace 1 día</small>
                  </div>
                  <span className="badge bg-warning rounded-pill">🏆 Estudiante Dedicado</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Te uniste al grupo "JavaScript Avanzado"</h6>
                    <small className="text-muted">Hace 2 días</small>
                  </div>
                  <span className="badge bg-info rounded-pill">Grupo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
