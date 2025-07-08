# StudyMate - Guía de Docker

## Resumen

StudyMate incluye dos configuraciones de Docker:
- **Producción**: Optimizada para despliegue (`docker-compose.yml`)
- **Desarrollo**: Con hot reload para desarrollo (`docker-compose.dev.yml`)

## Inicio Rápido

### Para ver los cambios de iconos SVG:

```bash
# Opción 1: Reconstruir solo frontend (más rápido)
docker-compose stop frontend
docker-compose up --build frontend -d

# Opción 2: Reconstruir todo
docker-compose down
docker-compose up --build -d
```

### Con Scripts de Ayuda:

```bash
# En Linux/Mac
cd 10/StudyM
chmod +x scripts/dev.sh
./scripts/dev.sh

# En Windows PowerShell
cd 10/StudyM
.\scripts\dev.ps1
```

## 🏭 Configuración de Producción

### Características:
- Optimizada para rendimiento
- Archivos estáticos pre-compilados
- Nginx como servidor web
- Variables de entorno de producción
- Sin hot reload

### Uso:
```bash
# Levantar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Servicios:
- **Frontend**: `http://localhost:3000` (Nginx)
- **Backend**: `http://localhost:3001` (Express.js)
- **MySQL**: `localhost:3307`

## Configuración de Desarrollo

### Características:
- Hot reload en frontend y backend
- Volumes montados para código fuente
- Variables de entorno de desarrollo
- Recarga automática de cambios

### Uso:
```bash
# Levantar
docker-compose -f docker-compose.dev.yml up --build -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar
docker-compose -f docker-compose.dev.yml down
```

### Servicios:
- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express.js)
- **MySQL**: `localhost:3307`

## 📁 Estructura de Archivos

```
10/StudyM/
├── docker-compose.yml          # Configuración de producción
├── docker-compose.dev.yml      # Configuración de desarrollo
├── scripts/
│   ├── dev.sh                  # Script de ayuda (Linux/Mac)
│   └── dev.ps1                 # Script de ayuda (Windows)
├── implementation/
│   ├── frontend/
│   │   ├── Dockerfile          # Dockerfile de producción
│   │   └── Dockerfile.dev      # Dockerfile de desarrollo
│   └── backend/
│       └── Dockerfile          # Dockerfile del backend
└── docker/
    └── mysql/
        └── init/
            └── 01-init.sql     # Script de inicialización
```

## Comandos Útiles

### Gestión de Contenedores:
```bash
# Ver contenedores activos
docker-compose ps

# Ejecutar comandos dentro del contenedor
docker-compose exec frontend sh
docker-compose exec backend sh

# Reiniciar un servicio específico
docker-compose restart frontend
docker-compose restart backend
```

### Limpieza:
```bash
# Parar y eliminar contenedores
docker-compose down

# Eliminar también volúmenes
docker-compose down -v

# Limpiar sistema Docker
docker system prune -f
```

### Logs:
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
```

##  Flujo de Desarrollo

### 1. Desarrollo Activo (Recomendado)
```bash
# Usar configuración de desarrollo
docker-compose -f docker-compose.dev.yml up --build -d

# Los cambios se reflejan automáticamente
# No necesitas reconstruir contenedores
```

### 2. Pruebas de Producción
```bash
# Cambiar a configuración de producción
docker-compose -f docker-compose.dev.yml down
docker-compose up --build -d

# Reconstruir cuando hagas cambios
docker-compose up --build -d
```

##  Solución de Problemas

### Puerto ya en uso:
```bash
# Ver qué proceso usa el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Puerto externo:interno
```

### Problemas de permisos:
```bash
# Linux/Mac: dar permisos al script
chmod +x scripts/dev.sh

# Windows: ejecutar PowerShell como administrador
```

### Base de datos no conecta:
```bash
# Verificar que MySQL esté funcionando
docker-compose exec mysql mysql -u studymate_user -p studymate_db

# Recrear volumen si es necesario
docker-compose down -v
docker-compose up --build -d
```

### Cambios no se reflejan:
```bash
# En producción: siempre reconstruir
docker-compose up --build -d

# En desarrollo: verificar volumes
docker-compose -f docker-compose.dev.yml up --build -d
```

## Comparación de Configuraciones

| Característica | Producción | Desarrollo |
|----------------|------------|------------|
| **Hot Reload** | No | Sí |
| **Rendimiento** | Óptimo | Medio |
| **Tamaño** | Pequeño | Grande |
| **Build Time** | Lento | Rápido |
| **Debugging** | Limitado | Completo |
| **Volumes** | No | Sí |

## Recomendaciones

### Durante Desarrollo:
- Usa `docker-compose.dev.yml` para desarrollo activo
- Usa `docker-compose.yml` para pruebas finales

### Para Despliegue:
- Siempre usa `docker-compose.yml`
- Ejecuta pruebas antes de desplegar
- Usa variables de entorno apropiadas

### Para Demos:
- Usa configuración de producción
- Precarga datos de prueba
- Configura monitoreo básico 