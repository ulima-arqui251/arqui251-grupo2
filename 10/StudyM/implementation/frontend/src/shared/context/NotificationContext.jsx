import React, { createContext, useContext, useState, useCallback } from 'react'

// Create context
const NotificationContext = createContext()

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Notification provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  // Add notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random()
    
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    }

    setNotifications(prev => [...prev, notification])

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods for different types
  const showSuccess = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration)
  }, [addNotification])

  const showError = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration)
  }, [addNotification])

  const showWarning = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration)
  }, [addNotification])

  const showInfo = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration)
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  
  return context
}
