# Expense Tracker Backend - Docker Helper Script (PowerShell)

param(
    [string]$Command = "help"
)

# Colors
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Print-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $SuccessColor
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $WarningColor
}

function Check-EnvFile {
    if (-not (Test-Path .env)) {
        Print-Warning ".env file not found"
        Print-Status "Creating .env file from .env.example"
        if (Test-Path .env.example) {
            Copy-Item .env.example .env
            Print-Warning "Please update .env with your AWS credentials"
        }
        else {
            Print-Error ".env.example not found"
        }
        exit 1
    }
}

# Main switch
switch ($Command) {
    "build" {
        Print-Status "Building Docker image..."
        docker build -t expense-tracker-backend:latest .
        Print-Status "Image built successfully!"
        break
    }

    "up" {
        Check-EnvFile
        Print-Status "Starting container with Docker Compose..."
        docker-compose up -d
        Print-Status "Container started!"
        Print-Status "Backend available at http://localhost:3001"
        Print-Status "Health check: curl http://localhost:3001/health"
        break
    }

    "down" {
        Print-Status "Stopping container..."
        docker-compose down
        Print-Status "Container stopped"
        break
    }

    "logs" {
        Print-Status "Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f expense-tracker-backend
        break
    }

    "restart" {
        Print-Status "Restarting container..."
        docker-compose restart
        Print-Status "Container restarted"
        break
    }

    "status" {
        Print-Status "Container status:"
        docker-compose ps
        break
    }

    "test" {
        Print-Status "Testing health endpoint..."
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Print-Status "✓ Health check passed"
            }
            else {
                Print-Error "✗ Health check failed with status code: $($response.StatusCode)"
                exit 1
            }
        }
        catch {
            Print-Error "✗ Health check failed: $_"
            exit 1
        }
        break
    }

    "shell" {
        Print-Status "Opening shell in container..."
        docker-compose exec expense-tracker-backend sh
        break
    }

    "clean" {
        Print-Status "Cleaning up Docker resources..."
        docker-compose down
        docker image rm expense-tracker-backend:latest -ErrorAction SilentlyContinue
        Print-Status "Cleanup complete"
        break
    }

    default {
        Write-Host "Expense Tracker Backend - Docker Helper" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\docker.ps1 -Command [command]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  build     - Build Docker image"
        Write-Host "  up        - Start container with Docker Compose"
        Write-Host "  down      - Stop container"
        Write-Host "  logs      - View container logs"
        Write-Host "  restart   - Restart container"
        Write-Host "  status    - Show container status"
        Write-Host "  test      - Test health endpoint"
        Write-Host "  shell     - Open shell in container"
        Write-Host "  clean     - Remove container and image"
        Write-Host "  help      - Show this help message"
        Write-Host ""
        Write-Host "Requirements:"
        Write-Host "  - .env file with AWS credentials (copy from .env.example)"
        Write-Host "  - Docker and Docker Compose installed"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\docker.ps1 -Command build"
        Write-Host "  .\docker.ps1 -Command up"
        Write-Host "  .\docker.ps1 -Command logs"
        Write-Host ""
    }
}
