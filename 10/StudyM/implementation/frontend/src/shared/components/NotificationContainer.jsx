import React from 'react'
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext'

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  const getBootstrapClass = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'alert-success'
      case NOTIFICATION_TYPES.ERROR:
        return 'alert-danger'
      case NOTIFICATION_TYPES.WARNING:
        return 'alert-warning'
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'alert-info'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅'
      case NOTIFICATION_TYPES.ERROR:
        return '❌'
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️'
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️'
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1050, marginTop: '80px' }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`alert ${getBootstrapClass(notification.type)} alert-dismissible fade show mb-2`}
          role="alert"
          style={{ minWidth: '300px' }}
        >
          <div className="d-flex align-items-center">
            <span className="me-2">{getIcon(notification.type)}</span>
            <div className="flex-grow-1">
              {notification.message}
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => removeNotification(notification.id)}
            ></button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
