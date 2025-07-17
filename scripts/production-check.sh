#!/bin/bash

# Tonmate - Production Readiness Check
# This script verifies that the platform is ready for production deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

# Check functions
check_required_files() {
    log_info "Checking required files..."
    
    local required_files=(
        "package.json"
        "README.md"
        "LICENSE"
        "CONTRIBUTING.md"
        "SECURITY.md"
        "DEPLOYMENT.md"
        "PRODUCTION_CHECKLIST.md"
        "QUICK_START.md"
        "next.config.ts"
        "tsconfig.json"
        "tailwind.config.js"
        "prisma/schema.prisma"
        "environment.example"
        "environment.production.example"
        "Dockerfile"
        "docker-compose.yml"
        "docker-compose.prod.yml"
        ".dockerignore"
        ".gitignore"
        ".github/workflows/ci.yml"
        ".github/workflows/release.yml"
        ".github/ISSUE_TEMPLATE/bug_report.md"
        ".github/ISSUE_TEMPLATE/feature_request.md"
        ".github/pull_request_template.md"
        "scripts/setup.sh"
        "scripts/deploy.sh"
        "scripts/backup.sh"
        "scripts/monitoring.sh"
        "scripts/security-check.sh"
        "scripts/test.sh"
        "src/middleware.ts"
        "src/lib/auth.ts"
        "src/lib/rate-limiter.ts"
        "src/lib/validation.ts"
        "src/app/api/health/route.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "Required file exists: $file"
        else
            log_error "Missing required file: $file"
        fi
    done
}

check_package_json() {
    log_info "Checking package.json configuration..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        return
    fi
    
    # Check required fields
    local required_fields=("name" "version" "description" "author" "license" "repository")
    for field in "${required_fields[@]}"; do
        if node -e "const pkg = require('./package.json'); if (!pkg.$field) process.exit(1)" 2>/dev/null; then
            log_success "package.json has $field"
        else
            log_error "package.json missing $field"
        fi
    done
    
    # Check scripts
    local required_scripts=("build" "start" "dev" "test" "lint" "type-check")
    for script in "${required_scripts[@]}"; do
        if node -e "const pkg = require('./package.json'); if (!pkg.scripts || !pkg.scripts.$script) process.exit(1)" 2>/dev/null; then
            log_success "package.json has $script script"
        else
            log_error "package.json missing $script script"
        fi
    done
}

check_environment_setup() {
    log_info "Checking environment configuration..."
    
    # Check environment example files
    if [[ -f "environment.example" ]]; then
        log_success "environment.example exists"
    else
        log_error "environment.example missing"
    fi
    
    if [[ -f "environment.production.example" ]]; then
        log_success "environment.production.example exists"
    else
        log_error "environment.production.example missing"
    fi
    
    # Check required environment variables in example
    local required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "OPENAI_API_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" environment.example 2>/dev/null; then
            log_success "environment.example has $var"
        else
            log_error "environment.example missing $var"
        fi
    done
}

check_database_setup() {
    log_info "Checking database configuration..."
    
    # Check Prisma schema
    if [[ -f "prisma/schema.prisma" ]]; then
        log_success "Prisma schema exists"
        
        # Check for essential models
        local required_models=("User" "Agent" "KnowledgeSource" "Conversation" "Message")
        for model in "${required_models[@]}"; do
            if grep -q "model $model" prisma/schema.prisma; then
                log_success "Database model $model exists"
            else
                log_error "Database model $model missing"
            fi
        done
    else
        log_error "Prisma schema missing"
    fi
}

check_api_endpoints() {
    log_info "Checking API endpoints..."
    
    local api_routes=(
        "src/app/api/health/route.ts"
        "src/app/api/agents/route.ts"
        "src/app/api/chat/route.ts"
        "src/app/api/knowledge-sources/route.ts"
        "src/app/api/crawler/config/route.ts"
        "src/app/api/analytics/usage/route.ts"
        "src/app/api/developer/api-key/route.ts"
    )
    
    for route in "${api_routes[@]}"; do
        if [[ -f "$route" ]]; then
            log_success "API endpoint exists: $route"
        else
            log_error "API endpoint missing: $route"
        fi
    done
}

check_security_features() {
    log_info "Checking security features..."
    
    # Check middleware
    if [[ -f "src/middleware.ts" ]]; then
        log_success "Middleware exists"
        
        # Check for security features
        if grep -q "rate.*limit" src/middleware.ts; then
            log_success "Rate limiting implemented"
        else
            log_warning "Rate limiting not found in middleware"
        fi
        
        if grep -q "cors" src/middleware.ts; then
            log_success "CORS configuration found"
        else
            log_warning "CORS configuration not found"
        fi
    else
        log_error "Middleware missing"
    fi
    
    # Check auth configuration
    if [[ -f "src/lib/auth.ts" ]]; then
        log_success "Authentication configuration exists"
    else
        log_error "Authentication configuration missing"
    fi
    
    # Check validation
    if [[ -f "src/lib/validation.ts" ]]; then
        log_success "Input validation exists"
    else
        log_error "Input validation missing"
    fi
}

check_docker_setup() {
    log_info "Checking Docker configuration..."
    
    if [[ -f "Dockerfile" ]]; then
        log_success "Dockerfile exists"
        
        # Check for security best practices
        if grep -q "USER" Dockerfile; then
            log_success "Dockerfile uses non-root user"
        else
            log_warning "Dockerfile may be running as root"
        fi
        
        if grep -q "HEALTHCHECK" Dockerfile; then
            log_success "Dockerfile has health check"
        else
            log_warning "Dockerfile missing health check"
        fi
    else
        log_error "Dockerfile missing"
    fi
    
    if [[ -f "docker-compose.yml" ]]; then
        log_success "Docker Compose configuration exists"
    else
        log_error "Docker Compose configuration missing"
    fi
    
    if [[ -f "docker-compose.prod.yml" ]]; then
        log_success "Production Docker Compose configuration exists"
    else
        log_error "Production Docker Compose configuration missing"
    fi
}

check_build_process() {
    log_info "Checking build process..."
    
    # Check TypeScript configuration
    if [[ -f "tsconfig.json" ]]; then
        log_success "TypeScript configuration exists"
    else
        log_error "TypeScript configuration missing"
    fi
    
    # Check Next.js configuration
    if [[ -f "next.config.ts" ]]; then
        log_success "Next.js configuration exists"
    else
        log_error "Next.js configuration missing"
    fi
    
    # Test build
    log_info "Testing build process..."
    if npm run build > /dev/null 2>&1; then
        log_success "Build process successful"
    else
        log_error "Build process failed"
    fi
}

check_testing_setup() {
    log_info "Checking testing setup..."
    
    # Check Jest configuration
    if [[ -f "jest.config.js" ]]; then
        log_success "Jest configuration exists"
    else
        log_warning "Jest configuration missing"
    fi
    
    # Check test files
    if find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | head -1 | grep -q .; then
        log_success "Test files exist"
    else
        log_warning "No test files found"
    fi
    
    # Test lint
    if npm run lint > /dev/null 2>&1; then
        log_success "Linting passed"
    else
        log_error "Linting failed"
    fi
}

check_documentation() {
    log_info "Checking documentation..."
    
    # Check README structure
    if [[ -f "README.md" ]]; then
        local readme_sections=("Installation" "Usage" "API" "Contributing" "License")
        for section in "${readme_sections[@]}"; do
            if grep -qi "$section" README.md; then
                log_success "README has $section section"
            else
                log_warning "README missing $section section"
            fi
        done
    fi
    
    # Check API documentation
    if find . -name "*.md" -path "*/api/*" | head -1 | grep -q .; then
        log_success "API documentation exists"
    else
        log_warning "API documentation missing"
    fi
}

check_deployment_readiness() {
    log_info "Checking deployment readiness..."
    
    # Check deployment scripts
    local deployment_scripts=("scripts/deploy.sh" "scripts/backup.sh" "scripts/monitoring.sh")
    for script in "${deployment_scripts[@]}"; do
        if [[ -f "$script" ]]; then
            log_success "Deployment script exists: $script"
        else
            log_error "Deployment script missing: $script"
        fi
    done
    
    # Check GitHub Actions
    if [[ -f ".github/workflows/ci.yml" ]]; then
        log_success "CI workflow exists"
    else
        log_error "CI workflow missing"
    fi
    
    if [[ -f ".github/workflows/release.yml" ]]; then
        log_success "Release workflow exists"
    else
        log_error "Release workflow missing"
    fi
}

check_performance() {
    log_info "Checking performance optimizations..."
    
    # Check Next.js optimizations
    if grep -q "output.*standalone" next.config.ts 2>/dev/null; then
        log_success "Next.js standalone output configured"
    else
        log_warning "Next.js standalone output not configured"
    fi
    
    # Check image optimization
    if grep -q "images" next.config.ts 2>/dev/null; then
        log_success "Image optimization configured"
    else
        log_warning "Image optimization not configured"
    fi
}

# Main execution
main() {
    echo "🔍 Tonmate - Production Readiness Check"
    echo "=========================================================="
    echo ""
    
    check_required_files
    check_package_json
    check_environment_setup
    check_database_setup
    check_api_endpoints
    check_security_features
    check_docker_setup
    check_build_process
    check_testing_setup
    check_documentation
    check_deployment_readiness
    check_performance
    
    echo ""
    echo "📊 Production Readiness Summary"
    echo "==============================="
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo ""
    
    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 Production readiness check PASSED!${NC}"
        echo "The platform is ready for production deployment."
        exit 0
    else
        echo -e "${RED}❌ Production readiness check FAILED!${NC}"
        echo "Please fix the failed checks before deploying to production."
        exit 1
    fi
}

# Run main function
main "$@"
