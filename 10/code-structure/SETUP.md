# StudyMate - Guía de Configuración y Ejecución

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- MySQL 8.0+ (o usar Docker)
- Git

## Instalación Inicial

### 1. Clonar e Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd c:\Users\USUARIO\Desktop\StudyMate\code-structure

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 2. Configurar Base de Datos

#### Opción A: MySQL Local
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE studymate_dev;
CREATE USER 'studymate'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'localhost';
```

#### Opción B: Docker (Recomendado para desarrollo)
```bash
# En la raíz del proyecto
docker-compose up -d database
```

### 3. Configurar Variables de Entorno

```bash
# Backend - Copiar y editar
cd backend
cp .env.example .env

# Frontend - Copiar y editar  
cd ../frontend
cp .env.example .env.local
```

## Ejecución del Proyecto

### Modo Desarrollo (Recomendado)

```bash
# Terminal 1: Backend (API Gateway + Servicios)
cd backend
npm run dev

# Terminal 2: Frontend Student App
cd frontend/student-app
npm run dev

# Terminal 3: Frontend Teacher Panel
cd frontend/teacher-panel  
npm run dev

# Terminal 4: Frontend Admin Panel
cd frontend/admin-panel
npm run dev
```

### Puertos por Defecto

- **API Gateway**: http://localhost:3001
- **Student App**: http://localhost:3000
- **Teacher Panel**: http://localhost:3002
- **Admin Panel**: http://localhost:3003
- **Database**: localhost:3306

### Scripts Disponibles

```bash
# Backend
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run test         # Tests unitarios
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Datos de prueba

# Frontend
npm run dev          # Desarrollo con hot reload
npm run build        # Build para producción
npm run start        # Servir build de producción
npm run test         # Tests
npm run lint         # Linter
```

## Flujo de Desarrollo Recomendado

### 1. Primera Ejecución
```bash
# 1. Instalar todo
npm run install:all

# 2. Configurar DB
npm run db:setup

# 3. Ejecutar en desarrollo
npm run dev:all
```

### 2. Desarrollo Diario
```bash
# Ejecutar todo en paralelo
npm run dev:all

# O servicios individuales según necesidad
npm run dev:backend
npm run dev:frontend
```

## Verificación de Instalación

### Health Check Endpoints
- Backend API: http://localhost:3001/health
- Auth Service: http://localhost:3001/api/auth/health
- Lesson Service: http://localhost:3001/api/lessons/health

### Frontend Apps
- Student: http://localhost:3000
- Teacher: http://localhost:3002  
- Admin: http://localhost:3003

## Troubleshooting Común

### Error de Puerto Ocupado
```bash
# Encontrar proceso en puerto
netstat -ano | findstr :3000
# Matar proceso
taskkill /PID <PID> /F
```

### Error de Base de Datos
```bash
# Verificar conexión MySQL
mysql -u studymate -p studymate_dev

# Recrear base de datos
npm run db:reset
```

### Error de Dependencias
```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Próximos Pasos

1. **Configurar**: Seguir esta guía de setup
2. **Verificar**: Acceder a los endpoints de health
3. **Desarrollar**: Comenzar con el módulo de autenticación
4. **Integrar**: Conectar frontend con backend APIs

---

**Nota**: Esta guía se actualizará conforme avance el desarrollo del proyecto.
