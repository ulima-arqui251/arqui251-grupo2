#!/bin/bash

# StudyMate Development Scripts
# Run this script to manage your StudyMate Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_color $RED "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_color $RED "❌ docker-compose is not installed. Please install it and try again."
        exit 1
    fi
}

# Function to copy environment file
setup_env() {
    if [ ! -f .env ]; then
        print_color $YELLOW "⚠️  No .env file found. Copying from .env.example..."
        cp .env.example .env
        print_color $GREEN "✅ Created .env file. Please review and modify it if needed."
    fi
}

# Function to build and start all services
start_all() {
    print_color $BLUE "🚀 Starting all StudyMate services..."
    docker-compose up -d --build
    print_color $GREEN "✅ All services started successfully!"
    print_color $BLUE "📱 Frontend: http://localhost"
    print_color $BLUE "🔧 Content Service API: http://localhost:3003"
    print_color $BLUE "🗄️  phpMyAdmin: http://localhost:8080"
    print_color $BLUE "📊 Health checks: http://localhost:3003/health"
}

# Function to stop all services
stop_all() {
    print_color $YELLOW "🛑 Stopping all StudyMate services..."
    docker-compose down
    print_color $GREEN "✅ All services stopped!"
}

# Function to restart all services
restart_all() {
    print_color $BLUE "🔄 Restarting all StudyMate services..."
    docker-compose restart
    print_color $GREEN "✅ All services restarted!"
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        print_color $BLUE "📋 Showing logs for all services..."
        docker-compose logs -f
    else
        print_color $BLUE "📋 Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to run database seed
seed_database() {
    print_color $BLUE "🌱 Seeding database..."
    docker-compose exec content-service npm run dev:init
    print_color $GREEN "✅ Database seeded successfully!"
}

# Function to show service status
show_status() {
    print_color $BLUE "📊 Service Status:"
    docker-compose ps
}

# Function to clean up (remove containers, networks, volumes)
clean_all() {
    print_color $YELLOW "🧹 Cleaning up all containers, networks, and volumes..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_color $GREEN "✅ Cleanup completed!"
}

# Function to enter a service shell
enter_shell() {
    if [ -z "$1" ]; then
        print_color $RED "❌ Please specify a service name (content-service, frontend, mysql, redis)"
        exit 1
    fi
    print_color $BLUE "🐚 Entering shell for $1..."
    docker-compose exec "$1" /bin/sh
}

# Main script logic
case "$1" in
    "start")
        check_docker
        check_compose
        setup_env
        start_all
        ;;
    "stop")
        check_docker
        check_compose
        stop_all
        ;;
    "restart")
        check_docker
        check_compose
        restart_all
        ;;
    "logs")
        check_docker
        check_compose
        show_logs "$2"
        ;;
    "seed")
        check_docker
        check_compose
        seed_database
        ;;
    "status")
        check_docker
        check_compose
        show_status
        ;;
    "clean")
        check_docker
        check_compose
        clean_all
        ;;
    "shell")
        check_docker
        check_compose
        enter_shell "$2"
        ;;
    *)
        print_color $BLUE "StudyMate Development Environment"
        print_color $BLUE "================================="
        echo ""
        print_color $GREEN "Available commands:"
        echo "  start    - Build and start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs (optionally specify service name)"
        echo "  seed     - Seed the database with initial data"
        echo "  status   - Show service status"
        echo "  clean    - Clean up containers, networks, and volumes"
        echo "  shell    - Enter shell for a service (specify service name)"
        echo ""
        print_color $BLUE "Examples:"
        echo "  ./dev.sh start"
        echo "  ./dev.sh logs content-service"
        echo "  ./dev.sh shell mysql"
        echo "  ./dev.sh seed"
        ;;
esac
