// Configuración para detectar y manejar la conexión con el backend
import api from './api'

class ApiManager {
  constructor() {
    this.isBackendAvailable = null
    this.checkingBackend = false
  }

  async checkBackendConnection() {
    if (this.checkingBackend) {
      return this.isBackendAvailable
    }

    this.checkingBackend = true

    try {
      // Intentar hacer una llamada simple al backend
      const response = await api.get('/health', { timeout: 3000 })
      this.isBackendAvailable = response.status === 200
      console.log('✅ Backend disponible - Conectando con API real')
    } catch (error) {
      this.isBackendAvailable = false
      console.log('⚠️ Backend no disponible - Usando datos mock')
    }

    this.checkingBackend = false
    return this.isBackendAvailable
  }

  async executeRequest(apiCall, mockData) {
    // Verificar disponibilidad del backend si no se ha hecho
    if (this.isBackendAvailable === null) {
      await this.checkBackendConnection()
    }

    // Si el backend está disponible, usar la API real
    if (this.isBackendAvailable) {
      try {
        return await apiCall()
      } catch (error) {
        console.warn('Error en API real, fallback a datos mock:', error.message)
        this.isBackendAvailable = false
        return { data: mockData }
      }
    }

    // Usar datos mock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData })
      }, 500) // Simular delay de red
    })
  }

  // Método para forzar el uso de datos mock (útil para desarrollo)
  forceUseMockData() {
    this.isBackendAvailable = false
    console.log('🔧 Forzando uso de datos mock')
  }

  // Método para reintentar conexión con backend
  async retryBackendConnection() {
    this.isBackendAvailable = null
    return await this.checkBackendConnection()
  }

  // Método request para hacer llamadas a la API
  async request(url, options = {}) {
    const { method = 'GET', data, ...config } = options
    
    try {
      let response
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(url, config)
          break
        case 'post':
          response = await api.post(url, data, config)
          break
        case 'put':
          response = await api.put(url, data, config)
          break
        case 'delete':
          response = await api.delete(url, config)
          break
        default:
          throw new Error(`Método HTTP no soportado: ${method}`)
      }
      
      return response
    } catch (error) {
      console.error(`Error en ${method.toUpperCase()} ${url}:`, error)
      throw error
    }
  }
}

export default new ApiManager()
