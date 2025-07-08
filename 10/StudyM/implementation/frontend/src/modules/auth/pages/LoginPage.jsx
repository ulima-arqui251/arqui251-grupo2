import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { useNotifications } from '../../../shared/context/NotificationContext'
import LoadingSpinner from '../../../shared/components/LoadingSpinner'

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const { login, isAuthenticated } = useAuth()
  const { showError, showSuccess } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(formData)
      
      if (result.success) {
        showSuccess('¡Bienvenido de vuelta!')
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      } else {
        // Check if it's a 2FA requirement
        if (result.error && result.error.includes('2FA')) {
          setShow2FA(true)
          setTempToken(result.tempToken)
          showError('Se requiere código de verificación 2FA')
        } else {
          showError(result.error || 'Error al iniciar sesión')
        }
      }
    } catch (error) {
      showError('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would call the 2FA verification endpoint
      // For now, we'll just show an error since it's not fully implemented
      showError('Verificación 2FA no implementada completamente')
    } catch (error) {
      showError('Error al verificar código 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  if (show2FA) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Verificación 2FA</h2>
                  <p className="text-muted">
                    Ingresa el código de tu aplicación de autenticación
                  </p>
                </div>

                <form onSubmit={handle2FASubmit}>
                  <div className="mb-4">
                    <label htmlFor="twoFactorCode" className="form-label">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center"
                      id="twoFactorCode"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Verificar'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShow2FA(false)}
                  >
                    Volver
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h1 className="fw-bold text-primary">StudyMate</h1>
                <h2 className="h4 text-muted">Iniciar Sesión</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Tu contraseña"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Iniciar Sesión'}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-decoration-none">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
