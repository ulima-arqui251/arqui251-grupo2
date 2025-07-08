# StudyMate - Pruebas de Funcionalidades

## Scripts de Prueba

### 1. Configurar Entorno

```bash
# Navegar al directorio del proyecto
cd "C:\Users\USUARIO\Desktop\StudyMate"

# Verificar que los contenedores estén corriendo
docker-compose ps

# Si no están corriendo, iniciarlos
docker-compose up -d

# Verificar salud del sistema
curl http://localhost:3001/health
```

### 2. Pruebas de Autenticación Básica

#### Registro de Usuario
```bash
# Registrar usuario estudiante
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@test.com",
    "password": "Test123456",
    "role": "estudiante"
  }'

# Registrar usuario docente
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "lastName": "García",
    "email": "maria.garcia@test.com",
    "password": "Test123456",
    "role": "docente"
  }'
```

#### Login
```bash
# Login estudiante
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@test.com",
    "password": "Test123456"
  }'

# Guardar el token devuelto para siguientes pruebas
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Pruebas de 2FA

#### Generar QR para 2FA
```bash
curl -X GET http://localhost:3001/api/auth/2fa/qr \
  -H "Authorization: Bearer $TOKEN"
```

#### Habilitar 2FA
```bash
# Primero configura Google Authenticator con el QR
# Luego usa el código de 6 dígitos
curl -X POST http://localhost:3001/api/auth/2fa/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'
```

#### Probar Login con 2FA
```bash
# Paso 1: Login normal (devuelve token temporal)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@test.com",
    "password": "Test123456"
  }'

# Paso 2: Verificar 2FA
curl -X POST http://localhost:3001/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "token_temporal_del_paso_1",
    "twoFactorToken": "123456"
  }'
```

### 4. Pruebas de Gamificación

#### Obtener Estadísticas
```bash
curl -X GET http://localhost:3001/api/gamification/stats/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Ver Ranking Global
```bash
curl -X GET http://localhost:3001/api/gamification/leaderboard/global \
  -H "Authorization: Bearer $TOKEN"
```

#### Obtener Logros
```bash
curl -X GET http://localhost:3001/api/gamification/achievements/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Pruebas de Comunidad

#### Crear Publicación
```bash
curl -X POST http://localhost:3001/api/community/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "¿Alguien puede ayudarme con matemáticas?",
    "content": "Tengo dudas sobre integrales",
    "type": "question",
    "tags": ["matematicas", "calculo"],
    "subject": "Matemáticas",
    "level": "universitario"
  }'
```

#### Obtener Feed
```bash
curl -X GET http://localhost:3001/api/community/feed \
  -H "Authorization: Bearer $TOKEN"
```

#### Crear Grupo de Estudio
```bash
curl -X POST http://localhost:3001/api/community/study-groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grupo de Cálculo",
    "description": "Estudiar cálculo integral",
    "subject": "Matemáticas",
    "level": "universitario",
    "maxMembers": 10,
    "schedule": {
      "day": "lunes",
      "time": "18:00",
      "location": "Biblioteca Central"
    }
  }'
```

### 6. Pruebas de Lecciones

#### Crear Lección (como docente)
```bash
curl -X POST http://localhost:3001/api/lessons \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introducción a las Integrales",
    "description": "Conceptos básicos de integración",
    "content": "# Integrales\n\nUna integral es...",
    "subject": "Matemáticas",
    "level": "universitario",
    "difficulty": "intermedio",
    "duration": 45,
    "points": 100
  }'
```

#### Completar Lección (como estudiante)
```bash
curl -X POST http://localhost:3001/api/lessons/1/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "timeSpent": 30,
    "answers": {
      "question1": "A",
      "question2": "B"
    }
  }'
```

### 7. Pruebas de Control de Acceso

#### Endpoint Solo para Docentes
```bash
# Esto debe fallar con token de estudiante
curl -X GET http://localhost:3001/api/teacher/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Esto debe funcionar con token de docente
curl -X GET http://localhost:3001/api/teacher/dashboard \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

#### Endpoint Solo para Admins
```bash
# Esto debe fallar con token de estudiante/docente
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

## Pruebas desde el Frontend

### 1. Acceder a la Aplicación
```bash
# Abrir navegador en
http://localhost:3000
```

### 2. Flujo de Registro
1. Hacer clic en "Registrarse"
2. Llenar formulario con datos válidos
3. Verificar redirección al dashboard
4. Comprobar que el token se guarda en localStorage

### 3. Flujo de Login
1. Cerrar sesión
2. Hacer clic en "Iniciar Sesión"
3. Usar credenciales registradas
4. Verificar acceso al dashboard

### 4. Configurar 2FA
1. Ir a Perfil > Configuración
2. Habilitar 2FA
3. Escanear QR con Google Authenticator
4. Verificar código de 6 dígitos
5. Cerrar sesión y probar login con 2FA

### 5. Explorar Funcionalidades
1. **Dashboard**: Verificar métricas y progreso
2. **Lecciones**: Completar una lección
3. **Comunidad**: Crear una publicación
4. **Perfil**: Actualizar información personal
5. **Gamificación**: Verificar puntos y logros

## Métricas de Rendimiento

### Pruebas de Carga Básicas

#### Múltiples Logins Concurrentes
```bash
# Crear script de prueba
cat > test_concurrent_logins.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test'$i'@example.com",
      "password": "Test123456"
    }' &
done
wait
EOF

chmod +x test_concurrent_logins.sh
./test_concurrent_logins.sh
```

#### Tiempo de Respuesta
```bash
# Medir tiempo de respuesta del health check
time curl -w "@curl-format.txt" -o /dev/null http://localhost:3001/health

# Crear archivo de formato
cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

## Validación de Logs

### Verificar Logs del Backend
```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Buscar errores específicos
docker-compose logs backend | grep -i error

# Verificar logs de autenticación
docker-compose logs backend | grep -i "auth\|login\|2fa"
```

### Verificar Logs del Frontend
```bash
# Ver logs del frontend
docker-compose logs frontend

# Verificar logs de nginx
docker-compose logs frontend | grep -i nginx
```

### Verificar Logs de Base de Datos
```bash
# Ver logs de MySQL
docker-compose logs mysql

# Verificar conexiones
docker-compose logs mysql | grep -i "connection\|connect"
```

##  Solución de Problemas Comunes

### Error: "Token inválido"
```bash
# Verificar formato del token
echo $TOKEN | base64 -d

# Generar nuevo token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123456"}'
```

### Error: "Conexión rechazada"
```bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart backend

# Verificar conectividad
curl -I http://localhost:3001/health
```

### Error: "2FA no funciona"
```bash
# Verificar que el usuario tenga 2FA habilitado
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Verificar estado de 2FA
curl -X GET http://localhost:3001/api/auth/2fa/status \
  -H "Authorization: Bearer $TOKEN"
```

X/10
- Errores encontrados: X


