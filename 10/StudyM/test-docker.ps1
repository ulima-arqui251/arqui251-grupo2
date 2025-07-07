# Script de prueba de Docker Compose para StudyMate en Windows
Write-Host "🚀 Iniciando prueba de Docker Compose para StudyMate..." -ForegroundColor Green

# Verificar si Docker está instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker está instalado." -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está disponible
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose está disponible." -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está disponible. Por favor instala Docker Compose primero." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del proyecto
Set-Location "c:\Users\USUARIO\Desktop\StudyMate"

# Limpiar contenedores existentes
Write-Host "🧹 Limpiando contenedores existentes..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans

# Construir y levantar servicios
Write-Host "🏗️ Construyendo y levantando servicios..." -ForegroundColor Yellow
docker-compose up --build -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar estado de los servicios
Write-Host "🔍 Verificando estado de los servicios..." -ForegroundColor Yellow
docker-compose ps

# Probar endpoints
Write-Host "🧪 Probando endpoints..." -ForegroundColor Yellow

Write-Host "Probando backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check falló" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend health check falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Probando frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend check exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend check falló" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend check falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Prueba de Docker Compose completada." -ForegroundColor Green
Write-Host "📋 Para ver logs: docker-compose logs" -ForegroundColor Cyan
Write-Host "🛑 Para detener: docker-compose down" -ForegroundColor Cyan
