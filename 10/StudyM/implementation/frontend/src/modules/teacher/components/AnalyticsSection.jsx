import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Alert, ProgressBar, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartLine, 
  faClock, 
  faUsers, 
  faStar, 
  faBook,
  faChartBar,
  faTrophy,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function AnalyticsSection() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getAnalyticsOverview()
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      addNotification('Error al cargar datos de análisis', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando análisis...</span>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Alert variant="warning">
        <FontAwesomeIcon icon={faChartBar} className="me-2" />
        No se pudieron cargar los datos de análisis
      </Alert>
    )
  }

  const chartData = analyticsData.trendsData
  const maxEngagement = Math.max(...chartData.engagement)
  const maxPerformance = Math.max(...chartData.performance)
  const maxSubmissions = Math.max(...chartData.submissions)

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h4 className="mb-0">Análisis y Métricas</h4>
        <p className="text-muted mb-0">Visualiza el rendimiento y las tendencias de tu actividad docente</p>
      </div>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faClock} size="2x" className="text-primary" />
              </div>
              <h3 className="mb-1">{analyticsData.totalHours}</h3>
              <p className="text-muted mb-0">Horas Totales</p>
              <small className="text-success">
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                +12% este mes
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-success" />
              </div>
              <h3 className="mb-1">{analyticsData.studentsReached}</h3>
              <p className="text-muted mb-0">Estudiantes Alcanzados</p>
              <small className="text-success">
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                +8% este mes
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faBook} size="2x" className="text-info" />
              </div>
              <h3 className="mb-1">{analyticsData.coursesActive}</h3>
              <p className="text-muted mb-0">Cursos Activos</p>
              <small className="text-info">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                Estable
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="mb-3">
                <FontAwesomeIcon icon={faStar} size="2x" className="text-warning" />
              </div>
              <h3 className="mb-1">{analyticsData.satisfactionRate}</h3>
              <p className="text-muted mb-0">Satisfacción</p>
              <small className="text-success">
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                +0.3 este mes
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Trends Chart */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Tendencias Semanales
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={4}>
                  <h6 className="text-primary">Participación (%)</h6>
                  <div className="d-flex align-items-center mb-2">
                    {chartData.engagement.map((value, index) => (
                      <div key={index} className="me-2 d-flex flex-column align-items-center">
                        <div 
                          className="bg-primary rounded"
                          style={{ 
                            width: '20px', 
                            height: `${(value / maxEngagement) * 100}px`,
                            minHeight: '5px'
                          }}
                        ></div>
                        <small className="text-muted mt-1">{value}%</small>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={4}>
                  <h6 className="text-success">Rendimiento</h6>
                  <div className="d-flex align-items-center mb-2">
                    {chartData.performance.map((value, index) => (
                      <div key={index} className="me-2 d-flex flex-column align-items-center">
                        <div 
                          className="bg-success rounded"
                          style={{ 
                            width: '20px', 
                            height: `${(value / maxPerformance) * 80}px`,
                            minHeight: '5px'
                          }}
                        ></div>
                        <small className="text-muted mt-1">{value}</small>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={4}>
                  <h6 className="text-info">Entregas</h6>
                  <div className="d-flex align-items-center mb-2">
                    {chartData.submissions.map((value, index) => (
                      <div key={index} className="me-2 d-flex flex-column align-items-center">
                        <div 
                          className="bg-info rounded"
                          style={{ 
                            width: '20px', 
                            height: `${(value / maxSubmissions) * 60}px`,
                            minHeight: '5px'
                          }}
                        ></div>
                        <small className="text-muted mt-1">{value}</small>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
              <div className="d-flex justify-content-between text-muted small">
                <span>Hace 6 semanas</span>
                <span>Hace 3 semanas</span>
                <span>Esta semana</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Overview */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faTrophy} className="me-2" />
                Cursos Destacados
              </h5>
            </Card.Header>
            <Card.Body>
              {analyticsData.topPerformingCourses.map((course, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-medium">{course.name}</span>
                    <Badge bg="success">{course.score}</Badge>
                  </div>
                  <ProgressBar 
                    now={(course.score / 10) * 100} 
                    variant="success"
                    style={{ height: '6px' }}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Analytics Cards */}
      <Row>
        <Col md={3} className="mb-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <CircularProgressbar
                  value={85}
                  text="85%"
                  styles={buildStyles({
                    textColor: '#28a745',
                    pathColor: '#28a745',
                    trailColor: '#e9ecef'
                  })}
                />
              </div>
              <h6 className="mb-0">Tasa de Finalización</h6>
              <small className="text-muted">De cursos activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <CircularProgressbar
                  value={92}
                  text="92%"
                  styles={buildStyles({
                    textColor: '#007bff',
                    pathColor: '#007bff',
                    trailColor: '#e9ecef'
                  })}
                />
              </div>
              <h6 className="mb-0">Participación</h6>
              <small className="text-muted">Estudiantes activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <CircularProgressbar
                  value={78}
                  text="78%"
                  styles={buildStyles({
                    textColor: '#ffc107',
                    pathColor: '#ffc107',
                    trailColor: '#e9ecef'
                  })}
                />
              </div>
              <h6 className="mb-0">Entregas a Tiempo</h6>
              <small className="text-muted">Puntualidad</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <CircularProgressbar
                  value={96}
                  text="96%"
                  styles={buildStyles({
                    textColor: '#17a2b8',
                    pathColor: '#17a2b8',
                    trailColor: '#e9ecef'
                  })}
                />
              </div>
              <h6 className="mb-0">Calidad de Contenido</h6>
              <small className="text-muted">Evaluación promedio</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Resumen del Mes</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-6 border-end">
                  <h4 className="text-primary">24</h4>
                  <p className="text-muted mb-0">Tareas Creadas</p>
                </div>
                <div className="col-6">
                  <h4 className="text-success">156</h4>
                  <p className="text-muted mb-0">Entregas Calificadas</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Tiempo de Respuesta</h6>
            </Card.Header>
            <Card.Body>
              <div className="row text-center">
                <div className="col-6 border-end">
                  <h4 className="text-info">2.3</h4>
                  <p className="text-muted mb-0">Días Promedio</p>
                </div>
                <div className="col-6">
                  <h4 className="text-warning">4.8</h4>
                  <p className="text-muted mb-0">Satisfacción</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AnalyticsSection
