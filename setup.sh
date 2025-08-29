#!/bin/bash

# REPL-ay Docker Setup Script

echo "🚀 Setting up REPL-ay with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values before continuing"
    echo "   - Set your Google OAuth credentials"
    echo "   - Update database passwords"
    echo "   - Configure other environment variables"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
fi

echo "✅ Environment file exists"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p database
mkdir -p nginx
mkdir -p repl-ay-app/certs

echo "✅ Directories created"

# Check if SSL certificates exist
if [ ! -f "repl-ay-app/certs/localhost.pem" ] || [ ! -f "repl-ay-app/certs/localhost-key.pem" ]; then
    echo "🔒 SSL certificates not found. Please run the following commands to create them:"
    echo ""
    echo "cd repl-ay-app"
    echo "mkdir -p certs"
    echo "mkcert -install"
    echo "mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1"
    echo ""
    read -p "Press Enter when SSL certificates are created..."
fi

echo "✅ SSL certificates check completed"

# Build and start services
echo "🏗️  Building Docker containers..."
docker-compose build --no-cache

echo "🎯 Starting services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

# Check database health
echo "🏥 Checking database health..."
docker-compose exec postgres pg_isready -U replay_user -d replay_db

if [ $? -eq 0 ]; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready. Please check logs: docker-compose logs postgres"
    exit 1
fi

echo "🚀 Starting application..."
docker-compose up -d app

echo "⏳ Waiting for application to be ready..."
sleep 15

# Check application health
echo "🏥 Checking application health..."
curl -f http://localhost:3000/api/health > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Application is ready"
    echo ""
    echo "🎉 REPL-ay is now running!"
    echo "   🌐 Application: https://localhost:3000"
    echo "   🗄️  Database: postgresql://localhost:5432/replay_db"
    echo "   🔴 Redis: redis://localhost:6379"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "⚠️  To stop: docker-compose down"
    echo "🧹 To clean up: docker-compose down -v"
else
    echo "❌ Application failed to start. Please check logs: docker-compose logs app"
    exit 1
fi

echo "✅ Setup completed successfully!"