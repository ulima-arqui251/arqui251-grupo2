import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Button, Badge, Form, Modal, ProgressBar, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faEnvelope, 
  faCalendarAlt, 
  faChartLine, 
  faEye, 
  faSearch,
  faFilter,
  faDownload,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function StudentsSection() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedCourse !== 'all') {
      loadStudentsByCourse(selectedCourse)
    } else {
      loadAllStudents()
    }
  }, [selectedCourse])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [coursesResponse] = await Promise.all([
        teacherService.getCourses(1, 100)
      ])
      setCourses(coursesResponse.data.courses)
      await loadAllStudents()
    } catch (error) {
      console.error('Error loading initial data:', error)
      addNotification('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadAllStudents = async () => {
    try {
      // En un caso real, necesitaríamos un endpoint para obtener todos los estudiantes
      // Por ahora, simularemos con datos del primer curso
      if (courses.length > 0) {
        const response = await teacherService.getCourseStudents(courses[0].id, 1, 100)
        setStudents(response.data.students)
      }
    } catch (error) {
      console.error('Error loading students:', error)
      addNotification('Error al cargar estudiantes', 'error')
    }
  }

  const loadStudentsByCourse = async (courseId) => {
    try {
      setLoading(true)
      const response = await teacherService.getCourseStudents(courseId, 1, 100)
      setStudents(response.data.students)
    } catch (error) {
      console.error('Error loading course students:', error)
      addNotification('Error al cargar estudiantes del curso', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const getGradeColor = (grade) => {
    if (grade >= 9) return 'success'
    if (grade >= 7) return 'warning'
    return 'danger'
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success'
    if (progress >= 60) return 'warning'
    return 'danger'
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estudiantes...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Gestión de Estudiantes</h4>
          <p className="text-muted mb-0">Supervisa el progreso y rendimiento de tus estudiantes</p>
        </div>
        <Button variant="outline-primary">
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Exportar Lista
        </Button>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por curso</Form.Label>
            <Form.Select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Buscar estudiante</Form.Label>
            <div className="position-relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
              />
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button variant="outline-secondary" className="w-100">
            <FontAwesomeIcon icon={faFilter} />
          </Button>
        </Col>
      </Row>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FontAwesomeIcon icon={faUserGraduate} size="2x" className="mb-3 d-block" />
          <h5>No hay estudiantes disponibles</h5>
          <p>Los estudiantes aparecerán aquí cuando se inscriban en tus cursos.</p>
        </Alert>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Estudiante</th>
                  <th>Email</th>
                  <th>Inscrito</th>
                  <th>Progreso</th>
                  <th>Calificación</th>
                  <th>Última Actividad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                             style={{ width: '40px', height: '40px' }}>
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div>
                          <div className="fw-medium">{student.name}</div>
                          <small className="text-muted">ID: {student.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faEnvelope} className="text-muted me-2" />
                      {student.email}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <ProgressBar 
                          now={student.progress} 
                          className="me-2 flex-grow-1"
                          variant={getProgressColor(student.progress)}
                          style={{ height: '6px' }}
                        />
                        <small className="text-muted">{student.progress}%</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getGradeColor(student.totalGrade)} className="fs-6">
                        {student.totalGrade.toFixed(1)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(student.lastActivity).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Student Detail Modal */}
      <Modal show={showStudentModal} onHide={() => setShowStudentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Perfil del Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div>
              <Row className="mb-4">
                <Col md={3} className="text-center">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                       style={{ width: '80px', height: '80px' }}>
                    <FontAwesomeIcon icon={faUser} size="2x" />
                  </div>
                  <h5>{selectedStudent.name}</h5>
                  <p className="text-muted">{selectedStudent.email}</p>
                </Col>
                <Col md={9}>
                  <Row>
                    <Col sm={6} className="mb-3">
                      <strong>Fecha de inscripción:</strong>
                      <div>{new Date(selectedStudent.enrolledAt).toLocaleDateString()}</div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <strong>Última actividad:</strong>
                      <div>{new Date(selectedStudent.lastActivity).toLocaleDateString()}</div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <strong>Progreso general:</strong>
                      <div>
                        <ProgressBar 
                          now={selectedStudent.progress} 
                          label={`${selectedStudent.progress}%`}
                          variant={getProgressColor(selectedStudent.progress)}
                        />
                      </div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <strong>Calificación promedio:</strong>
                      <div>
                        <Badge bg={getGradeColor(selectedStudent.totalGrade)} className="fs-6">
                          {selectedStudent.totalGrade.toFixed(1)}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <h6>Estadísticas de Rendimiento</h6>
              <Row>
                <Col md={6}>
                  <Card className="bg-light border-0 mb-3">
                    <Card.Body className="text-center">
                      <h4 className="text-success">{selectedStudent.assignmentsCompleted}</h4>
                      <p className="mb-0">Tareas Completadas</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="bg-light border-0 mb-3">
                    <Card.Body className="text-center">
                      <h4 className="text-primary">{selectedStudent.totalAssignments}</h4>
                      <p className="mb-0">Total de Tareas</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStudentModal(false)}>
            Cerrar
          </Button>
          <Button variant="outline-primary">
            Ver Calificaciones
          </Button>
          <Button variant="primary">
            Enviar Mensaje
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default StudentsSection
