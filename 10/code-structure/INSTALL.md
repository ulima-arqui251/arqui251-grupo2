# StudyMate - Setup Initial

Este archivo contiene los comandos necesarios para configurar e instalar el proyecto StudyMate por primera vez.

## 1. Instalación de Dependencias

```powershell
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias específicas que faltan
cd backend/auth-service
npm install nodemailer @types/nodemailer speakeasy @types/speakeasy qrcode @types/qrcode sequelize-cli compression @types/compression
cd ../..

cd backend/api-gateway  
npm install compression @types/compression
cd ../..
```

## 2. Configuración de Base de Datos MySQL

```powershell
# Crear usuario y base de datos (ejecutar en MySQL como root)
mysql -u root -p
```

```sql
CREATE DATABASE studymate_dev;
CREATE USER 'studymate'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON studymate_dev.* TO 'studymate'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Configurar Variables de Entorno

```powershell
# Configurar auth service
cd backend/auth-service
cp .env.example .env
# Editar .env con tus configuraciones específicas

cd ../api-gateway
# Crear .env para API Gateway
echo "PORT=3001" > .env
echo "NODE_ENV=development" >> .env
echo "AUTH_SERVICE_URL=http://localhost:3005" >> .env
cd ../..
```

## 4. Ejecutar Migraciones

```powershell
cd backend/auth-service
npm run db:migrate
cd ../..
```

## 5. Instalar Dependencias Frontend

```powershell
cd frontend/student-app
npm install
cd ../..
```

## 6. Ejecutar en Desarrollo

```powershell
# Ejecutar todo en paralelo
npm run dev:all

# O ejecutar servicios individuales:
# Terminal 1: API Gateway
npm run dev:gateway

# Terminal 2: Auth Service  
npm run dev:auth

# Terminal 3: Frontend Student
npm run dev:student
```

## 7. Verificar Instalación

```powershell
# Health checks
curl http://localhost:3001/health        # API Gateway
curl http://localhost:3005/api/auth/health    # Auth Service
```

## Puertos por Defecto

- **API Gateway**: 3001
- **Auth Service**: 3005  
- **Student App**: 3000
- **Teacher Panel**: 3002
- **Admin Panel**: 3003

## Siguientes Pasos

1. ✅ Configurar base de datos MySQL
2. ✅ Instalar dependencias  
3. ✅ Configurar variables de entorno
4. ✅ Ejecutar migraciones
5. 🔄 Probar flujo de registro y login
6. ⏳ Implementar módulo de lecciones
7. ⏳ Crear interfaces de frontend

---

**Nota**: Asegúrate de tener MySQL corriendo en tu sistema antes de ejecutar las migraciones.
