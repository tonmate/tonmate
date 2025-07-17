#!/bin/bash

# Tonmate - Test Script
# This script runs comprehensive tests for the application

set -e

echo "🧪 Running Tonmate Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COVERAGE=false
WATCH=false
VERBOSE=false
INTEGRATION=false
E2E=false
PERFORMANCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --integration)
            INTEGRATION=true
            shift
            ;;
        --e2e)
            E2E=true
            shift
            ;;
        --performance)
            PERFORMANCE=true
            shift
            ;;
        --all)
            COVERAGE=true
            INTEGRATION=true
            E2E=true
            PERFORMANCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --coverage      Run tests with coverage report"
            echo "  --watch         Run tests in watch mode"
            echo "  --verbose       Run tests with verbose output"
            echo "  --integration   Run integration tests"
            echo "  --e2e           Run end-to-end tests"
            echo "  --performance   Run performance tests"
            echo "  --all           Run all test types"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "Coverage: $COVERAGE"
echo "Watch mode: $WATCH"
echo "Verbose: $VERBOSE"
echo "Integration: $INTEGRATION"
echo "E2E: $E2E"
echo "Performance: $PERFORMANCE"
echo ""

# Check if required tools are available
echo -e "${YELLOW}🔍 Checking test dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies available${NC}"

# Install test dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run pre-test checks
echo -e "${YELLOW}🔧 Running pre-test checks...${NC}"

# Type checking
echo -e "${YELLOW}🔍 Running type checks...${NC}"
npm run type-check

# Linting
echo -e "${YELLOW}🔧 Running linter...${NC}"
npm run lint

echo -e "${GREEN}✅ Pre-test checks passed${NC}"

# Function to run unit tests
run_unit_tests() {
    echo -e "${YELLOW}🧪 Running unit tests...${NC}"
    
    local test_cmd="npm run test"
    
    if [ "$COVERAGE" = true ]; then
        test_cmd="$test_cmd -- --coverage"
    fi
    
    if [ "$WATCH" = true ]; then
        test_cmd="$test_cmd -- --watch"
    fi
    
    if [ "$VERBOSE" = true ]; then
        test_cmd="$test_cmd -- --verbose"
    fi
    
    eval $test_cmd
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        exit 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    echo -e "${YELLOW}🔗 Running integration tests...${NC}"
    
    # Start test database if needed
    if [ -f "docker-compose.test.yml" ]; then
        echo -e "${YELLOW}🐳 Starting test database...${NC}"
        docker-compose -f docker-compose.test.yml up -d db
        sleep 10
    fi
    
    # Run database migrations for testing
    echo -e "${YELLOW}🗃️  Running test database migrations...${NC}"
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/test_db" npm run db:push
    
    # Run integration tests
    npm run test:integration
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Integration tests passed${NC}"
    else
        echo -e "${RED}❌ Integration tests failed${NC}"
        
        # Cleanup test database
        if [ -f "docker-compose.test.yml" ]; then
            docker-compose -f docker-compose.test.yml down
        fi
        
        exit 1
    fi
    
    # Cleanup test database
    if [ -f "docker-compose.test.yml" ]; then
        echo -e "${YELLOW}🧹 Cleaning up test database...${NC}"
        docker-compose -f docker-compose.test.yml down
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    echo -e "${YELLOW}🌐 Running end-to-end tests...${NC}"
    
    # Start the application in test mode
    echo -e "${YELLOW}🚀 Starting application in test mode...${NC}"
    npm run build
    npm run start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 15
    
    # Check if application is ready
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${RED}❌ Application failed to start${NC}"
        kill $APP_PID
        exit 1
    fi
    
    # Run E2E tests
    npm run test:e2e
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        kill $APP_PID
        exit 1
    fi
    
    # Stop the application
    kill $APP_PID
}

# Function to run performance tests
run_performance_tests() {
    echo -e "${YELLOW}⚡ Running performance tests...${NC}"
    
    # Start the application in test mode
    echo -e "${YELLOW}🚀 Starting application for performance testing...${NC}"
    npm run build
    npm run start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 15
    
    # Check if application is ready
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${RED}❌ Application failed to start${NC}"
        kill $APP_PID
        exit 1
    fi
    
    # Run performance tests with curl
    echo -e "${YELLOW}📊 Running API performance tests...${NC}"
    
    # Test API response time
    for i in {1..10}; do
        response_time=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/api/health)
        echo "API response time: ${response_time}s"
        
        # Check if response time is acceptable (under 1 second)
        if (( $(echo "$response_time > 1.0" | bc -l) )); then
            echo -e "${RED}❌ API response time too slow: ${response_time}s${NC}"
            kill $APP_PID
            exit 1
        fi
    done
    
    # Test memory usage
    echo -e "${YELLOW}💾 Checking memory usage...${NC}"
    memory_usage=$(ps -o pid,vsz,rss,comm -p $APP_PID)
    echo "$memory_usage"
    
    echo -e "${GREEN}✅ Performance tests passed${NC}"
    
    # Stop the application
    kill $APP_PID
}

# Function to generate test report
generate_test_report() {
    echo -e "${YELLOW}📊 Generating test report...${NC}"
    
    # Create reports directory
    mkdir -p reports
    
    # Generate HTML coverage report if coverage was run
    if [ "$COVERAGE" = true ] && [ -d "coverage" ]; then
        echo -e "${YELLOW}📋 Coverage report available at: coverage/lcov-report/index.html${NC}"
    fi
    
    # Generate test summary
    cat > reports/test-summary.md << EOF
# Test Summary Report

**Date:** $(date)
**Environment:** $(node --version)
**Platform:** $(uname -s)

## Test Results

- **Unit Tests:** ✅ Passed
$(if [ "$INTEGRATION" = true ]; then echo "- **Integration Tests:** ✅ Passed"; fi)
$(if [ "$E2E" = true ]; then echo "- **E2E Tests:** ✅ Passed"; fi)
$(if [ "$PERFORMANCE" = true ]; then echo "- **Performance Tests:** ✅ Passed"; fi)

## Coverage Report
$(if [ "$COVERAGE" = true ]; then echo "Coverage report generated in coverage/ directory"; fi)

## Next Steps

1. Review any failing tests
2. Check coverage reports for areas needing more tests
3. Consider adding more integration tests
4. Monitor performance metrics in production

EOF
    
    echo -e "${GREEN}✅ Test report generated at reports/test-summary.md${NC}"
}

# Main test execution
echo -e "${BLUE}🚀 Starting test execution...${NC}"

# Always run unit tests
run_unit_tests

# Run optional test suites
if [ "$INTEGRATION" = true ]; then
    run_integration_tests
fi

if [ "$E2E" = true ]; then
    run_e2e_tests
fi

if [ "$PERFORMANCE" = true ]; then
    run_performance_tests
fi

# Generate test report
generate_test_report

echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
echo ""
echo "📊 Test Results:"
echo "- Unit tests: ✅ Passed"
$(if [ "$INTEGRATION" = true ]; then echo "- Integration tests: ✅ Passed"; fi)
$(if [ "$E2E" = true ]; then echo "- E2E tests: ✅ Passed"; fi)
$(if [ "$PERFORMANCE" = true ]; then echo "- Performance tests: ✅ Passed"; fi)
echo ""
echo "📁 Reports available in reports/ directory"
$(if [ "$COVERAGE" = true ]; then echo "📋 Coverage report: coverage/lcov-report/index.html"; fi)
echo ""
echo "🌟 Happy testing!"
