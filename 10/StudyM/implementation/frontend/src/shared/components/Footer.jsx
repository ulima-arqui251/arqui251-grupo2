import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light mt-5">
      <div className="container py-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold d-flex align-items-center">
              <Icon name="books" size={20} color="#ffffff" className="me-2" />
              StudyMate
            </h5>
            <p className="text-muted">
              Plataforma de aprendizaje que hace que estudiar sea divertido y efectivo.
            </p>
          </div>
          
          <div className="col-md-2 mb-3">
            <h6>Enlaces</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light text-decoration-none">Inicio</Link></li>
              <li><Link to="/lessons" className="text-light text-decoration-none">Lecciones</Link></li>
              <li><Link to="/community" className="text-light text-decoration-none">Comunidad</Link></li>
            </ul>
          </div>
          
          <div className="col-md-2 mb-3">
            <h6>Soporte</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Ayuda</a></li>
              <li><a href="#" className="text-light text-decoration-none">Contacto</a></li>
              <li><a href="#" className="text-light text-decoration-none">FAQ</a></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-3">
            <h6>Síguenos</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 text-muted">
              &copy; {currentYear} StudyMate. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="#" className="text-light text-decoration-none me-3">Términos</a>
            <a href="#" className="text-light text-decoration-none">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
