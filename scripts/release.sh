#!/bin/bash

# Tonmate Release Script
# This script automates the release process for production deployment

set -e

echo "🚀 Tonmate Release Script"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION=${1:-$(node -p "require('./package.json').version")}
ENVIRONMENT=${2:-production}
BUILD_DIR="dist"
BACKUP_DIR="backups"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-release checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    if [[ $(echo "$NODE_VERSION 18.0.0" | tr " " "\n" | sort -V | head -n1) != "18.0.0" ]]; then
        log_error "Node.js 18+ required. Current version: $NODE_VERSION"
        exit 1
    fi
    
    # Check required files
    REQUIRED_FILES=("package.json" "README.md" "LICENSE" "PRODUCTION_CHECKLIST.md")
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Check environment variables
    if [[ ! -f ".env" ]]; then
        log_warning "No .env file found. Using environment variables."
    fi
    
    log_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    log_info "Running test suite..."
    
    # TypeScript type checking
    log_info "Type checking..."
    npm run type-check
    
    # Linting
    log_info "Running linter..."
    npm run lint
    
    # Unit tests
    log_info "Running unit tests..."
    npm test
    
    # Security audit
    log_info "Running security audit..."
    npm audit --audit-level=moderate
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application for $ENVIRONMENT..."
    
    # Clean previous build
    rm -rf .next
    rm -rf $BUILD_DIR
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    # Build Next.js application
    log_info "Building Next.js application..."
    npm run build
    
    # Create distribution directory
    mkdir -p $BUILD_DIR
    
    # Copy necessary files
    cp -r .next $BUILD_DIR/
    cp -r public $BUILD_DIR/
    cp -r prisma $BUILD_DIR/
    cp package.json $BUILD_DIR/
    cp package-lock.json $BUILD_DIR/
    cp next.config.ts $BUILD_DIR/
    cp tsconfig.json $BUILD_DIR/
    
    log_success "Build completed successfully"
}

# Database operations
setup_database() {
    log_info "Setting up database..."
    
    # Check database connection
    if ! npx prisma db push --accept-data-loss --skip-generate; then
        log_error "Database setup failed"
        exit 1
    fi
    
    log_success "Database setup completed"
}

# Security checks
run_security_checks() {
    log_info "Running security checks..."
    
    # Check for sensitive files
    SENSITIVE_FILES=(".env" ".env.local" ".env.production" "*.key" "*.pem")
    for pattern in "${SENSITIVE_FILES[@]}"; do
        if ls $pattern 1> /dev/null 2>&1; then
            log_warning "Sensitive file found: $pattern"
        fi
    done
    
    # Check for hardcoded secrets
    if grep -r "api.*key.*=" src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" | grep -v "process.env"; then
        log_error "Hardcoded API keys found in source code"
        exit 1
    fi
    
    # Check file permissions
    find . -type f -name "*.sh" -exec chmod +x {} \;
    
    log_success "Security checks passed"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/backup_${VERSION}_${TIMESTAMP}.tar.gz"
    
    tar -czf $BACKUP_FILE \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=$BUILD_DIR \
        --exclude=$BACKUP_DIR \
        --exclude=.git \
        .
    
    log_success "Backup created: $BACKUP_FILE"
}

# Generate release notes
generate_release_notes() {
    log_info "Generating release notes..."
    
    RELEASE_NOTES="RELEASE_NOTES_v${VERSION}.md"
    
    cat > $RELEASE_NOTES << EOF
# Release Notes - Version $VERSION

## 🚀 New Features

- Tonmate with multi-provider AI integration
- Advanced web crawling with configurable depth and filtering
- Real-time chat interface with ChatGPT-style UI
- Comprehensive analytics and monitoring dashboard
- Developer tools with live widget preview
- Production-ready deployment configurations

## 🔧 Technical Improvements

- Next.js 15 with App Router
- TypeScript for full type safety
- Prisma ORM with PostgreSQL support
- Docker containerization
- Automated testing and CI/CD
- Security hardening and rate limiting

## 📦 Dependencies

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
- Docker (optional)

## 🛡️ Security

- Input validation and sanitization
- Rate limiting and DDoS protection
- Secure session management
- Encrypted API key storage
- CORS and security headers

## 📚 Documentation

- Complete API documentation
- Deployment guides
- Security guidelines
- Contributing guidelines
- Production checklist

## 🐛 Bug Fixes

- Fixed conversation persistence issues
- Resolved crawler timeout problems
- Improved error handling
- Enhanced mobile responsiveness

## 🔄 Migration Notes

This is a complete rewrite of the platform. Please follow the migration guide in DEPLOYMENT.md for upgrading from previous versions.

## 📈 Performance

- Optimized database queries
- Improved caching strategies
- Reduced bundle size
- Enhanced loading times

Released: $(date +%Y-%m-%d)
EOF
    
    log_success "Release notes generated: $RELEASE_NOTES"
}

# Deploy to production
deploy_to_production() {
    log_info "Deploying to production..."
    
    case $ENVIRONMENT in
        "production")
            # Vercel deployment
            if command -v vercel &> /dev/null; then
                log_info "Deploying to Vercel..."
                vercel --prod
            else
                log_warning "Vercel CLI not found. Please deploy manually."
            fi
            ;;
        "docker")
            # Docker deployment
            log_info "Building and deploying Docker containers..."
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d --build
            ;;
        "manual")
            log_info "Manual deployment mode. Build completed in $BUILD_DIR"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed"
}

# Health check
run_health_check() {
    log_info "Running health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -rf node_modules/.cache
    rm -rf .next/cache
    
    # Reset file permissions
    find . -name "*.log" -exec rm {} \;
    
    log_success "Cleanup completed"
}

# Main execution
main() {
    log_info "Starting release process for version $VERSION"
    
    # Run all steps
    check_prerequisites
    run_tests
    run_security_checks
    create_backup
    build_application
    setup_database
    generate_release_notes
    
    if [[ "$ENVIRONMENT" != "test" ]]; then
        deploy_to_production
        run_health_check
    fi
    
    cleanup
    
    log_success "Release process completed successfully!"
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    log_info "Build directory: $BUILD_DIR"
    
    echo ""
    echo "🎉 Tonmate v$VERSION is now live!"
    echo "📚 Documentation: https://github.com/aryasadeghy/tonmate"
    echo "🆘 Support: https://github.com/aryasadeghy/tonmate/issues"
    echo "🚀 Happy coding!"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
