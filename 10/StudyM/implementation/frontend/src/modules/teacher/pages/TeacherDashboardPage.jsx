import React, { useState, useEffect } from 'react'
import { Nav, Tab, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartLine, 
  faBook, 
  faUsers, 
  faClipboardList, 
  faFileAlt,
  faChartBar
} from '@fortawesome/free-solid-svg-icons'

// Components
import DashboardOverview from '../components/DashboardOverview'
import CoursesSection from '../components/CoursesSection'
import StudentsSection from '../components/StudentsSection'
import AssignmentsSection from '../components/AssignmentsSection'
import SubmissionsSection from '../components/SubmissionsSection'
import AnalyticsSection from '../components/AnalyticsSection'

function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Container fluid className="mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Panel Docente</h1>
              <p className="text-muted mb-0">Gestiona tus cursos, estudiantes y evaluaciones</p>
            </div>
            <div className="text-muted">
              <small>Último acceso: {new Date().toLocaleDateString()}</small>
            </div>
          </div>

          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="pills" className="mb-4 flex-wrap">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  Dashboard
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="courses" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBook} className="me-2" />
                  Cursos
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="students" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Estudiantes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assignments" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                  Tareas
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="submissions" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Entregas
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="analytics" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartBar} className="me-2" />
                  Análisis
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <DashboardOverview />
              </Tab.Pane>
              <Tab.Pane eventKey="courses">
                <CoursesSection />
              </Tab.Pane>
              <Tab.Pane eventKey="students">
                <StudentsSection />
              </Tab.Pane>
              <Tab.Pane eventKey="assignments">
                <AssignmentsSection />
              </Tab.Pane>
              <Tab.Pane eventKey="submissions">
                <SubmissionsSection />
              </Tab.Pane>
              <Tab.Pane eventKey="analytics">
                <AnalyticsSection />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </Container>
  )
}

export default TeacherDashboardPage
