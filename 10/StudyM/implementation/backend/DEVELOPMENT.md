# StudyMate Backend - Scripts de Desarrollo

## Requisitos
- Docker y Docker Compose instalados
- Node.js 16+ instalado

## Configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar base de datos MySQL con Docker
```bash
# Iniciar MySQL y phpMyAdmin
docker-compose up -d

# Verificar que los contenedores estén ejecutándose
docker-compose ps
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y actualiza las variables según sea necesario.

### 4. Ejecutar migraciones (crear tablas)
```bash
npm run migrate
```

### 5. Ejecutar seeders (datos de prueba)
```bash
npm run seed
```

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
```

## Acceso a servicios

- **API Backend**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
  - Usuario: root
  - Contraseña: rootpassword

## Scripts disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor con nodemon
npm start           # Iniciar servidor en producción

# Base de datos
npm run migrate     # Ejecutar migraciones
npm run seed        # Ejecutar seeders
npm run db:reset    # Resetear base de datos (drop + migrate + seed)

# Docker
npm run docker:up   # Iniciar contenedores
npm run docker:down # Detener contenedores
npm run docker:logs # Ver logs de contenedores

# Testing
npm test           # Ejecutar tests
npm run test:watch # Ejecutar tests en modo watch
```

## Estructura de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `POST /verify-2fa` - Verificar código 2FA
- `GET /profile` - Obtener perfil (requiere auth)
- `PUT /change-password` - Cambiar contraseña (requiere auth)
- `POST /logout` - Cerrar sesión (requiere auth)

### 2FA (`/api/auth/2fa`)
- `GET /qr` - Generar QR para configurar 2FA
- `POST /enable` - Habilitar 2FA
- `POST /disable` - Deshabilitar 2FA
- `POST /verify` - Verificar código 2FA
- `GET /backup-codes` - Obtener códigos de respaldo
- `POST /backup-codes/regenerate` - Regenerar códigos de respaldo

### Lecciones (`/api/lessons`)
- `GET /` - Obtener lecciones
- `POST /` - Crear lección
- `GET /:id` - Obtener lección específica
- `PUT /:id` - Actualizar lección
- `DELETE /:id` - Eliminar lección
- `POST /:id/complete` - Marcar lección como completada

### Gamificación (`/api/gamification`)
- `GET /stats` - Obtener estadísticas del usuario
- `GET /achievements` - Obtener logros
- `GET /leaderboard` - Obtener tabla de clasificación
- `POST /award-points` - Otorgar puntos

### Comunidad (`/api/community`)
- `GET /posts` - Obtener posts
- `POST /posts` - Crear post
- `GET /posts/:id` - Obtener post específico
- `PUT /posts/:id` - Actualizar post
- `DELETE /posts/:id` - Eliminar post
- `POST /posts/:id/like` - Dar like a post
- `GET /posts/:id/comments` - Obtener comentarios
- `POST /posts/:id/comments` - Crear comentario

### Azure (`/api/azure`)
- `GET /storage/url` - Obtener URL de subida a Azure Storage
- `POST /cognitive/analyze` - Analizar contenido con Azure Cognitive Services

## Guía de 2FA con Google Authenticator

### Para usuarios finales:

1. **Configurar 2FA:**
   - Ir a perfil → configuración de seguridad
   - Hacer clic en "Habilitar 2FA"
   - Escanear el código QR con Google Authenticator
   - Introducir el código de 6 dígitos para activar

2. **Iniciar sesión con 2FA:**
   - Introducir email y contraseña normalmente
   - En la segunda pantalla, introducir el código de 6 dígitos de Google Authenticator
   - Opcional: usar código de respaldo si no tienes acceso al teléfono

3. **Deshabilitar 2FA:**
   - Ir a perfil → configuración de seguridad
   - Hacer clic en "Deshabilitar 2FA"
   - Introducir contraseña actual para confirmar

### Para desarrolladores:

1. **Generar QR:**
```bash
GET /api/auth/2fa/qr
Authorization: Bearer <token>
```

2. **Habilitar 2FA:**
```bash
POST /api/auth/2fa/enable
{
  "token": "123456"
}
```

3. **Login con 2FA:**
```bash
# Paso 1: Login normal
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Respuesta si 2FA está habilitado:
{
  "success": true,
  "message": "2FA requerido",
  "requires2FA": true,
  "tempToken": "temp_token_here"
}

# Paso 2: Verificar 2FA
POST /api/auth/verify-2fa
{
  "tempToken": "temp_token_here",
  "token": "123456"
}
```

## Solución de problemas

### Error de conexión a base de datos
```bash
# Verificar que MySQL esté ejecutándose
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar contenedores
docker-compose restart
```

### Problemas con migraciones
```bash
# Resetear base de datos completamente
npm run db:reset

# O manualmente:
docker-compose down -v  # Eliminar volúmenes
docker-compose up -d    # Recrear contenedores
npm run migrate         # Ejecutar migraciones
```

### Problemas con dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```
