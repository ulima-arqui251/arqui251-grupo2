# 🚀 StudyMate - Ejecutar Proyecto

## Estado Actual del Desarrollo

✅ **Completado:**
- Arquitectura backend con patrón Modular Monolith + API Gateway
- Servicio de autenticación completo (RF-01 a RF-05)
- Migraciones de base de datos
- Validaciones y middlewares de seguridad
- Configuración de CORS y rate limiting

🔄 **En Desarrollo:**
- Configuración de base de datos MySQL
- Testing de endpoints
- Frontend con Next.js

## Pre-requisitos

1. **Node.js 18+** instalado
2. **MySQL Server** corriendo localmente
3. **npm** actualizado

## 🔧 Configuración Inicial

### 1. Configurar MySQL

```sql
-- Ejecutar en MySQL como root
CREATE DATABASE studymate_dev;
CREATE USER 'studymate'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Instalar Dependencias

```bash
cd code-structure
npm install
```

### 3. Configurar Variables de Entorno

Los archivos `.env` ya están configurados en:
- `backend/auth-service/.env`
- `backend/api-gateway/.env`

**Importante:** Edita el `.env` del auth-service con tu configuración SMTP real para el envío de emails.

## 🏃‍♂️ Ejecutar en Desarrollo

### Opción A: Ejecutar Todo (Recomendado)
```bash
npm run dev:all
```

### Opción B: Ejecutar Servicios Individualmente

**Terminal 1 - API Gateway:**
```bash
npm run dev:gateway
```

**Terminal 2 - Auth Service:**
```bash
npm run dev:auth
```

**Terminal 3 - Frontend (cuando esté listo):**
```bash
npm run dev:student
```

## 🔌 Endpoints Disponibles

### API Gateway (Puerto 3001)
- `GET http://localhost:3001/health` - Health check
- `GET http://localhost:3001/api` - Info de la API

### Servicio de Autenticación (via Gateway)
- `POST http://localhost:3001/api/auth/register` - Registro de usuario
- `POST http://localhost:3001/api/auth/login` - Inicio de sesión
- `GET http://localhost:3001/api/auth/verify-email/:token` - Verificar email
- `POST http://localhost:3001/api/auth/forgot-password` - Recuperar contraseña
- `POST http://localhost:3001/api/auth/reset-password` - Resetear contraseña
- `GET http://localhost:3001/api/auth/me` - Perfil usuario (autenticado)

## 🧪 Probar la API

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Iniciar Sesión
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## 📊 Arquitectura Implementada

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │───▶│   API Gateway    │
│ (Next.js)       │    │  (Puerto 3001)   │
│ Puertos:        │    └─────────┬────────┘
│ • Student: 3000 │              │
│ • Teacher: 3002 │              ▼
│ • Admin: 3003   │    ┌──────────────────┐
└─────────────────┘    │  Auth Service    │
                       │  (Puerto 3005)   │
                       └─────────┬────────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   MySQL DB       │
                       │ studymate_dev    │
                       └──────────────────┘
```

## 🐛 Solución de Problemas

### Error: "Access denied for user 'studymate'"
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Recrear usuario
DROP USER IF EXISTS 'studymate'@'localhost';
CREATE USER 'studymate'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'localhost';
```

### Error: "ECONNREFUSED"
```bash
# Verificar que los servicios estén corriendo
curl http://localhost:3001/health
curl http://localhost:3005/api/auth/health
```

### Error de TypeScript
```bash
# Limpiar y reinstalar
cd backend/auth-service
rm -rf node_modules dist
npm install
npm run build
```

## 📋 Próximos Pasos

1. ✅ Crear y ejecutar migraciones de DB
2. ✅ Probar endpoints de autenticación
3. ⏳ Implementar frontend básico
4. ⏳ Agregar módulo de lecciones
5. ⏳ Implementar gamificación

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Revisa los logs en la consola donde ejecutaste los servicios
2. Verifica que MySQL esté corriendo: `systemctl status mysql` (Linux) o Services (Windows)
3. Confirma que los puertos 3001 y 3005 estén libres
4. Revisa los archivos `.env` para configuración correcta

---

**¡El proyecto está listo para desarrollo!** 🎉
