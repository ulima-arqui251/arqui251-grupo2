import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Badge, Modal, Form, Alert, Pagination } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faUsers, 
  faBook, 
  faChartLine, 
  faEye, 
  faCalendarAlt,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function CoursesSection() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadCourses()
  }, [currentPage])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getCourses(currentPage, 10)
      setCourses(response.data.courses)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading courses:', error)
      addNotification('Error al cargar cursos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'warning'
      case 'completed':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'draft':
        return 'Borrador'
      case 'completed':
        return 'Completado'
      default:
        return status
    }
  }

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setShowCourseModal(true)
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando cursos...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Mis Cursos</h4>
          <p className="text-muted mb-0">Gestiona y supervisa tus cursos</p>
        </div>
        <Button variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <div className="position-relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
              />
              <Form.Control
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="outline-secondary">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filtros
          </Button>
        </Col>
      </Row>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FontAwesomeIcon icon={faBook} size="2x" className="mb-3 d-block" />
          <h5>No hay cursos disponibles</h5>
          <p>Comienza creando tu primer curso para gestionar estudiantes y contenido.</p>
          <Button variant="primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Crear Primer Curso
          </Button>
        </Alert>
      ) : (
        <>
          <Row>
            {filteredCourses.map((course) => (
              <Col lg={4} md={6} className="mb-4" key={course.id}>
                <Card className="h-100 border-0 shadow-sm course-card">
                  <Card.Img 
                    variant="top" 
                    src={course.image} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={getStatusColor(course.status)} className="mb-2">
                        {getStatusText(course.status)}
                      </Badge>
                      <small className="text-muted">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        {new Date(course.startDate).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text text-muted flex-grow-1">{course.description}</p>
                    
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="border-end">
                          <FontAwesomeIcon icon={faUsers} className="text-primary d-block mb-1" />
                          <small className="text-muted">{course.studentsCount}</small>
                          <div className="small text-muted">Estudiantes</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <FontAwesomeIcon icon={faBook} className="text-success d-block mb-1" />
                          <small className="text-muted">{course.lessonsCount}</small>
                          <div className="small text-muted">Lecciones</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <FontAwesomeIcon icon={faChartLine} className="text-info d-block mb-1" />
                        <small className="text-muted">{course.completionRate}%</small>
                        <div className="small text-muted">Completado</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleViewCourse(course)}
                      className="mt-auto"
                    >
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      Ver Detalles
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Course Detail Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Curso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <Row className="mb-3">
                <Col md={4}>
                  <img 
                    src={selectedCourse.image} 
                    alt={selectedCourse.title}
                    className="img-fluid rounded"
                  />
                </Col>
                <Col md={8}>
                  <h4>{selectedCourse.title}</h4>
                  <p className="text-muted">{selectedCourse.description}</p>
                  <div className="row">
                    <div className="col-sm-6">
                      <strong>Estudiantes:</strong> {selectedCourse.studentsCount}
                    </div>
                    <div className="col-sm-6">
                      <strong>Lecciones:</strong> {selectedCourse.lessonsCount}
                    </div>
                    <div className="col-sm-6">
                      <strong>Progreso:</strong> {selectedCourse.completionRate}%
                    </div>
                    <div className="col-sm-6">
                      <strong>Estado:</strong> 
                      <Badge bg={getStatusColor(selectedCourse.status)} className="ms-2">
                        {getStatusText(selectedCourse.status)}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="row">
                <div className="col-sm-6">
                  <strong>Fecha de inicio:</strong> {new Date(selectedCourse.startDate).toLocaleDateString()}
                </div>
                <div className="col-sm-6">
                  <strong>Fecha de fin:</strong> {new Date(selectedCourse.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary">
            Ver Estudiantes
          </Button>
          <Button variant="outline-primary">
            Editar Curso
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .course-card {
          transition: transform 0.2s ease-in-out;
        }
        .course-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

export default CoursesSection
