# StudyMate Backend - Módulo de Autenticación

## Setup Inicial

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar Base de Datos
1. Crear base de datos MySQL llamada `studymate`
2. Ajustar credenciales en `.env`

### 3. Ejecutar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints Disponibles

### Autenticación

#### POST /api/auth/register
Registro de nuevo usuario
```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "estudiante",
  "institutionId": "UCH001"
}
```

#### POST /api/auth/login
Login de usuario
```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

#### GET /api/auth/profile
Obtener perfil del usuario autenticado
Headers: `Authorization: Bearer <token>`

#### PUT /api/auth/change-password
Cambiar contraseña
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

## Características Implementadas

### Seguridad (ESC-01)
- ✅ Bloqueo de cuenta tras 3 intentos fallidos
- ✅ Tiempo de bloqueo de 15 minutos
- ✅ Encriptación de contraseñas con bcrypt

### Escalabilidad (ESC-03)
- ✅ Rate limiting: 100 requests por 15 min
- ✅ JWT stateless para escalabilidad horizontal

### Control de Acceso (ESC-16)
- ✅ Roles: estudiante, docente, admin
- ✅ Middleware de autorización por roles

## Testing

```bash
# Para probar el servidor
curl http://localhost:3001/health

# Registro de usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "role": "estudiante"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Obtener lecciones (público)
curl http://localhost:3001/api/lessons

# Crear lección (requiere token de docente)
curl -X POST http://localhost:3001/api/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Introducción a las Matemáticas",
    "description": "Conceptos básicos de matemáticas para principiantes",
    "content": "En esta lección aprenderemos los conceptos fundamentales...",
    "subject": "mathematics",
    "level": "beginner",
    "estimatedDuration": 30,
    "points": 50
  }'

# Iniciar una lección (requiere token de estudiante)
curl -X POST http://localhost:3001/api/lessons/1/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# Actualizar progreso de lección
curl -X PUT http://localhost:3001/api/lessons/1/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "progressPercentage": 75,
    "timeSpent": 20
  }'

# Completar lección
curl -X POST http://localhost:3001/api/lessons/1/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "score": 85
  }'

# Obtener mis estadísticas de gamificación
curl -X GET http://localhost:3001/api/gamification/stats/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver ranking global
curl -X GET http://localhost:3001/api/gamification/leaderboard/global \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver mis logros
curl -X GET http://localhost:3001/api/gamification/achievements/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Inicializar logros por defecto (admin)
curl -X POST http://localhost:3001/api/gamification/init-achievements \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Módulos Implementados

### ✅ 1. Auth + JWT (Completado)
- Registro y login de usuarios
- Autenticación con JWT
- Roles: estudiante, teacher, admin
- Middleware de autenticación

### ✅ 2. Lecciones (Completado)
- CRUD completo de lecciones
- Sistema de progreso por estudiante
- Filtros por materia, nivel, búsqueda
- Estadísticas para docentes
- Endpoints públicos y protegidos

**Endpoints de Lecciones:**
- `GET /api/lessons` - Obtener lecciones (con filtros)
- `GET /api/lessons/:id` - Obtener lección específica
- `POST /api/lessons` - Crear lección (docentes)
- `PUT /api/lessons/:id` - Actualizar lección
- `DELETE /api/lessons/:id` - Eliminar lección (soft delete)
- `POST /api/lessons/:id/start` - Iniciar lección
- `PUT /api/lessons/:id/progress` - Actualizar progreso
- `POST /api/lessons/:id/complete` - Completar lección
- `GET /api/lessons/progress/me` - Mi progreso
- `GET /api/lessons/:id/stats` - Estadísticas (docentes)

### ✅ 3. Gamificación (Completado)
- Sistema completo de puntos y niveles
- Logros y achievements con progreso
- Rankings globales y por materia
- Rachas de actividad
- Integración automática con lecciones
- Transacciones de puntos detalladas

**Endpoints de Gamificación:**
- `GET /api/gamification/stats/me` - Mis estadísticas
- `GET /api/gamification/stats/:userId` - Estadísticas de usuario
- `POST /api/gamification/points` - Agregar puntos (admin)
- `GET /api/gamification/leaderboard/global` - Ranking global
- `GET /api/gamification/leaderboard/subject/:subject` - Ranking por materia
- `GET /api/gamification/achievements` - Todos los logros
- `GET /api/gamification/achievements/me` - Mis logros
- `GET /api/gamification/achievements/:userId` - Logros de usuario
- `POST /api/gamification/unlock-achievement` - Desbloquear logro (admin)
- `GET /api/gamification/levels` - Información de niveles
- `POST /api/gamification/streak` - Actualizar racha
- `POST /api/gamification/init-achievements` - Inicializar logros (admin)

**Características de Gamificación:**
- **Niveles**: 15 niveles basados en puntos acumulados
- **Puntos**: Por completar lecciones, logros, rachas
- **Logros**: 5 categorías (lecciones, puntos, rachas, materias, especiales)
- **Rankings**: Global, por materia, con paginación
- **Rachas**: Seguimiento de días consecutivos de actividad
- **Bonus**: Puntos extra por puntuación perfecta y subida de nivel

### ✅ 4. Integración con Azure (Completado)
- Análisis de sentimientos en contenido educativo
- Extracción de frases clave y temas
- Procesamiento de imágenes y OCR
- Traducción automática de contenidos
- Análisis de dificultad y legibilidad
- Detección automática de idiomas
- Comparación de contenidos educativos

**Endpoints de Azure:**
- `POST /api/azure/sentiment` - Análisis de sentimientos
- `POST /api/azure/key-phrases` - Extracción de frases clave
- `POST /api/azure/detect-language` - Detección de idioma
- `POST /api/azure/analyze-image` - Análisis de imágenes
- `POST /api/azure/extract-text` - OCR de imágenes
- `POST /api/azure/translate` - Traducción de texto
- `POST /api/azure/summarize` - Resumen de texto
- `POST /api/azure/process-educational` - Procesamiento educativo
- `POST /api/azure/analyze-lesson` - Análisis de lecciones
- `POST /api/azure/compare-content` - Comparación de contenidos
- `GET /api/azure/status` - Estado de servicios Azure

**Características de Azure Integration:**
- **Text Analytics**: Sentimientos, frases clave, idiomas
- **Computer Vision**: Análisis de imágenes, OCR, detección de objetos
- **Translator**: Traducción multiidioma automática
- **Educational AI**: Evaluación de dificultad, temas, legibilidad
- **Content Analysis**: Comparación y recomendaciones automatizadas
- **Smart Processing**: Análisis completo de contenido educativo

## Ejemplos de uso - Azure Integration

### Análisis de Sentimientos
```bash
# Analizar sentimiento de un texto educativo
curl -X POST http://localhost:3001/api/azure/sentiment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Esta lección sobre matemáticas es muy interesante y fácil de entender."
  }'
```

### Procesamiento de Contenido Educativo
```bash
# Procesar contenido educativo completo
curl -X POST http://localhost:3001/api/azure/process-educational \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Las células son las unidades básicas de la vida. Están compuestas por membrana celular, citoplasma y núcleo. Existen células procariotas y eucariotas."
  }'
```

### Análisis de Contenido de Lección
```bash
# Analizar contenido de texto de una lección
curl -X POST http://localhost:3001/api/azure/analyze-lesson \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "En esta lección aprenderemos sobre la fotosíntesis...",
    "type": "text"
  }'

# Analizar imagen de una lección
curl -X POST http://localhost:3001/api/azure/analyze-lesson \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "https://example.com/cell-diagram.jpg",
    "type": "image"
  }'
```

### Traducción de Contenido
```bash
# Traducir contenido educativo
curl -X POST http://localhost:3001/api/azure/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "The mitochondria is the powerhouse of the cell",
    "targetLanguage": "es",
    "sourceLanguage": "en"
  }'
```

### Comparación de Contenidos
```bash
# Comparar dos contenidos educativos
curl -X POST http://localhost:3001/api/azure/compare-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content1": "Las plantas realizan fotosíntesis usando luz solar y dióxido de carbono.",
    "content2": "La fotosíntesis es el proceso por el cual las plantas convierten luz en energía."
  }'
```

### Estado de Servicios Azure
```bash
# Verificar estado de servicios Azure
curl -X GET http://localhost:3001/api/azure/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Próximos Módulos
1. ✅ Auth + JWT (Completado)
2. ✅ Lecciones básicas (Completado)
3. ✅ Gamificación (Completado)
4. ✅ Azure integration (Completado)
5. ⏳ Comunidad + Panel docente
