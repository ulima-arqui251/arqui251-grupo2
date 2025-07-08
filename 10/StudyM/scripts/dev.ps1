# Script para facilitar el desarrollo con Docker en Windows

Write-Host "🚀 StudyMate - Herramientas de Desarrollo" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Selecciona una opción:" -ForegroundColor Yellow
Write-Host "1. Levantar entorno de DESARROLLO (con hot reload)" -ForegroundColor White
Write-Host "2. Levantar entorno de PRODUCCIÓN" -ForegroundColor White
Write-Host "3. Reconstruir solo FRONTEND (producción)" -ForegroundColor White
Write-Host "4. Reconstruir solo BACKEND (producción)" -ForegroundColor White
Write-Host "5. Ver logs" -ForegroundColor White
Write-Host "6. Parar todos los contenedores" -ForegroundColor White
Write-Host "7. Limpiar contenedores y volúmenes" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Opción (1-7)"

switch ($choice) {
    1 {
        Write-Host "🔧 Levantando entorno de DESARROLLO..." -ForegroundColor Blue
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up --build -d
        Write-Host "✅ Entorno de desarrollo disponible en:" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000 (con hot reload)" -ForegroundColor Cyan
        Write-Host "   Backend: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "   MySQL: localhost:3307" -ForegroundColor Cyan
    }
    2 {
        Write-Host "🏭 Levantando entorno de PRODUCCIÓN..." -ForegroundColor Blue
        docker-compose down
        docker-compose up --build -d
        Write-Host "✅ Entorno de producción disponible en:" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   Backend: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "   MySQL: localhost:3307" -ForegroundColor Cyan
    }
    3 {
        Write-Host "🔄 Reconstruyendo solo FRONTEND..." -ForegroundColor Blue
        docker-compose stop frontend
        docker-compose up --build frontend -d
        Write-Host "✅ Frontend reconstruido" -ForegroundColor Green
    }
    4 {
        Write-Host "🔄 Reconstruyendo solo BACKEND..." -ForegroundColor Blue
        docker-compose stop backend
        docker-compose up --build backend -d
        Write-Host "✅ Backend reconstruido" -ForegroundColor Green
    }
    5 {
        Write-Host "📋 Mostrando logs..." -ForegroundColor Blue
        docker-compose logs -f
    }
    6 {
        Write-Host "🛑 Parando contenedores..." -ForegroundColor Blue
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        Write-Host "✅ Todos los contenedores parados" -ForegroundColor Green
    }
    7 {
        Write-Host "🧹 Limpiando contenedores y volúmenes..." -ForegroundColor Blue
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
        exit 1
    }
} 