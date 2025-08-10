#!/bin/bash

# YoungHouse Web Deployment Script
echo "🚀 Starting YoungHouse Web deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p logs
mkdir -p backend/uploads

# Copy environment file
if [ ! -f .env ]; then
    if [ -f env.production.example ]; then
        print_warning "No .env file found. Copying from env.production.example..."
        cp env.production.example .env
        print_warning "Please edit .env file with your actual configuration before proceeding."
        read -p "Press Enter after editing .env file..."
    else
        print_error "No environment file found. Please create .env file first."
        exit 1
    fi
fi

# Build and start the application
print_status "Building Docker images..."
docker-compose build

print_status "Starting services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment completed successfully!"
    print_status "Your application should be accessible at:"
    print_status "- HTTP: http://localhost"
    print_status "- HTTPS: https://localhost (if SSL is configured)"
    print_status "- API: http://localhost/api"
else
    print_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show useful commands
echo ""
print_status "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - View container status: docker-compose ps"
echo ""
print_status "🎉 Deployment completed!"