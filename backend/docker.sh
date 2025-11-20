#!/bin/bash

# Expense Tracker Backend - Docker Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_status "Creating .env file from .env.example"
        cp .env.example .env
        print_warning "Please update .env with your AWS credentials"
        exit 1
    fi
}

# Main commands
case "${1:-help}" in
    build)
        print_status "Building Docker image..."
        docker build -t expense-tracker-backend:latest .
        print_status "Image built successfully!"
        ;;

    up)
        check_env_file
        print_status "Starting container with Docker Compose..."
        docker-compose up -d
        print_status "Container started!"
        print_status "Backend available at http://localhost:3001"
        print_status "Health check: curl http://localhost:3001/health"
        ;;

    down)
        print_status "Stopping container..."
        docker-compose down
        print_status "Container stopped"
        ;;

    logs)
        print_status "Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f expense-tracker-backend
        ;;

    restart)
        print_status "Restarting container..."
        docker-compose restart
        print_status "Container restarted"
        ;;

    status)
        print_status "Container status:"
        docker-compose ps
        ;;

    test)
        print_status "Testing health endpoint..."
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_status "✓ Health check passed"
        else
            print_error "✗ Health check failed"
            exit 1
        fi
        ;;

    shell)
        print_status "Opening shell in container..."
        docker-compose exec expense-tracker-backend /bin/sh
        ;;

    clean)
        print_status "Cleaning up Docker resources..."
        docker-compose down
        docker image rm expense-tracker-backend:latest || true
        print_status "Cleanup complete"
        ;;

    *)
        echo "Expense Tracker Backend - Docker Helper"
        echo ""
        echo "Usage: ./docker.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build     - Build Docker image"
        echo "  up        - Start container with Docker Compose"
        echo "  down      - Stop container"
        echo "  logs      - View container logs"
        echo "  restart   - Restart container"
        echo "  status    - Show container status"
        echo "  test      - Test health endpoint"
        echo "  shell     - Open shell in container"
        echo "  clean     - Remove container and image"
        echo "  help      - Show this help message"
        echo ""
        echo "Requirements:"
        echo "  - .env file with AWS credentials (copy from .env.example)"
        echo "  - Docker and Docker Compose installed"
        echo ""
        ;;
esac
