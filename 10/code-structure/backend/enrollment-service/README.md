# StudyMate - Enrollment Service

Servicio de inscripciones a cursos para la plataforma StudyMate. Maneja la gestión de inscripciones, capacidad de cursos y listas de espera.

## 🚀 Características

### Gestión de Inscripciones
- ✅ Inscripción automática a cursos
- ✅ Actualización de estados de inscripción
- ✅ Cancelación de inscripciones
- ✅ Historial de cambios de estado
- ✅ Validación de capacidad de cursos

### Gestión de Capacidad
- ✅ Configuración de capacidad máxima por curso
- ✅ Seguimiento de inscripciones actuales
- ✅ Análisis de utilización de capacidad
- ✅ Alertas de cursos cerca de capacidad máxima

### Lista de Espera
- ✅ Inscripción automática a lista de espera
- ✅ Gestión de prioridades
- ✅ Promoción automática cuando se liberen cupos
- ✅ Notificaciones a usuarios en lista de espera

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- TypeScript 5+

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Navegar al directorio
cd enrollment-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
npm run db:migrate
npm run db:seed
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3003
HOST=localhost

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studymate_enrollment
DB_USER=postgres
DB_PASSWORD=your_password

# Autenticación
JWT_SECRET=your_jwt_secret
SERVICE_API_KEY=your_service_api_key

# Otros servicios
USER_PROFILE_SERVICE_URL=http://localhost:3001
CONTENT_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚀 Uso

### Desarrollo
```bash
# Iniciar en modo desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Iniciar servidor de producción
npm start
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Iniciar servidor de producción
npm run start:dev    # Iniciar con ts-node
npm test             # Ejecutar tests
npm run lint         # Verificar código
npm run lint:fix     # Corregir errores de lint
```

## 📚 API Endpoints

### Inscripciones

```http
POST   /api/enrollment/enrollments              # Crear inscripción
GET    /api/enrollment/enrollments/me           # Obtener inscripciones del usuario
GET    /api/enrollment/enrollments/course/:id   # Obtener inscripciones de un curso
PUT    /api/enrollment/enrollments/:id/status   # Actualizar estado
DELETE /api/enrollment/enrollments/:id          # Cancelar inscripción
GET    /api/enrollment/enrollments/course/:id/stats # Estadísticas
```

### Capacidad de Cursos

```http
POST   /api/enrollment/capacity                 # Crear configuración de capacidad
GET    /api/enrollment/capacity/:courseId       # Obtener capacidad de curso
PUT    /api/enrollment/capacity/:courseId       # Actualizar capacidad
GET    /api/enrollment/capacity/analytics/near-capacity # Cursos cerca de capacidad
GET    /api/enrollment/capacity/analytics/full  # Cursos llenos
GET    /api/enrollment/capacity/analytics/stats # Estadísticas generales
```

### Lista de Espera

```http
POST   /api/enrollment/waitlist/:courseId       # Agregar a lista de espera
DELETE /api/enrollment/waitlist/:courseId       # Remover de lista de espera
GET    /api/enrollment/waitlist/:courseId/position # Obtener posición
GET    /api/enrollment/waitlist/:courseId/list  # Obtener lista de espera
GET    /api/enrollment/waitlist/me              # Obtener listas de espera del usuario
POST   /api/enrollment/waitlist/:courseId/notify # Notificar usuarios
GET    /api/enrollment/waitlist/analytics/stats # Estadísticas de lista de espera
```

## 🔧 Ejemplos de Uso

### Crear Inscripción

```javascript
const response = await fetch('/api/enrollment/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    courseId: 'uuid-del-curso',
    paymentMethod: 'credit_card',
    notes: 'Inscripción regular'
  })
});
```

### Obtener Inscripciones del Usuario

```javascript
const response = await fetch('/api/enrollment/enrollments/me?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
});
```

### Configurar Capacidad de Curso

```javascript
const response = await fetch('/api/enrollment/capacity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    courseId: 'uuid-del-curso',
    maxCapacity: 50,
    allowWaitlist: true
  })
});
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── app.ts                 # Configuración de Express
├── server.ts              # Servidor principal
├── controllers/           # Controladores
│   ├── enrollmentController.ts
│   ├── courseCapacityController.ts
│   └── waitlistController.ts
├── models/               # Modelos de Sequelize
│   ├── Enrollment.ts
│   ├── CourseCapacity.ts
│   ├── EnrollmentHistory.ts
│   └── Waitlist.ts
├── routes/               # Rutas de Express
│   ├── enrollmentRoutes.ts
│   ├── courseCapacityRoutes.ts
│   └── waitlistRoutes.ts
├── middleware/           # Middlewares
│   ├── authMiddleware.ts
│   └── validationMiddleware.ts
├── validators/           # Validadores
│   ├── enrollmentValidators.ts
│   ├── courseCapacityValidators.ts
│   └── waitlistValidators.ts
└── types/               # Tipos TypeScript
    ├── models.ts
    └── common.ts
```

### Flujo de Inscripción

1. **Solicitud de Inscripción** → Verificar autenticación
2. **Validación** → Verificar datos de entrada
3. **Verificación de Capacidad** → Comprobar cupos disponibles
4. **Procesamiento** → Crear inscripción o agregar a lista de espera
5. **Respuesta** → Confirmar inscripción o posición en lista de espera

## 🔐 Seguridad

- **Autenticación JWT** para todas las rutas protegidas
- **Validación de entrada** con express-validator
- **Rate limiting** para prevenir abuso
- **CORS** configurado para orígenes permitidos
- **Helmet** para headers de seguridad

## 📊 Monitoreo

### Health Checks

```http
GET /health                    # Estado del servicio
GET /api/enrollment/health     # Estado detallado
GET /api/enrollment/status     # Estado y métricas
```

### Métricas Disponibles

- Total de inscripciones por curso
- Utilización de capacidad
- Longitud de listas de espera
- Tiempo de respuesta promedio
- Estados de inscripciones

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📦 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3003
CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  enrollment-service:
    build: .
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
```

## 🤝 Integración con Otros Servicios

### Auth Service
- Validación de tokens JWT
- Verificación de roles y permisos

### User Profile Service
- Obtención de información de usuarios
- Verificación de datos de perfil

### Content Service
- Validación de existencia de cursos
- Obtención de información de cursos

### Notification Service (futuro)
- Envío de notificaciones de inscripción
- Alertas de lista de espera

## 📝 Logs

Los logs se registran en formato JSON con los siguientes niveles:

- **ERROR**: Errores del sistema
- **WARN**: Advertencias
- **INFO**: Información general
- **DEBUG**: Información de depuración

## 🔄 Versionado

Este servicio utiliza versionado semántico (SemVer):
- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de errores

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Contribución

1. Fork el proyecto
2. Crear una rama para la funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo o crear un issue en el repositorio.

---

**StudyMate Enrollment Service v1.0.0**
