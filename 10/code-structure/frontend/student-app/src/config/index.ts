// Configuración de variables de entorno
export const config = {
  // URLs de API
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api',
  
  // Servicios backend
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001/api/auth',
    lessons: process.env.LESSON_SERVICE_URL || 'http://localhost:3001/api/lessons',
    gamification: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3001/api/gamification',
    community: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3001/api/community',
    premium: process.env.PREMIUM_SERVICE_URL || 'http://localhost:3001/api/premium',
  },

  // Configuración para cumplir escenarios de rendimiento
  performance: {
    // ESC-06: 1000 usuarios simultáneos
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutos
    
    // ESC-09: Navegación ≤ 2 seg
    enablePreloading: true,
    
    // ESC-21: Recomendaciones ≤ 500ms
    recommendationsCacheTimeout: 30000, // 30 segundos
  },

  // Configuración de autenticación
  auth: {
    sessionTimeout: 3600000, // 1 hora
    refreshTokenExpiry: 604800000, // 7 días
  },
};

export default config;
