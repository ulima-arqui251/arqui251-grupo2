import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          📚 StudyMate
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/lessons' ? 'active' : ''}`} 
                    to="/lessons"
                  >
                    Lecciones
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`} 
                    to="/community"
                  >
                    Comunidad
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/gamification' ? 'active' : ''}`} 
                    to="/gamification"
                  >
                    <i className="fas fa-trophy me-1"></i>
                    Ranking
                  </Link>
                </li>
                {user?.role === 'teacher' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/teacher' ? 'active' : ''}`} 
                      to="/teacher"
                    >
                      Panel Docente
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👤 {user?.firstName || user?.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Mi Perfil
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} 
                    to="/login"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`btn btn-outline-light ms-2 ${location.pathname === '/register' ? 'active' : ''}`} 
                    to="/register"
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
