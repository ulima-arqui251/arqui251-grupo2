#!/bin/bash

echo "🧪 Testing StudyMate Architecture Alignment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test service health
test_service() {
    local service_name=$1
    local url=$2
    local port=$3
    
    echo -e "\n${BLUE}Testing $service_name...${NC}"
    
    # Wait for service to be ready
    echo "Waiting for $service_name to be ready..."
    for i in {1..30}; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    echo -e "\n${RED}❌ $service_name is not responding${NC}"
    return 1
}

# Function to test API endpoints
test_api_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "\n${BLUE}Testing $description...${NC}"
    
    if curl -f -s "$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $description is working${NC}"
        return 0
    else
        echo -e "${RED}❌ $description is not working${NC}"
        return 1
    fi
}

# Start services
echo -e "\n${YELLOW}Starting StudyMate services...${NC}"
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Test individual services
echo -e "\n${YELLOW}Testing Individual Services:${NC}"

test_service "MySQL Database" "http://localhost:3307" "3307"
test_service "Content Service" "http://localhost:3003/health" "3003"
test_service "User Service" "http://localhost:3005/health" "3005"
test_service "API Gateway" "http://localhost:3001/health" "3001"
test_service "Frontend" "http://localhost:80" "80"
test_service "Redis" "http://localhost:6379" "6379"
test_service "phpMyAdmin" "http://localhost:8080" "8080"

# Test API Gateway routing
echo -e "\n${YELLOW}Testing API Gateway Routing:${NC}"

test_api_endpoint "http://localhost:3001/api/content/courses" "Content Service via API Gateway"
test_api_endpoint "http://localhost:3001/api/auth/health" "User Service via API Gateway"

# Test frontend integration
echo -e "\n${YELLOW}Testing Frontend Integration:${NC}"

if curl -f -s "http://localhost:80" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

# Summary
echo -e "\n${YELLOW}Architecture Alignment Summary:${NC}"
echo "=========================================="

echo -e "\n${BLUE}Services Status:${NC}"
docker-compose ps

echo -e "\n${BLUE}API Endpoints:${NC}"
echo "• API Gateway: http://localhost:3001"
echo "• Content Service: http://localhost:3003"
echo "• User Service: http://localhost:3005"
echo "• Frontend: http://localhost:80"
echo "• phpMyAdmin: http://localhost:8080"

echo -e "\n${BLUE}Health Checks:${NC}"
echo "• API Gateway Health: http://localhost:3001/health"
echo "• Content Service Health: http://localhost:3003/health"
echo "• User Service Health: http://localhost:3005/health"

echo -e "\n${GREEN}✅ Architecture alignment test completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Test user registration and login"
echo "2. Test course creation and management"
echo "3. Test frontend-backend integration"
echo "4. Implement remaining services (Gamification, Community, etc.)" 