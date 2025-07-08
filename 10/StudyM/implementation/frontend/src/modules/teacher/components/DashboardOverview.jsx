import React, { useState, useEffect } from 'react'
import { Row, Col, Card, ProgressBar, Badge, ListGroup, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBook, 
  faUsers, 
  faClipboardList, 
  faChartLine,
  faFileAlt,
  faClock,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      addNotification('Error al cargar datos del dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <Alert variant="warning">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        No se pudieron cargar los datos del dashboard
      </Alert>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission':
        return faFileAlt
      case 'grade':
        return faCheck
      default:
        return faClock
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'submission':
        return 'warning'
      case 'grade':
        return 'success'
      default:
        return 'info'
    }
  }

  return (
    <div>
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faBook} size="2x" className="text-primary" />
              </div>
              <h3 className="mb-0">{dashboardData.totalCourses}</h3>
              <p className="text-muted mb-0">Cursos Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-success" />
              </div>
              <h3 className="mb-0">{dashboardData.totalStudents}</h3>
              <p className="text-muted mb-0">Estudiantes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faClipboardList} size="2x" className="text-info" />
              </div>
              <h3 className="mb-0">{dashboardData.totalAssignments}</h3>
              <p className="text-muted mb-0">Tareas Creadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faFileAlt} size="2x" className="text-warning" />
              </div>
              <h3 className="mb-0">{dashboardData.pendingSubmissions}</h3>
              <p className="text-muted mb-0">Entregas Pendientes</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Courses Progress */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Progreso de Cursos
              </h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.coursesStats.map((course) => (
                <div key={course.id} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-medium">{course.name}</span>
                    <small className="text-muted">{course.students} estudiantes</small>
                  </div>
                  <ProgressBar 
                    now={course.progress} 
                    label={`${course.progress}%`}
                    variant={course.progress > 80 ? 'success' : course.progress > 60 ? 'warning' : 'danger'}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Actividad Reciente
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {dashboardData.recentActivity.map((activity, index) => (
                  <ListGroup.Item key={index} className="border-0 py-3">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <Badge 
                          bg={getActivityColor(activity.type)} 
                          className="rounded-circle p-2"
                        >
                          <FontAwesomeIcon icon={getActivityIcon(activity.type)} />
                        </Badge>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{activity.studentName}</div>
                        <div className="text-muted small">{activity.assignmentName}</div>
                        {activity.grade && (
                          <div className="text-success small">
                            Calificación: {activity.grade}
                          </div>
                        )}
                        <div className="text-muted small">hace {activity.time}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Stats */}
      <Row>
        <Col md={3} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h4 className="text-primary">{dashboardData.monthlyStats.assignmentsCreated}</h4>
              <p className="text-muted mb-0">Tareas Creadas</p>
              <small className="text-muted">Este mes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h4 className="text-success">{dashboardData.monthlyStats.submissionsGraded}</h4>
              <p className="text-muted mb-0">Entregas Calificadas</p>
              <small className="text-muted">Este mes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h4 className="text-info">{dashboardData.monthlyStats.averageResponseTime}</h4>
              <p className="text-muted mb-0">Tiempo Respuesta</p>
              <small className="text-muted">Promedio</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h4 className="text-warning">{dashboardData.monthlyStats.studentSatisfaction}</h4>
              <p className="text-muted mb-0">Satisfacción</p>
              <small className="text-muted">Promedio</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardOverview
