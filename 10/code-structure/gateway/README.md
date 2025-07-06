# StudyMate API Gateway

## Descripción
Gateway centralizado para todos los microservicios de StudyMate.

## Características
- ✅ Proxy reverso para microservicios
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Seguridad con Helmet
- ✅ Health checks
- ✅ Manejo de errores

## Endpoints
- `GET /health` - Health check del gateway
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/auth/profile` - Perfil del usuario autenticado
- `GET /api/content/*` - Endpoints de contenido

## Configuración
El gateway redirige las peticiones a los siguientes servicios:
- User Service: `http://user-service:3005`
- Content Service: `http://content-service:3003`

## Uso
```bash
npm install
npm start
```

El gateway estará disponible en `http://localhost:3000`
