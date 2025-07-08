import apiManager from './apiManager'

// Auth service
export const authAPI = {
  // Login
  login: (credentials) => {
    return apiManager.request('/auth/login', {
      method: 'POST',
      data: credentials
    })
  },

  // Register
  register: (userData) => {
    return apiManager.request('/auth/register', {
      method: 'POST',
      data: userData
    })
  },

  // Get user profile
  getProfile: () => {
    return apiManager.request('/auth/profile')
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return apiManager.request('/auth/refresh', {
      method: 'POST',
      data: { token: refreshToken }
    })
  },

  // Logout
  logout: () => {
    return apiManager.request('/auth/logout', {
      method: 'POST'
    })
  },

  // Change password
  changePassword: (passwordData) => {
    return apiManager.request('/auth/change-password', {
      method: 'PUT',
      data: passwordData
    })
  },

  // 2FA methods
  generate2FAQr: () => {
    return apiManager.request('/auth/2fa/qr')
  },

  enable2FA: (token) => {
    return apiManager.request('/auth/2fa/enable', {
      method: 'POST',
      data: { token }
    })
  },

  disable2FA: (token) => {
    return apiManager.request('/auth/2fa/disable', {
      method: 'POST',
      data: { token }
    })
  },

  verify2FA: (tempToken, token) => {
    return apiManager.request('/auth/verify-2fa', {
      method: 'POST',
      data: { tempToken, token }
    })
  },

  getBackupCodes: () => {
    return apiManager.request('/auth/2fa/backup-codes')
  },

  regenerateBackupCodes: () => {
    return apiManager.request('/auth/2fa/backup-codes/regenerate', {
      method: 'POST'
    })
  }
}

export default authAPI
