# StudyMate User Profile Service

Microservicio de gestión de perfiles de usuario para la plataforma StudyMate.

## Descripción

Este servicio maneja toda la funcionalidad relacionada con los perfiles de usuario, incluyendo:

- Creación y gestión de perfiles de usuario
- Configuración de preferencias personales
- Gestión de configuraciones de privacidad
- Subida y manejo de avatares
- Historial de actividad del usuario
- Búsqueda y descubrimiento de perfiles

## Tecnologías Utilizadas

- **Node.js** con **TypeScript**
- **Express.js** para el servidor web
- **Sequelize** como ORM para MySQL
- **MySQL** como base de datos
- **JWT** para autenticación
- **Multer** para manejo de archivos
- **Express-validator** para validación
- **Helmet** para seguridad
- **CORS** para manejo de origen cruzado
- **Rate limiting** para prevención de abuso

## Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación
│   └── database.ts   # Configuración de la base de datos
├── controllers/      # Controladores de la API
│   └── UserProfileController.ts
├── middleware/       # Middlewares personalizados
│   ├── auth.ts       # Autenticación JWT
│   ├── upload.ts     # Manejo de archivos
│   └── validation.ts # Validación de datos
├── models/          # Modelos de datos (Sequelize)
│   ├── UserProfile.ts
│   ├── ActivityLog.ts
│   └── index.ts
├── routes/          # Definición de rutas
│   ├── profiles.ts
│   └── index.ts
├── services/        # Lógica de negocio
│   ├── UserProfileService.ts
│   └── FileService.ts
├── types/           # Tipos TypeScript
│   └── index.ts
├── utils/           # Utilidades
│   ├── errorHandler.ts
│   └── helpers.ts
├── validators/      # Validadores de datos
│   └── profile.ts
└── app.ts          # Aplicación principal
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Configurar la base de datos en `.env`:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=studymate_profiles
```

4. Crear la base de datos:
```sql
CREATE DATABASE studymate_profiles;
```

5. Compilar el proyecto:
```bash
npm run build
```

6. Ejecutar migraciones (opcional):
```bash
npm run migrate
```

## Scripts Disponibles

- `npm run build` - Compila el proyecto TypeScript
- `npm run dev` - Ejecuta el servidor en modo desarrollo
- `npm run start` - Ejecuta el servidor en modo producción
- `npm run lint` - Ejecuta el linter
- `npm run test` - Ejecuta las pruebas

## API Endpoints

### Perfiles de Usuario

#### Crear Perfil
```
POST /api/v1/profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "bio": "Estudiante de ingeniería",
  "location": "Madrid, España",
  "occupation": "Estudiante",
  "website": "https://example.com",
  "socialLinks": {
    "twitter": "https://twitter.com/juan",
    "linkedin": "https://linkedin.com/in/juan"
  }
}
```

#### Obtener Perfil Propio
```
GET /api/v1/profiles/me
Authorization: Bearer <token>
```

#### Actualizar Perfil
```
PUT /api/v1/profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "bio": "Nuevo bio actualizado"
}
```

#### Actualizar Preferencias
```
PUT /api/v1/profiles/me/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "es",
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

#### Actualizar Configuración de Privacidad
```
PUT /api/v1/profiles/me/privacy
Authorization: Bearer <token>
Content-Type: application/json

{
  "profileVisibility": "friends",
  "showProgress": false
}
```

#### Subir Avatar
```
POST /api/v1/profiles/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

#### Obtener Perfil por ID
```
GET /api/v1/profiles/:id
```

#### Buscar Perfiles
```
GET /api/v1/profiles/search?q=juan&limit=20&offset=0
```

#### Obtener Perfiles Públicos
```
GET /api/v1/profiles/public?limit=20&offset=0
```

#### Obtener Actividad del Usuario
```
GET /api/v1/profiles/me/activity?limit=50&offset=0
Authorization: Bearer <token>
```

#### Eliminar Perfil
```
DELETE /api/v1/profiles/me
Authorization: Bearer <token>
```

### Health Check
```
GET /health
```

## Tipos de Datos

### UserProfile
```typescript
interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: UserPreferences;
  privacy: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserPreferences
```typescript
interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  studySettings: StudySettings;
}
```

### PrivacySettings
```typescript
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showAchievements: boolean;
  showActivity: boolean;
  allowMessages: boolean;
}
```

## Seguridad

- **JWT Authentication**: Todos los endpoints protegidos requieren token JWT válido
- **Rate Limiting**: Límite de 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad configurados
- **CORS**: Origen configurado para prevenir requests no autorizados
- **File Upload**: Validación de tipo y tamaño de archivos
- **Input Validation**: Validación exhaustiva de todos los inputs

## Configuración de Privacidad

Los perfiles pueden tener tres niveles de visibilidad:

1. **Public**: Visible para todos
2. **Friends**: Visible solo para amigos
3. **Private**: Visible solo para el propietario

## Manejo de Errores

El servicio incluye manejo centralizado de errores con:

- Códigos de estado HTTP apropiados
- Mensajes de error descriptivos
- Logging detallado para debugging
- Respuestas consistentes en formato JSON

## Desarrollo

### Estructura de Respuestas

Todas las respuestas siguen el formato:

```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "errors": [ ... ]
}
```

### Logging

El servicio incluye logging para:
- Errores de aplicación
- Errores de base de datos
- Actividad del usuario
- Debugging en modo desarrollo

## Consideraciones de Rendimiento

- **Compresión**: Respuestas comprimidas (deshabilitada temporalmente)
- **Caching**: Headers de caché configurados
- **Índices de Base de Datos**: Índices optimizados para consultas frecuentes
- **Paginación**: Endpoints con límites de resultados

## Próximas Características

- [ ] Integración con servicio de autenticación
- [ ] Notificaciones push
- [ ] Integración con redes sociales
- [ ] Análisis de actividad del usuario
- [ ] Respaldo y sincronización de datos
- [ ] Testing automatizado
- [ ] Documentación de API con Swagger

## Contribución

Este servicio forma parte del ecosistema StudyMate y debe seguir las mismas convenciones de código y estándares del proyecto principal.
