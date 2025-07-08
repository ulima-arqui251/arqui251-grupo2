import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Pagination } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFileAlt, 
  faUser, 
  faCalendarAlt, 
  faDownload, 
  faEdit, 
  faCheck, 
  faEye,
  faSearch,
  faFilter,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function SubmissionsSection() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  })
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadSubmissions()
  }, [currentPage, selectedStatus])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getSubmissions(currentPage, 10, selectedStatus)
      setSubmissions(response.data.submissions)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading submissions:', error)
      addNotification('Error al cargar entregas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    try {
      await teacherService.gradeSubmission(
        selectedSubmission.id,
        parseFloat(gradeData.grade),
        gradeData.feedback
      )
      addNotification('Entrega calificada exitosamente', 'success')
      setShowGradeModal(false)
      setSelectedSubmission(null)
      setGradeData({ grade: '', feedback: '' })
      loadSubmissions()
    } catch (error) {
      console.error('Error grading submission:', error)
      addNotification('Error al calificar la entrega', 'error')
    }
  }

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission)
    setGradeData({
      grade: submission.grade || '',
      feedback: ''
    })
    setShowGradeModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'graded':
        return 'success'
      case 'late':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'graded':
        return 'Calificada'
      case 'late':
        return 'Tardía'
      default:
        return status
    }
  }

  const filteredSubmissions = submissions.filter(submission =>
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando entregas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Gestión de Entregas</h4>
          <p className="text-muted mb-0">Califica y gestiona las entregas de los estudiantes</p>
        </div>
        <div className="d-flex gap-2">
          <Badge bg="warning" className="fs-6">
            {submissions.filter(s => s.status === 'pending').length} Pendientes
          </Badge>
          <Badge bg="success" className="fs-6">
            {submissions.filter(s => s.status === 'graded').length} Calificadas
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <div className="position-relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
              />
              <Form.Control
                type="text"
                placeholder="Buscar entregas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="pending">Pendientes</option>
              <option value="graded">Calificadas</option>
              <option value="late">Tardías</option>
              <option value="">Todas</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Ordenar por</Form.Label>
            <Form.Select>
              <option value="date">Fecha de entrega</option>
              <option value="student">Nombre del estudiante</option>
              <option value="assignment">Tarea</option>
              <option value="course">Curso</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button variant="outline-secondary" className="w-100">
            <FontAwesomeIcon icon={faFilter} />
          </Button>
        </Col>
      </Row>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FontAwesomeIcon icon={faFileAlt} size="2x" className="mb-3 d-block" />
          <h5>No hay entregas disponibles</h5>
          <p>Las entregas de los estudiantes aparecerán aquí para que puedas calificarlas.</p>
        </Alert>
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Estudiante</th>
                    <th>Tarea</th>
                    <th>Curso</th>
                    <th>Entregado</th>
                    <th>Estado</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                               style={{ width: '32px', height: '32px' }}>
                            <FontAwesomeIcon icon={faUser} size="sm" />
                          </div>
                          <div>
                            <div className="fw-medium">{submission.studentName}</div>
                            <small className="text-muted">{submission.studentEmail}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{submission.assignmentTitle}</div>
                          {submission.attachments && submission.attachments.length > 0 && (
                            <small className="text-muted">
                              <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                              {submission.attachments.length} archivo(s)
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {submission.courseName}
                        </span>
                      </td>
                      <td>
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                        <small>
                          {new Date(submission.submittedAt).toLocaleDateString()}
                          <div className="text-muted">
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </div>
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(submission.status)}>
                          {getStatusText(submission.status)}
                        </Badge>
                      </td>
                      <td>
                        {submission.grade ? (
                          <div className="text-center">
                            <div className="fw-bold text-success">{submission.grade}</div>
                            <small className="text-muted">/ 10</small>
                          </div>
                        ) : (
                          <span className="text-muted">Sin calificar</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            title="Ver entrega"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          {submission.attachments && submission.attachments.length > 0 && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              title="Descargar archivos"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </Button>
                          )}
                          <Button 
                            variant={submission.status === 'graded' ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => openGradeModal(submission)}
                            title={submission.status === 'graded' ? 'Editar calificación' : 'Calificar'}
                          >
                            <FontAwesomeIcon icon={submission.status === 'graded' ? faEdit : faCheck} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

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

      {/* Grade Submission Modal */}
      <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedSubmission?.status === 'graded' ? 'Editar Calificación' : 'Calificar Entrega'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGradeSubmission}>
          <Modal.Body>
            {selectedSubmission && (
              <div>
                {/* Submission Info */}
                <Card className="bg-light border-0 mb-4">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Información de la Entrega</h6>
                        <p><strong>Estudiante:</strong> {selectedSubmission.studentName}</p>
                        <p><strong>Tarea:</strong> {selectedSubmission.assignmentTitle}</p>
                        <p><strong>Curso:</strong> {selectedSubmission.courseName}</p>
                      </Col>
                      <Col md={6}>
                        <h6>Detalles de Entrega</h6>
                        <p><strong>Entregado:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                        <p><strong>Estado:</strong> 
                          <Badge bg={getStatusColor(selectedSubmission.status)} className="ms-2">
                            {getStatusText(selectedSubmission.status)}
                          </Badge>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Submission Content */}
                <div className="mb-4">
                  <h6>Contenido de la Entrega</h6>
                  <Card className="border">
                    <Card.Body>
                      <p>{selectedSubmission.submissionText}</p>
                      {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                        <div>
                          <h6 className="mt-3">Archivos Adjuntos:</h6>
                          {selectedSubmission.attachments.map((file, index) => (
                            <div key={index} className="d-flex align-items-center mb-2">
                              <FontAwesomeIcon icon={faFileAlt} className="text-muted me-2" />
                              <span>{file}</span>
                              <Button variant="outline-primary" size="sm" className="ms-auto">
                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                Descargar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>

                {/* Grading Form */}
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Calificación</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        required
                      />
                      <Form.Text className="text-muted">Escala de 0 a 10</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={9}>
                    <Form.Group className="mb-3">
                      <Form.Label>Retroalimentación</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        placeholder="Proporciona comentarios constructivos sobre la entrega..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              {selectedSubmission?.status === 'graded' ? 'Actualizar Calificación' : 'Calificar y Enviar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default SubmissionsSection
