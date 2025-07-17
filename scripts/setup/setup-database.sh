#!/bin/bash

# Tonmate Database Setup Script
# This script sets up the database for the Tonmate platform

echo "🚀 Setting up Tonmate database..."

# Check if Docker containers are running
if ! docker ps | grep -q tonmate-app; then
    echo "❌ tonmate-app container is not running. Please start it first:"
    echo "   cd docker && docker-compose -f docker-compose.minimal.yml up -d"
    exit 1
fi

if ! docker ps | grep -q tonmate-db; then
    echo "❌ tonmate-db container is not running. Please start it first:"
    echo "   cd docker && docker-compose -f docker-compose.minimal.yml up -d"
    exit 1
fi

echo "✅ Docker containers are running"

# Run database migrations
echo "🔄 Running database migrations..."
docker exec tonmate-app npx prisma migrate deploy

# Generate Prisma client
echo "🔄 Generating Prisma client..."
docker exec tonmate-app npx prisma generate

# Copy migrations to host
echo "🔄 Copying migrations to host..."
docker cp tonmate-app:/app/prisma/migrations ./prisma/

echo "✅ Database setup complete!"
echo ""
echo "Available commands:"
echo "  npm run docker:db:migrate     - Create and apply new migration"
echo "  npm run docker:db:deploy      - Apply existing migrations"
echo "  npm run docker:db:reset       - Reset database (destructive)"
echo "  npm run docker:db:generate    - Generate Prisma client"
echo "  npm run docker:db:studio      - Open Prisma Studio"
echo ""
echo "🎉 Your Tonmate database is ready!"
