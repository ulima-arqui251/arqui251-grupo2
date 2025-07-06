# StudyMate Docker Environment

Este documento describe cómo usar la configuración de Docker para el proyecto StudyMate.

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose (incluido con Docker Desktop)
- Git

### Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd code-structure
   ```

2. **Configurar variables de entorno:**
   ```bash
   # En Windows PowerShell
   .\dev.ps1 start

   # En Windows Git Bash / Linux / macOS
   ./dev.sh start
   ```

   Este comando creará automáticamente el archivo `.env` desde `.env.example` si no existe.

## 🏗️ Arquitectura de Servicios

### Servicios Incluidos

- **Frontend (React)**: Puerto 80
  - Aplicación React con Nginx
  - Configuración de proxy para APIs
  - Optimizado para producción

- **Content Service (Backend)**: Puerto 3003
  - API REST con Node.js/Express
  - Integración con MySQL
  - Endpoints para cursos, lecciones, materiales

- **MySQL Database**: Puerto 3306
  - Base de datos principal
  - Inicialización automática
  - Datos persistentes

- **Redis**: Puerto 6379
  - Cache y sesiones
  - Optimización de rendimiento

- **phpMyAdmin**: Puerto 8080
  - Interfaz web para gestión de base de datos
  - Acceso: http://localhost:8080

### Red de Servicios

Todos los servicios están conectados a través de una red Docker personalizada (`studymate-network`) que permite la comunicación entre contenedores usando nombres de servicio.

## 🛠️ Comandos Disponibles

### Windows PowerShell

```powershell
# Iniciar todos los servicios
.\dev.ps1 start

# Parar todos los servicios
.\dev.ps1 stop

# Ver logs de todos los servicios
.\dev.ps1 logs

# Ver logs de un servicio específico
.\dev.ps1 logs -Service content-service

# Poblar la base de datos con datos iniciales
.\dev.ps1 seed

# Ver el estado de los servicios
.\dev.ps1 status

# Limpiar todos los contenedores y volúmenes
.\dev.ps1 clean

# Entrar al shell de un servicio
.\dev.ps1 shell -Service mysql
```

### Linux / macOS / Git Bash

```bash
# Iniciar todos los servicios
./dev.sh start

# Parar todos los servicios
./dev.sh stop

# Ver logs de todos los servicios
./dev.sh logs

# Ver logs de un servicio específico
./dev.sh logs content-service

# Poblar la base de datos con datos iniciales
./dev.sh seed

# Ver el estado de los servicios
./dev.sh status

# Limpiar todos los contenedores y volúmenes
./dev.sh clean

# Entrar al shell de un servicio
./dev.sh shell mysql
```

## 📱 Acceso a los Servicios

Una vez que los servicios estén ejecutándose:

- **Frontend**: http://localhost
- **Content Service API**: http://localhost:3003
- **phpMyAdmin**: http://localhost:8080
- **Health Check**: http://localhost:3003/health

## 🔧 Desarrollo

### Modificar Código

Los archivos fuente se montan como volúmenes, por lo que los cambios se reflejan automáticamente:

- **Frontend**: Requiere rebuild para cambios en el código
- **Backend**: Usa `ts-node-dev` para recarga automática

### Rebuild de Servicios

```bash
# Rebuild un servicio específico
docker-compose build content-service

# Rebuild todos los servicios
docker-compose build

# Rebuild y reiniciar
docker-compose up -d --build
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f content-service

# Ver logs de los últimos 100 líneas
docker-compose logs --tail=100
```

## 🗄️ Base de Datos

### Acceso a MySQL

```bash
# Usando docker-compose
docker-compose exec mysql mysql -u studymate -p12345 studymate_dev

# Usando phpMyAdmin
# Navegar a http://localhost:8080
# Usuario: studymate
# Contraseña: 12345
```

### Respaldo y Restauración

```bash
# Crear respaldo
docker-compose exec mysql mysqldump -u studymate -p12345 studymate_dev > backup.sql

# Restaurar respaldo
docker-compose exec -T mysql mysql -u studymate -p12345 studymate_dev < backup.sql
```

### Poblar Base de Datos

```bash
# Ejecutar el script de seed
docker-compose exec content-service npm run dev:init

# O usando los scripts de desarrollo
.\dev.ps1 seed  # Windows
./dev.sh seed   # Linux/macOS
```

## 🛡️ Seguridad

### Variables de Entorno

Las variables sensibles deben configurarse en el archivo `.env`:

```env
# Base de datos
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Entorno
NODE_ENV=production
```

### Consideraciones de Producción

Para producción, considera:

1. Usar secretos de Docker
2. Configurar SSL/TLS
3. Implementar monitoreo
4. Configurar backups automáticos
5. Usar imágenes optimizadas

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puerto ocupado**:
   ```bash
   # Verificar puertos ocupados
   netstat -ano | findstr :3003
   
   # Cambiar puerto en docker-compose.yml
   ports:
     - "3004:3003"  # Puerto externo diferente
   ```

2. **Volúmenes corruptos**:
   ```bash
   # Limpiar volúmenes
   docker-compose down -v
   docker volume prune
   ```

3. **Problemas de red**:
   ```bash
   # Recrear red
   docker-compose down
   docker network prune
   docker-compose up -d
   ```

4. **Problemas de permisos**:
   ```bash
   # En Linux/macOS
   sudo chown -R $USER:$USER .
   ```

### Logs Útiles

```bash
# Logs de Docker daemon
docker system events

# Información del sistema
docker system info

# Uso de recursos
docker stats
```

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [StudyMate Project Documentation](../README.md)

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama feature
2. Hacer cambios localmente usando Docker
3. Probar con `.\dev.ps1 start`
4. Enviar PR con descripción detallada

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
