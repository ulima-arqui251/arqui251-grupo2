# StudyMate - Documentación de Integración Frontend-Backend

## Resumen
Este documento describe la integración exitosa entre el frontend (React) y el backend (Express.js) de StudyMate, incluyendo la implementación de un sistema inteligente de fallback entre API real y datos mock.

## Arquitectura de la Integración

### Frontend (React + Vite)
- **Puerto**: 5173
- **URL**: http://localhost:5173
- **Framework**: React 18 con Vite
- **Gestión de Estado**: Context API
- **HTTP Client**: Axios

### Backend (Express.js)
- **Puerto**: 3001  
- **URL**: http://localhost:3001
- **Framework**: Express.js
- **Base de Datos**: SQLite (development) - Preparado para MySQL con Docker
- **ORM**: Sequelize
- **Autenticación**: JWT + 2FA

## Componentes Clave de la Integración

### 1. ApiManager
Ubicación: `frontend/src/shared/services/apiManager.js`

El ApiManager es el componente central que gestiona la conectividad entre frontend y backend:

```javascript
// Detecta automáticamente si el backend está disponible
// Fallback inteligente a datos mock si no hay conectividad
const response = await apiManager.request('/endpoint', options);
```

**Características:**
- ✅ Detección automática de conectividad del backend
- ✅ Fallback transparente a datos mock
- ✅ Reintentos automáticos
- ✅ Manejo de errores robusto
- ✅ Timeout configurable (5 segundos)

### 2. Servicios Refactorizados

#### ✅ lessonsService.js
- Integrado con ApiManager
- Fallback a datos mock para lecciones
- Soporte para progreso de usuario

#### ✅ gamificationService.js
- Integrado con ApiManager
- Datos mock para estadísticas, logros y leaderboard
- Funciones de puntos y ranking

#### ✅ communityService.js
- Integrado con ApiManager
- Gestión de posts y grupos de estudio
- Interacciones sociales (likes, comentarios)

#### ✅ authService.js
- Integrado con ApiManager
- Autenticación completa con JWT
- Soporte para 2FA

#### ✅ teacherService.js
- Integrado con ApiManager
- Panel docente completo
- Gestión de cursos y tareas

## Configuración de Entornos

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=StudyMate
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
DB_TYPE=sqlite
DB_STORAGE=./database.sqlite
```

## Endpoints Principales

### Health Check
- **GET** `/api/health`
- Verifica que el backend esté funcionando
- Usado por ApiManager para detectar conectividad

### Autenticación
- **POST** `/api/auth/login` - Login de usuario
- **POST** `/api/auth/register` - Registro de usuario
- **GET** `/api/auth/profile` - Perfil del usuario
- **POST** `/api/auth/logout` - Logout

### 2FA (Habilitadas)
- **GET** `/api/auth/2fa/qr` - Generar QR para 2FA
- **POST** `/api/auth/2fa/enable` - Habilitar 2FA
- **POST** `/api/auth/2fa/disable` - Deshabilitar 2FA
- **POST** `/api/auth/2fa/verify` - Verificar token 2FA

### Lecciones
- **GET** `/api/lessons` - Obtener lecciones
- **GET** `/api/lessons/:id` - Obtener lección específica
- **POST** `/api/lessons/:id/progress` - Actualizar progreso

### Gamificación
- **GET** `/api/gamification/stats` - Estadísticas del usuario
- **GET** `/api/gamification/achievements` - Logros del usuario
- **GET** `/api/gamification/leaderboard/:type` - Ranking

### Comunidad
- **GET** `/api/community/posts` - Feed de posts
- **POST** `/api/community/posts` - Crear post
- **GET** `/api/community/study-groups` - Grupos de estudio

## Estados de la Aplicación

### ✅ Modo Conectado (Backend Disponible)
- ApiManager detecta backend activo
- Todas las llamadas van al backend real
- Datos en tiempo real
- Funcionalidades completas

### ✅ Modo Offline (Backend No Disponible)
- ApiManager detecta falta de conectividad
- Fallback automático a datos mock
- Funcionalidad limitada pero usable
- Mensaje de estado al usuario

## Manejo de Errores

### Estrategias Implementadas
1. **Timeout**: 5 segundos para cada request
2. **Reintentos**: Hasta 3 intentos para requests fallidos
3. **Fallback**: Datos mock cuando no hay conectividad
4. **Logging**: Errores registrados en console
5. **UX**: Mensajes informativos al usuario

## Datos Mock Disponibles

### Lecciones
- 12 lecciones de ejemplo en diferentes materias
- Progreso simulado de usuario
- Tipos: video, reading, interactive, quiz

### Gamificación
- Sistema de niveles y experiencia
- 15+ logros predefinidos
- Leaderboard con 5 usuarios ejemplo
- Estadísticas por materia

### Comunidad
- Posts de discusión y preguntas
- Grupos de estudio por materia
- Sistema de likes y comentarios

## Problemas Resueltos

### ✅ Base de Datos
- **Problema**: Conflictos de nomenclatura Sequelize (camelCase vs snake_case)
- **Solución**: Script automático de corrección de índices
- **Resultado**: Base de datos SQLite funcionando correctamente

### ✅ Rutas 2FA
- **Problema**: Métodos no encontrados en controlador
- **Solución**: Corrección de nombres de métodos y binding
- **Resultado**: Rutas 2FA completamente funcionales

### ✅ Conectividad
- **Problema**: Frontend sin backend funcional
- **Solución**: ApiManager con fallback inteligente
- **Resultado**: Aplicación funcional en ambos escenarios

## Comando de Inicio

### Backend
```bash
cd implementation/backend
node src/app.js
```

### Frontend
```bash
cd implementation/frontend
npm run dev
```

## Próximos Pasos

### Recomendaciones
1. **Base de Datos**: Migrar a MySQL con Docker para producción
2. **Autenticación**: Implementar refresh tokens
3. **Cache**: Añadir Redis para cache de sesiones
4. **Monitoreo**: Implementar logging estructurado
5. **Testing**: Añadir tests de integración

### Mejoras Futuras
- WebSocket para notificaciones en tiempo real
- PWA para funcionalidad offline completa
- Compresión de respuestas API
- Rate limiting
- Monitoreo de performance

## Estado del Proyecto

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Backend | ✅ Funcionando | Puerto 3001, SQLite, rutas 2FA activas |
| Frontend | ✅ Funcionando | Puerto 5173, ApiManager implementado |
| ApiManager | ✅ Completo | Fallback inteligente implementado |
| Servicios | ✅ Refactorizados | Todos los servicios principales actualizados |
| Autenticación | ✅ Activa | JWT + 2FA completamente funcional |
| Base de Datos | ✅ Funcional | SQLite operativo (temporal) |

La integración frontend-backend está **completamente funcional** con un sistema robusto de fallback que garantiza la usabilidad de la aplicación en cualquier escenario.
