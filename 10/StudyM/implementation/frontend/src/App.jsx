import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { NotificationProvider } from './shared/context/NotificationContext'
import ProtectedRoute from './shared/components/ProtectedRoute'
import Navbar from './shared/components/Navbar'
import Footer from './shared/components/Footer'
import NotificationContainer from './shared/components/NotificationContainer'

// Pages
import Home from './modules/home/pages/HomePage'
import Login from './modules/auth/pages/LoginPage'
import Register from './modules/auth/pages/RegisterPage'
import Dashboard from './modules/dashboard/pages/DashboardPage'
import Lessons from './modules/lessons/pages/LessonsPage'
import LessonDetail from './modules/lessons/pages/LessonDetailPage'
import CourseDetail from './modules/lessons/pages/CourseDetailPage'
import Community from './modules/community/pages/CommunityPage'
import Gamification from './modules/gamification/pages/GamificationPage'
import Profile from './modules/profile/pages/ProfilePage'
import TeacherDashboard from './modules/teacher/pages/TeacherDashboardPage'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/lessons" 
                  element={
                    <ProtectedRoute>
                      <Lessons />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/lessons/:id" 
                  element={
                    <ProtectedRoute>
                      <LessonDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/courses/:id" 
                  element={
                    <ProtectedRoute>
                      <CourseDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community" 
                  element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/gamification" 
                  element={
                    <ProtectedRoute>
                      <Gamification />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <NotificationContainer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
