import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'

function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Bienvenido a StudyMate
              </h1>
              <p className="lead mb-4">
                La plataforma de aprendizaje que hace que estudiar sea divertido, 
                interactivo y efectivo. Únete a miles de estudiantes que ya están 
                mejorando sus habilidades.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="btn btn-light btn-lg">
                      Ir al Dashboard
                    </Link>
                    <Link to="/lessons" className="btn btn-outline-light btn-lg">
                      Ver Lecciones
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-light btn-lg">
                      Comenzar Ahora
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">
                      Iniciar Sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="hero-image">
                <div className="bg-light rounded-3 p-5 text-dark">
                  <h2>🎓</h2>
                  <p className="mb-0">Tu compañero de estudios ideal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center mb-5">
              <h2 className="display-5 fw-bold">¿Por qué elegir StudyMate?</h2>
              <p className="lead text-muted">
                Descubre las características que hacen de StudyMate la mejor opción para tu aprendizaje
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="feature-icon mb-3">
                    <span className="display-4">📚</span>
                  </div>
                  <h5 className="card-title">Lecciones Interactivas</h5>
                  <p className="card-text text-muted">
                    Aprende con contenido multimedia, ejercicios prácticos y 
                    seguimiento de progreso en tiempo real.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="feature-icon mb-3">
                    <span className="display-4">🎮</span>
                  </div>
                  <h5 className="card-title">Gamificación</h5>
                  <p className="card-text text-muted">
                    Gana puntos, desbloquea logros y compite con otros estudiantes 
                    en las tablas de clasificación.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="feature-icon mb-3">
                    <span className="display-4">👥</span>
                  </div>
                  <h5 className="card-title">Comunidad</h5>
                  <p className="card-text text-muted">
                    Conecta con otros estudiantes, participa en grupos de estudio 
                    y comparte conocimientos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats bg-light py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary">10K+</h3>
                <p className="text-muted">Estudiantes Activos</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary">500+</h3>
                <p className="text-muted">Lecciones Disponibles</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary">50+</h3>
                <p className="text-muted">Cursos Completos</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary">95%</h3>
                <p className="text-muted">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta py-5 bg-primary text-white">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">
                ¿Listo para comenzar tu viaje de aprendizaje?
              </h2>
              <p className="lead mb-4">
                Únete a StudyMate hoy y descubre una nueva forma de aprender. 
                Es gratis y puedes empezar inmediatamente.
              </p>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-light btn-lg">
                  Registrarse Gratis
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
