#!/bin/bash

echo "🚀 Iniciando prueba de Docker Compose para StudyMate..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados."

# Limpiar contenedores existentes
echo "🧹 Limpiando contenedores existentes..."
docker-compose down --volumes --remove-orphans

# Construir y levantar servicios
echo "🏗️ Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Probar endpoints
echo "🧪 Probando endpoints..."

echo "Probando backend health..."
curl -f http://localhost:3001/api/health || echo "❌ Backend health check falló"

echo "Probando frontend..."
curl -f http://localhost:3000 || echo "❌ Frontend check falló"

echo "✅ Prueba de Docker Compose completada."
echo "📋 Para ver logs: docker-compose logs"
echo "🛑 Para detener: docker-compose down"
