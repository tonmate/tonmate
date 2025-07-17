#!/bin/bash

# Tonmate - Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Deploying Tonmate..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
BUILD_ONLY=false
SKIP_TESTS=false
SKIP_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --env ENV        Set environment (default: production)"
            echo "  --build-only         Only build, don't deploy"
            echo "  --skip-tests         Skip running tests"
            echo "  --skip-build         Skip building (use existing build)"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Environment: $ENVIRONMENT"
echo "Build only: $BUILD_ONLY"
echo "Skip tests: $SKIP_TESTS"
echo "Skip build: $SKIP_BUILD"
echo ""

# Check if required files exist
REQUIRED_FILES=(".env.local" "package.json" "next.config.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file '$file' not found${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Required files found${NC}"

# Check if Docker is installed for production deployment
if [ "$ENVIRONMENT" == "production" ] && ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Required for production deployment.${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" == "production" ] && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Required for production deployment.${NC}"
    exit 1
fi

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    npm run test
    echo -e "${GREEN}✅ Tests passed${NC}"
fi

# Run type checking
echo -e "${YELLOW}🔍 Running type checks...${NC}"
npm run type-check
echo -e "${GREEN}✅ Type checks passed${NC}"

# Run linting
echo -e "${YELLOW}🔧 Running linter...${NC}"
npm run lint
echo -e "${GREEN}✅ Linting passed${NC}"

# Build application (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}🏗️  Building application...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
fi

# Exit if build-only mode
if [ "$BUILD_ONLY" = true ]; then
    echo -e "${GREEN}🎉 Build complete! (Build-only mode)${NC}"
    exit 0
fi

# Deploy based on environment
case $ENVIRONMENT in
    "development")
        echo -e "${YELLOW}🚀 Starting development server...${NC}"
        npm run dev
        ;;
    "production")
        echo -e "${YELLOW}🚀 Deploying to production with Docker...${NC}"
        
        # Check if production environment file exists
        if [ ! -f ".env.production" ]; then
            echo -e "${RED}❌ .env.production file not found. Create it with production settings.${NC}"
            exit 1
        fi
        
        # Build and start production containers
        cd docker
        docker-compose -f docker-compose.prod.yml --env-file ../.env.production build
        docker-compose -f docker-compose.prod.yml --env-file ../.env.production up -d
        cd ..
        
        echo -e "${GREEN}✅ Production deployment started${NC}"
        echo -e "${BLUE}📋 Container status:${NC}"
        cd docker && docker-compose -f docker-compose.prod.yml ps
        
        # Wait for health check
        echo -e "${YELLOW}⏳ Waiting for health check...${NC}"
        sleep 30
        
        # Check if application is healthy
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Application is healthy and running${NC}"
        else
            echo -e "${RED}❌ Application health check failed${NC}"
            echo -e "${YELLOW}📋 Container logs:${NC}"
            docker-compose -f docker-compose.prod.yml logs --tail=50
            exit 1
        fi
        ;;
    "docker-dev")
        echo -e "${YELLOW}🚀 Starting development environment with Docker...${NC}"
        cd docker && docker-compose up -d
        echo -e "${GREEN}✅ Development environment started${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        echo "Supported environments: development, production, docker-dev"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
if [ "$ENVIRONMENT" == "production" ]; then
    echo "- Monitor application logs: cd docker && docker-compose -f docker-compose.prod.yml logs -f"
    echo "- Check container status: cd docker && docker-compose -f docker-compose.prod.yml ps"
    echo "- Access application at: http://localhost:3000"
    echo "- Set up SSL certificate for HTTPS"
    echo "- Configure monitoring and alerting"
elif [ "$ENVIRONMENT" == "development" ]; then
    echo "- Access application at: http://localhost:3000"
    echo "- Monitor console for any errors"
    echo "- Use hot reload for development"
fi
echo ""
echo "🌟 Happy deploying!"
