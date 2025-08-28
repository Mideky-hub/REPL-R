# REPL-ay Docker Setup Script for Windows PowerShell

Write-Host "🚀 Setting up REPL-ay with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "📋 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env file with your actual values before continuing" -ForegroundColor Yellow
    Write-Host "   - Set your Google OAuth credentials" -ForegroundColor Yellow
    Write-Host "   - Update database passwords" -ForegroundColor Yellow
    Write-Host "   - Configure other environment variables" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter when you've updated the .env file"
}

Write-Host "✅ Environment file exists" -ForegroundColor Green

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "database" | Out-Null
New-Item -ItemType Directory -Force -Path "nginx" | Out-Null
New-Item -ItemType Directory -Force -Path "repl-ay-app\certs" | Out-Null

Write-Host "✅ Directories created" -ForegroundColor Green

# Check if SSL certificates exist
if (!(Test-Path "repl-ay-app\certs\localhost.pem") -or !(Test-Path "repl-ay-app\certs\localhost-key.pem")) {
    Write-Host "🔒 SSL certificates not found. Please run the following commands to create them:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "cd repl-ay-app" -ForegroundColor White
    Write-Host "mkdir certs" -ForegroundColor White
    Write-Host "mkcert -install" -ForegroundColor White
    Write-Host "mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter when SSL certificates are created"
}

Write-Host "✅ SSL certificates check completed" -ForegroundColor Green

# Build and start services
Write-Host "🏗️  Building Docker containers..." -ForegroundColor Cyan
docker-compose build --no-cache

Write-Host "🎯 Starting services..." -ForegroundColor Cyan
docker-compose up -d postgres redis

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check database health
Write-Host "🏥 Checking database health..." -ForegroundColor Cyan
$dbHealth = docker-compose exec postgres pg_isready -U replay_user -d replay_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Database is not ready. Please check logs: docker-compose logs postgres" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting application..." -ForegroundColor Cyan
docker-compose up -d app

Write-Host "⏳ Waiting for application to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check application health
Write-Host "🏥 Checking application health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application is ready" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 REPL-ay is now running!" -ForegroundColor Green
        Write-Host "   🌐 Application: https://localhost:3000" -ForegroundColor White
        Write-Host "   🗄️  Database: postgresql://localhost:5432/replay_db" -ForegroundColor White
        Write-Host "   🔴 Redis: redis://localhost:6379" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 To view logs: docker-compose logs -f" -ForegroundColor Cyan
        Write-Host "⚠️  To stop: docker-compose down" -ForegroundColor Yellow
        Write-Host "🧹 To clean up: docker-compose down -v" -ForegroundColor Magenta
    } else {
        throw "HTTP $($response.StatusCode)"
    }
}
catch {
    Write-Host "❌ Application failed to start. Please check logs: docker-compose logs app" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green