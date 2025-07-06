# StudyMate - Estructura Inicial de Código

Este directorio contiene la estructura inicial del código para el proyecto StudyMate, siguiendo las decisiones arquitectónicas documentadas en la sección 4.5.

## Estructura del Proyecto

```
code-structure/
├── frontend/
│   ├── student-app/          # Aplicación web para estudiantes (Next.js)
│   ├── teacher-panel/        # Panel para docentes (Next.js)
│   └── admin-panel/          # Panel administrativo (Next.js)
└── backend/
    ├── api-gateway/          # Gateway principal (Express)
    ├── auth-service/         # Servicio de autenticación
    ├── lesson-service/       # Servicio de lecciones
    ├── gamification-service/ # Servicio de gamificación
    ├── community-service/    # Servicio de comunidad
    ├── premium-service/      # Servicio premium
    └── institutional-service/ # Servicio institucional
```

## Tecnologías Implementadas

### Frontend
- **Next.js 14**: Framework React con App Router, SSR/SSG
- **TypeScript**: Tipado estático para mejor mantenibilidad
- **Tailwind CSS**: Framework CSS utilitario
- **Zustand**: Gestión de estado global
- **React Query**: Manejo de estado del servidor

### Backend
- **Node.js + Express**: Runtime y framework web
- **TypeScript**: Tipado estático
- **Sequelize + MySQL**: ORM y base de datos
- **JWT**: Autenticación sin estado
- **bcryptjs**: Encriptación de contraseñas

## Cumplimiento de Escenarios

La estructura está diseñada para cumplir los escenarios de calidad definidos:

- **ESC-06**: 1000 usuarios simultáneos → Arquitectura escalable con Next.js SSG
- **ESC-09**: Navegación ≤ 2 seg → App Router optimizado
- **ESC-21**: Recomendaciones ≤ 500ms → Caché y optimizaciones
- **ESC-01**: Seguridad de autenticación → JWT + bcrypt + rate limiting

## Comandos de Desarrollo

### Frontend (Student App)
```bash
cd frontend/student-app
npm install
npm run dev
```

### Backend (API Gateway)
```bash
cd backend/api-gateway
npm install
npm run dev
```

### Backend (Auth Service)
```bash
cd backend/auth-service
npm install
npm run dev
```

## Variables de Entorno

Cada servicio incluye archivos de configuración para variables de entorno. Ver archivos `.env.example` en cada directorio.

## Próximos Pasos

1. **Completar servicios backend**: Implementar los servicios restantes
2. **Configurar base de datos**: Setup de MySQL y migraciones
3. **Implementar autenticación**: JWT y protección de rutas
4. **Desarrollar componentes frontend**: Interfaces de usuario
5. **Testing**: Pruebas unitarias y de integración
6. **Despliegue**: Configuración de Vercel y Render

## Patrones Arquitectónicos Aplicados

- **Monolito Modular**: Separación clara por servicios
- **API Gateway**: Punto único de entrada
- **Preparación para BFF**: Estructura lista para evolución
- **Microservicios Ready**: Servicios independientes
