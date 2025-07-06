# StudyMate API Gateway

El API Gateway es el punto de entrada principal para todos los servicios de StudyMate, proporcionando enrutamiento, autenticación, rate limiting y monitoreo centralizado.

## 🚀 Características

- **Proxy Inteligente**: Enrutamiento automático a servicios backend
- **Autenticación Centralizada**: Validación de JWT opcional para todos los servicios
- **Rate Limiting**: Múltiples niveles de limitación de requests
- **Health Checks**: Monitoreo del estado de todos los servicios
- **Logging Avanzado**: Logging detallado de requests y errores
- **Seguridad**: Implementación de CORS, Helmet y otras medidas de seguridad
- **Documentación**: Documentación completa de la API accesible vía HTTP

## 📋 Requisitos

- Node.js 18+
- NPM 8+
- Servicios backend de StudyMate en funcionamiento

## ⚙️ Instalación

```bash
# Clonar el proyecto
cd backend/api-gateway

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Compilar el proyecto
npm run build

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 🔧 Configuración

### Variables de Entorno

```env
# Configuración del servidor
PORT=3001
NODE_ENV=development

# URLs de servicios
AUTH_SERVICE_URL=http://localhost:3005
USER_PROFILE_SERVICE_URL=http://localhost:3006
CONTENT_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3008
ANALYTICS_SERVICE_URL=http://localhost:3009

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# JWT para validación en gateway (opcional)
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## 🌐 Endpoints Principales

### Health Checks

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado del API Gateway |
| `/health/services` | GET | Estado de todos los servicios |
| `/health/services/:name` | GET | Estado de un servicio específico |
| `/health/metrics` | GET | Métricas del sistema |

### Documentación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api` | GET | Información general de la API |
| `/api/docs` | GET | Documentación completa |

### Servicios Proxy

| Ruta | Servicio | Descripción |
|------|----------|-------------|
| `/api/auth/*` | Auth Service | Autenticación y autorización |
| `/api/users/*` | User Profile Service | Gestión de perfiles |
| `/api/content/*` | Content Service | Contenido educativo |
| `/api/notifications/*` | Notification Service | Notificaciones |
| `/api/analytics/*` | Analytics Service | Métricas y analytics |

## 🔒 Seguridad

### Rate Limiting

- **General**: 1000 requests/15 minutos
- **Autenticación**: 10 requests/15 minutos
- **Escritura**: 50 requests/minuto
- **Uploads**: 20 requests/10 minutos
- **Búsquedas**: 100 requests/minuto

### Autenticación

El gateway soporta autenticación JWT opcional:
- Headers de autenticación son forwarded a los servicios
- Validación opcional para agregar headers de usuario
- Cada servicio mantiene su propia validación

### CORS

Configurado para múltiples frontends:
- Student App (puerto 3000)
- Instructor Panel (puerto 3002)
- Admin Panel (puerto 3003)

## 📊 Monitoring

### Health Checks

```bash
# Estado del gateway
curl http://localhost:3001/health

# Estado de todos los servicios
curl http://localhost:3001/health/services

# Estado de un servicio específico
curl http://localhost:3001/health/services/auth
```

### Métricas

```bash
# Métricas del sistema
curl http://localhost:3001/health/metrics
```

### Logs

El sistema incluye diferentes niveles de logging:
- **Desarrollo**: Logs detallados con colores
- **Producción**: Logs estructurados para agregación
- **Performance**: Tracking de requests lentas (>1000ms)
- **Errores**: Logging completo de errores con stack traces

## 🔄 Proxy Configuration

### Request Flow

1. **Request Recibida** → API Gateway
2. **Rate Limiting** → Verificación de límites
3. **CORS & Security** → Validación de origen
4. **Authentication** → Validación JWT (opcional)
5. **Proxy** → Envío a servicio correspondiente
6. **Response** → Forwarding de respuesta al cliente

### Headers Forwarded

- `X-User-Id`: ID del usuario autenticado
- `X-User-Role`: Rol del usuario
- `X-User-Email`: Email del usuario
- `Authorization`: Token JWT original

## 📝 Ejemplos de Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "miPassword123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "student"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "miPassword123"
  }'
```

### Request Autenticada

```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Obtener Cursos

```bash
curl -X GET "http://localhost:3001/api/content/courses?page=1&limit=10" \
  -H "Content-Type: application/json"
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint
npm run lint:fix

# Tests
npm test
```

## 📁 Estructura del Proyecto

```
src/
├── app.ts                 # Configuración principal de Express
├── server.ts             # Punto de entrada del servidor
├── middleware/           # Middlewares personalizados
│   ├── auth.ts           # Autenticación JWT
│   ├── logging.ts        # Logging de requests
│   ├── rateLimiting.ts   # Rate limiting
│   └── index.ts          # Exportaciones
├── routes/               # Rutas de la API
│   ├── api.ts            # Información y documentación
│   ├── health.ts         # Health checks
│   └── index.ts          # Exportaciones
├── utils/                # Utilidades
│   ├── healthChecker.ts  # Health checks de servicios
│   └── index.ts          # Exportaciones
```

## 🔧 Configuración de Desarrollo

### Desarrollo Local

1. Asegurar que todos los servicios backend estén ejecutándose
2. Configurar las URLs correctas en `.env`
3. Ejecutar `npm run dev`
4. El gateway estará disponible en `http://localhost:3001`

### Testing

```bash
# Health check
curl http://localhost:3001/health

# Documentación
curl http://localhost:3001/api/docs

# Proxy test (requiere servicios activos)
curl http://localhost:3001/api/auth/health
```

## 📚 Documentación de API

La documentación completa está disponible en:
- **HTTP**: `http://localhost:3001/api/docs`
- **JSON**: Incluye ejemplos de requests y responses
- **Interactive**: Información detallada de cada endpoint

## 🐛 Troubleshooting

### Servicios No Disponibles

Si un servicio no está disponible, el gateway:
1. Retorna error 503 (Service Unavailable)
2. Logea el error detalladamente
3. Continúa funcionando para otros servicios

### Rate Limiting

Si se exceden los límites:
1. Retorna error 429 (Too Many Requests)
2. Incluye header `Retry-After`
3. Logea el evento para monitoreo

### Errores de Autenticación

- El gateway no bloquea requests no autenticados
- Cada servicio backend valida la autenticación
- Los headers de usuario son forwarded cuando están disponibles

## 🚀 Producción

### Consideraciones

- Configurar `NODE_ENV=production`
- Usar un proceso manager (PM2, Docker)
- Implementar logging centralizado
- Configurar monitoring externo
- Usar HTTPS en producción

### Docker (Futuro)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## 📄 Licencia

Este proyecto es parte de StudyMate y está protegido por derechos de autor.

---

**StudyMate API Gateway v1.0.0**

Para más información, consulta la documentación en `/api/docs` o contacta al equipo de desarrollo.
