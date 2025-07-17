#!/bin/bash

# Tonmate - Security Check Script
# This script performs comprehensive security checks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    ((WARNINGS++))
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    ((FAILED_CHECKS++))
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
    ((PASSED_CHECKS++))
}

check_start() {
    ((TOTAL_CHECKS++))
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] Checking: $1${NC}"
}

# Check environment variables security
check_env_security() {
    check_start "Environment variables security"
    
    local env_file=".env.local"
    local issues=0
    
    if [ ! -f "$env_file" ]; then
        error "Environment file not found: $env_file"
        return 1
    fi
    
    # Check for sensitive data exposure
    if grep -q "password.*=" "$env_file"; then
        warn "Possible hardcoded password found in $env_file"
        ((issues++))
    fi
    
    # Check for weak secrets
    if grep -q "NEXTAUTH_SECRET.*=.*test\|123\|password\|secret" "$env_file"; then
        error "Weak NEXTAUTH_SECRET detected"
        ((issues++))
    fi
    
    # Check secret length
    local secret_length=$(grep "NEXTAUTH_SECRET" "$env_file" | cut -d'=' -f2 | wc -c)
    if [ "$secret_length" -lt 32 ]; then
        error "NEXTAUTH_SECRET too short (minimum 32 characters)"
        ((issues++))
    fi
    
    # Check for development URLs in production
    if [ "$NODE_ENV" = "production" ]; then
        if grep -q "localhost\|127.0.0.1\|0.0.0.0" "$env_file"; then
            warn "Development URLs found in production environment"
            ((issues++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        success "Environment variables security check passed"
    else
        error "Environment variables security check failed with $issues issues"
    fi
}

# Check file permissions
check_file_permissions() {
    check_start "File permissions"
    
    local issues=0
    
    # Check .env.local permissions
    if [ -f ".env.local" ]; then
        local env_perms=$(stat -c "%a" .env.local)
        if [ "$env_perms" != "600" ] && [ "$env_perms" != "644" ]; then
            warn ".env.local has permissive permissions: $env_perms"
            ((issues++))
        fi
    fi
    
    # Check for world-writable files
    local writable_files=$(find . -type f -perm -002 2>/dev/null | grep -v node_modules | head -10)
    if [ -n "$writable_files" ]; then
        warn "World-writable files found:"
        echo "$writable_files"
        ((issues++))
    fi
    
    # Check for executable files that shouldn't be
    local suspicious_exec=$(find . -name "*.js" -o -name "*.ts" -o -name "*.json" | xargs ls -la | grep "^-rwx" | head -5)
    if [ -n "$suspicious_exec" ]; then
        warn "Suspicious executable files found:"
        echo "$suspicious_exec"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        success "File permissions check passed"
    else
        warn "File permissions check completed with $issues issues"
    fi
}

# Check dependencies for vulnerabilities
check_dependencies() {
    check_start "Dependencies vulnerabilities"
    
    if ! command -v npm >/dev/null 2>&1; then
        error "npm not found"
        return 1
    fi
    
    # Run npm audit
    local audit_output=$(npm audit --audit-level=moderate 2>&1)
    local audit_exit_code=$?
    
    if [ $audit_exit_code -eq 0 ]; then
        success "No vulnerabilities found in dependencies"
    else
        error "Vulnerabilities found in dependencies"
        echo "$audit_output" | grep -E "(high|critical|moderate)" | head -10
    fi
}

# Check for hardcoded secrets
check_hardcoded_secrets() {
    check_start "Hardcoded secrets"
    
    local issues=0
    local patterns=(
        "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
        "secret.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
        "password.*=.*['\"][a-zA-Z0-9]{8,}['\"]"
        "token.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
        "sk-[a-zA-Z0-9]{48}"
        "xox[baprs]-[a-zA-Z0-9-]+"
    )
    
    for pattern in "${patterns[@]}"; do
        local matches=$(grep -r -E -i "$pattern" src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null || true)
        if [ -n "$matches" ]; then
            warn "Possible hardcoded secret found:"
            echo "$matches" | head -3
            ((issues++))
        fi
    done
    
    if [ $issues -eq 0 ]; then
        success "No hardcoded secrets found"
    else
        error "Hardcoded secrets check failed with $issues issues"
    fi
}

# Check HTTPS configuration
check_https_config() {
    check_start "HTTPS configuration"
    
    local issues=0
    
    # Check Next.js configuration
    if [ -f "next.config.js" ]; then
        if grep -q "http:" next.config.js; then
            warn "HTTP URLs found in Next.js config"
            ((issues++))
        fi
    fi
    
    # Check environment for HTTPS
    if [ -f ".env.local" ]; then
        if grep -q "NEXTAUTH_URL.*http://" .env.local; then
            if [ "$NODE_ENV" = "production" ]; then
                error "HTTP URL in production NEXTAUTH_URL"
                ((issues++))
            else
                warn "HTTP URL in NEXTAUTH_URL (acceptable for development)"
            fi
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        success "HTTPS configuration check passed"
    else
        error "HTTPS configuration check failed with $issues issues"
    fi
}

# Check database security
check_database_security() {
    check_start "Database security"
    
    local issues=0
    
    if [ -f ".env.local" ]; then
        source .env.local
        
        # Check for default database credentials
        if echo "$DATABASE_URL" | grep -q "password\|123456\|admin\|root"; then
            warn "Weak database credentials detected"
            ((issues++))
        fi
        
        # Check for unencrypted database connections
        if [ "$NODE_ENV" = "production" ] && echo "$DATABASE_URL" | grep -q "sslmode=disable"; then
            error "Unencrypted database connection in production"
            ((issues++))
        fi
        
        # Check for local database in production
        if [ "$NODE_ENV" = "production" ] && echo "$DATABASE_URL" | grep -q "localhost\|127.0.0.1\|file:"; then
            warn "Local database in production environment"
            ((issues++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        success "Database security check passed"
    else
        error "Database security check failed with $issues issues"
    fi
}

# Check API security
check_api_security() {
    check_start "API security"
    
    local issues=0
    
    # Check for missing authentication
    local unauth_routes=$(grep -r "export.*GET\|export.*POST" src/app/api/ | grep -v auth | head -5)
    if [ -n "$unauth_routes" ]; then
        warn "API routes without explicit authentication check:"
        echo "$unauth_routes"
        ((issues++))
    fi
    
    # Check for missing input validation
    local routes_without_validation=$(grep -r "request.json()" src/app/api/ | grep -v "validate\|schema" | head -5)
    if [ -n "$routes_without_validation" ]; then
        warn "API routes without input validation:"
        echo "$routes_without_validation"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        success "API security check passed"
    else
        warn "API security check completed with $issues issues"
    fi
}

# Check for information disclosure
check_info_disclosure() {
    check_start "Information disclosure"
    
    local issues=0
    
    # Check for debug information in production
    if [ "$NODE_ENV" = "production" ]; then
        local debug_code=$(grep -r "console.log\|console.error\|debugger" src/ --include="*.js" --include="*.ts" --include="*.tsx" | head -5)
        if [ -n "$debug_code" ]; then
            warn "Debug code found in production build:"
            echo "$debug_code"
            ((issues++))
        fi
    fi
    
    # Check for sensitive comments
    local sensitive_comments=$(grep -r -i "todo.*password\|fixme.*security\|hack\|temporary" src/ --include="*.js" --include="*.ts" --include="*.tsx" | head -5)
    if [ -n "$sensitive_comments" ]; then
        warn "Sensitive comments found:"
        echo "$sensitive_comments"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        success "Information disclosure check passed"
    else
        warn "Information disclosure check completed with $issues issues"
    fi
}

# Check Docker security
check_docker_security() {
    check_start "Docker security"
    
    local issues=0
    
    if [ -f "Dockerfile" ]; then
        # Check for running as root
        if ! grep -q "USER " Dockerfile; then
            error "Dockerfile does not specify non-root user"
            ((issues++))
        fi
        
        # Check for latest tag usage
        if grep -q "FROM.*:latest" Dockerfile; then
            warn "Using 'latest' tag in Dockerfile"
            ((issues++))
        fi
        
        # Check for ADD instead of COPY
        if grep -q "^ADD " Dockerfile; then
            warn "Using ADD instead of COPY in Dockerfile"
            ((issues++))
        fi
    fi
    
    if [ -f "docker-compose.yml" ]; then
        # Check for exposed ports
        if grep -q "ports:" docker-compose.yml; then
            warn "Exposed ports found in docker-compose.yml"
            ((issues++))
        fi
        
        # Check for privileged mode
        if grep -q "privileged: true" docker-compose.yml; then
            error "Privileged mode enabled in docker-compose.yml"
            ((issues++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        success "Docker security check passed"
    else
        error "Docker security check failed with $issues issues"
    fi
}

# Check CORS configuration
check_cors_config() {
    check_start "CORS configuration"
    
    local issues=0
    
    # Check for overly permissive CORS
    local cors_any=$(grep -r "Access-Control-Allow-Origin.*\*" src/ | head -3)
    if [ -n "$cors_any" ]; then
        warn "Overly permissive CORS configuration found:"
        echo "$cors_any"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        success "CORS configuration check passed"
    else
        warn "CORS configuration check completed with $issues issues"
    fi
}

# Generate security report
generate_report() {
    echo ""
    echo "======================================"
    echo "    SECURITY CHECK REPORT"
    echo "======================================"
    echo ""
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNINGS"
    echo ""
    
    local score=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    if [ $score -ge 90 ]; then
        echo -e "${GREEN}Security Score: $score/100 - EXCELLENT${NC}"
    elif [ $score -ge 70 ]; then
        echo -e "${YELLOW}Security Score: $score/100 - GOOD${NC}"
    elif [ $score -ge 50 ]; then
        echo -e "${YELLOW}Security Score: $score/100 - NEEDS IMPROVEMENT${NC}"
    else
        echo -e "${RED}Security Score: $score/100 - CRITICAL${NC}"
    fi
    
    echo ""
    echo "Recommendations:"
    echo "• Fix all failed checks before deployment"
    echo "• Review and address warnings"
    echo "• Regularly update dependencies"
    echo "• Enable security monitoring"
    echo "• Conduct regular security audits"
    echo ""
    
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo -e "${RED}❌ Security check failed. Address critical issues before deployment.${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Security check passed. Application is ready for deployment.${NC}"
        return 0
    fi
}

# Main execution
main() {
    log "Starting security check..."
    
    # Initialize counters
    TOTAL_CHECKS=0
    PASSED_CHECKS=0
    FAILED_CHECKS=0
    WARNINGS=0
    
    # Run all checks
    check_env_security
    check_file_permissions
    check_dependencies
    check_hardcoded_secrets
    check_https_config
    check_database_security
    check_api_security
    check_info_disclosure
    check_docker_security
    check_cors_config
    
    # Generate report
    generate_report
}

# Handle command line arguments
case "${1:-}" in
    "env")
        check_env_security
        ;;
    "deps")
        check_dependencies
        ;;
    "secrets")
        check_hardcoded_secrets
        ;;
    "docker")
        check_docker_security
        ;;
    "api")
        check_api_security
        ;;
    "help"|"-h"|"--help")
        cat << EOF
Customer Support AI Agent - Security Check Script

Usage: $0 [command]

Commands:
  env        Check environment variables security
  deps       Check dependencies for vulnerabilities
  secrets    Check for hardcoded secrets
  docker     Check Docker security
  api        Check API security
  help       Show this help message

If no command is specified, runs all security checks.

Exit Codes:
  0 - All checks passed
  1 - One or more checks failed

Examples:
  $0           # Run all checks
  $0 env       # Check environment only
  $0 deps      # Check dependencies only
EOF
        ;;
    *)
        main
        ;;
esac
