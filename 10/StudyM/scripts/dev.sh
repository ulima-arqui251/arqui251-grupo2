#!/bin/bash

# Script para facilitar el desarrollo con Docker

echo "🚀 StudyMate - Herramientas de Desarrollo"
echo "======================================="
echo ""
echo "Selecciona una opción:"
echo "1. Levantar entorno de DESARROLLO (con hot reload)"
echo "2. Levantar entorno de PRODUCCIÓN"
echo "3. Reconstruir solo FRONTEND (producción)"
echo "4. Reconstruir solo BACKEND (producción)"
echo "5. Ver logs"
echo "6. Parar todos los contenedores"
echo "7. Limpiar contenedores y volúmenes"
echo ""
read -p "Opción (1-7): " choice

case $choice in
    1)
        echo "🔧 Levantando entorno de DESARROLLO..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up --build -d
        echo "✅ Entorno de desarrollo disponible en:"
        echo "   Frontend: http://localhost:3000 (con hot reload)"
        echo "   Backend: http://localhost:3001"
        echo "   MySQL: localhost:3307"
        ;;
    2)
        echo "🏭 Levantando entorno de PRODUCCIÓN..."
        docker-compose down
        docker-compose up --build -d
        echo "✅ Entorno de producción disponible en:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend: http://localhost:3001"
        echo "   MySQL: localhost:3307"
        ;;
    3)
        echo "🔄 Reconstruyendo solo FRONTEND..."
        docker-compose stop frontend
        docker-compose up --build frontend -d
        echo "✅ Frontend reconstruido"
        ;;
    4)
        echo "🔄 Reconstruyendo solo BACKEND..."
        docker-compose stop backend
        docker-compose up --build backend -d
        echo "✅ Backend reconstruido"
        ;;
    5)
        echo "📋 Mostrando logs..."
        docker-compose logs -f
        ;;
    6)
        echo "🛑 Parando contenedores..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        echo "✅ Todos los contenedores parados"
        ;;
    7)
        echo "🧹 Limpiando contenedores y volúmenes..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        echo "✅ Limpieza completada"
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac 