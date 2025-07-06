# StudyMate Development Environment - PowerShell Script
# Run this script to manage your StudyMate Docker environment on Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Service
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-ColorOutput $Red "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
}

# Function to check if docker-compose is available
function Test-Compose {
    try {
        docker-compose --version | Out-Null
        return $true
    } catch {
        Write-ColorOutput $Red "❌ docker-compose is not installed. Please install it and try again."
        exit 1
    }
}

# Function to copy environment file
function Initialize-Environment {
    if (-not (Test-Path ".env")) {
        Write-ColorOutput $Yellow "⚠️  No .env file found. Copying from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-ColorOutput $Green "✅ Created .env file. Please review and modify it if needed."
    }
}

# Function to build and start all services
function Start-AllServices {
    Write-ColorOutput $Blue "🚀 Starting all StudyMate services..."
    docker-compose up -d --build
    Write-ColorOutput $Green "✅ All services started successfully!"
    Write-ColorOutput $Blue "📱 Frontend: http://localhost"
    Write-ColorOutput $Blue "🔧 Content Service API: http://localhost:3003"
    Write-ColorOutput $Blue "🗄️  phpMyAdmin: http://localhost:8080"
    Write-ColorOutput $Blue "📊 Health checks: http://localhost:3003/health"
}

# Function to stop all services
function Stop-AllServices {
    Write-ColorOutput $Yellow "🛑 Stopping all StudyMate services..."
    docker-compose down
    Write-ColorOutput $Green "✅ All services stopped!"
}

# Function to restart all services
function Restart-AllServices {
    Write-ColorOutput $Blue "🔄 Restarting all StudyMate services..."
    docker-compose restart
    Write-ColorOutput $Green "✅ All services restarted!"
}

# Function to show logs
function Show-Logs {
    if ([string]::IsNullOrEmpty($Service)) {
        Write-ColorOutput $Blue "📋 Showing logs for all services..."
        docker-compose logs -f
    } else {
        Write-ColorOutput $Blue "📋 Showing logs for $Service..."
        docker-compose logs -f $Service
    }
}

# Function to run database seed
function Initialize-Database {
    Write-ColorOutput $Blue "🌱 Seeding database..."
    docker-compose exec content-service npm run dev:init
    Write-ColorOutput $Green "✅ Database seeded successfully!"
}

# Function to show service status
function Show-Status {
    Write-ColorOutput $Blue "📊 Service Status:"
    docker-compose ps
}

# Function to clean up (remove containers, networks, volumes)
function Remove-AllResources {
    Write-ColorOutput $Yellow "🧹 Cleaning up all containers, networks, and volumes..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    Write-ColorOutput $Green "✅ Cleanup completed!"
}

# Function to enter a service shell
function Enter-ServiceShell {
    if ([string]::IsNullOrEmpty($Service)) {
        Write-ColorOutput $Red "❌ Please specify a service name (content-service, frontend, mysql, redis)"
        exit 1
    }
    Write-ColorOutput $Blue "🐚 Entering shell for $Service..."
    docker-compose exec $Service /bin/sh
}

# Function to show help
function Show-Help {
    Write-ColorOutput $Blue "StudyMate Development Environment"
    Write-ColorOutput $Blue "================================="
    Write-Host ""
    Write-ColorOutput $Green "Available commands:"
    Write-Host "  start    - Build and start all services"
    Write-Host "  stop     - Stop all services"
    Write-Host "  restart  - Restart all services"
    Write-Host "  logs     - Show logs (optionally specify service name)"
    Write-Host "  seed     - Seed the database with initial data"
    Write-Host "  status   - Show service status"
    Write-Host "  clean    - Clean up containers, networks, and volumes"
    Write-Host "  shell    - Enter shell for a service (specify service name)"
    Write-Host ""
    Write-ColorOutput $Blue "Examples:"
    Write-Host "  .\dev.ps1 start"
    Write-Host "  .\dev.ps1 logs -Service content-service"
    Write-Host "  .\dev.ps1 shell -Service mysql"
    Write-Host "  .\dev.ps1 seed"
}

# Main script logic
Test-Docker
Test-Compose

switch ($Action.ToLower()) {
    "start" {
        Initialize-Environment
        Start-AllServices
    }
    "stop" {
        Stop-AllServices
    }
    "restart" {
        Restart-AllServices
    }
    "logs" {
        Show-Logs
    }
    "seed" {
        Initialize-Database
    }
    "status" {
        Show-Status
    }
    "clean" {
        Remove-AllResources
    }
    "shell" {
        Enter-ServiceShell
    }
    default {
        Show-Help
    }
}
