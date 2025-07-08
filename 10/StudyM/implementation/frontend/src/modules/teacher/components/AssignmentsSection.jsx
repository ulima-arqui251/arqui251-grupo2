import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Pagination } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faCalendarAlt, 
  faUsers, 
  faChartLine, 
  faEdit, 
  faTrash, 
  faEye,
  faSearch,
  faFilter,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons'
import teacherService from '../../../shared/services/teacherService'
import { useNotifications } from '../../../shared/context/NotificationContext'

function AssignmentsSection() {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxGrade: 10,
    instructions: ''
  })
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [currentPage, selectedCourse, selectedStatus])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const coursesResponse = await teacherService.getCourses(1, 100)
      setCourses(coursesResponse.data.courses)
      await loadAssignments()
    } catch (error) {
      console.error('Error loading initial data:', error)
      addNotification('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getAssignments(
        currentPage, 
        10, 
        selectedCourse || null, 
        selectedStatus || null
      )
      setAssignments(response.data.assignments)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading assignments:', error)
      addNotification('Error al cargar tareas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      await teacherService.createAssignment(formData)
      addNotification('Tarea creada exitosamente', 'success')
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxGrade: 10,
        instructions: ''
      })
      loadAssignments()
    } catch (error) {
      console.error('Error creating assignment:', error)
      addNotification('Error al crear la tarea', 'error')
    }
  }

  const handleEditAssignment = async (e) => {
    e.preventDefault()
    try {
      await teacherService.updateAssignment(editingAssignment.id, formData)
      addNotification('Tarea actualizada exitosamente', 'success')
      setEditingAssignment(null)
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxGrade: 10,
        instructions: ''
      })
      loadAssignments()
    } catch (error) {
      console.error('Error updating assignment:', error)
      addNotification('Error al actualizar la tarea', 'error')
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await teacherService.deleteAssignment(assignmentId)
        addNotification('Tarea eliminada exitosamente', 'success')
        loadAssignments()
      } catch (error) {
        console.error('Error deleting assignment:', error)
        addNotification('Error al eliminar la tarea', 'error')
      }
    }
  }

  const openCreateModal = () => {
    setEditingAssignment(null)
    setFormData({
      title: '',
      description: '',
      courseId: '',
      dueDate: '',
      maxGrade: 10,
      instructions: ''
    })
    setShowCreateModal(true)
  }

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate,
      maxGrade: assignment.maxGrade,
      instructions: assignment.instructions || ''
    })
    setShowCreateModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'warning'
      case 'closed':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activa'
      case 'draft':
        return 'Borrador'
      case 'closed':
        return 'Cerrada'
      default:
        return status
    }
  }

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando tareas...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Gestión de Tareas</h4>
          <p className="text-muted mb-0">Crea y gestiona las tareas de tus cursos</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <div className="position-relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
              />
              <Form.Control
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Curso</Form.Label>
            <Form.Select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="draft">Borrador</option>
              <option value="closed">Cerrada</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="outline-secondary" className="w-100">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Más Filtros
          </Button>
        </Col>
      </Row>

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FontAwesomeIcon icon={faClipboardList} size="2x" className="mb-3 d-block" />
          <h5>No hay tareas disponibles</h5>
          <p>Crea tu primera tarea para comenzar a evaluar a tus estudiantes.</p>
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Crear Primera Tarea
          </Button>
        </Alert>
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Tarea</th>
                    <th>Curso</th>
                    <th>Fecha Límite</th>
                    <th>Estado</th>
                    <th>Entregas</th>
                    <th>Promedio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        <div>
                          <div className="fw-medium">{assignment.title}</div>
                          <small className="text-muted">{assignment.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {assignment.courseName}
                        </span>
                      </td>
                      <td>
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge bg={getStatusColor(assignment.status)}>
                          {getStatusText(assignment.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
                          <span>{assignment.submissionsCount}/{assignment.totalStudents}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faChartLine} className="text-muted me-2" />
                          <span>{assignment.averageGrade.toFixed(1)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            title="Ver detalles"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => openEditModal(assignment)}
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            title="Eliminar"
                          >
                            <FontAwesomeIcon icon={faTrash} />
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

      {/* Create/Edit Assignment Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAssignment ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={editingAssignment ? handleEditAssignment : handleCreateAssignment}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Título de la tarea</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Calificación máxima</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.maxGrade}
                    onChange={(e) => setFormData({ ...formData, maxGrade: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Curso</Form.Label>
                  <Form.Select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar curso</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha límite</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instrucciones detalladas</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Proporciona instrucciones detalladas para la tarea..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingAssignment ? 'Actualizar Tarea' : 'Crear Tarea'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default AssignmentsSection
