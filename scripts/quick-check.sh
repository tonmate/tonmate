#!/bin/bash

# Quick production readiness check
echo "🔍 Quick Production Readiness Check"
echo "================================="

PASS=0
FAIL=0

check_file() {
    if [[ -f "$1" ]]; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

# Core files
echo "📄 Core Files:"
check_file "package.json"
check_file "README.md"
check_file "LICENSE"
check_file "CONTRIBUTING.md"
check_file "SECURITY.md"
check_file "DEPLOYMENT.md"
check_file "PRODUCTION_CHECKLIST.md"
check_file "QUICK_START.md"

echo ""
echo "🔧 Configuration Files:"
check_file "next.config.ts"
check_file "tsconfig.json"
check_file "tailwind.config.js"
check_file "prisma/schema.prisma"
check_file "environment.example"
check_file "environment.production.example"

echo ""
echo "🐳 Docker Files:"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file "docker-compose.prod.yml"
check_file ".dockerignore"

echo ""
echo "🚀 GitHub Actions:"
check_file ".github/workflows/ci.yml"
check_file ".github/workflows/release.yml"
check_file ".github/ISSUE_TEMPLATE/bug_report.md"
check_file ".github/ISSUE_TEMPLATE/feature_request.md"
check_file ".github/pull_request_template.md"

echo ""
echo "📜 Scripts:"
check_file "scripts/setup.sh"
check_file "scripts/deploy.sh"
check_file "scripts/backup.sh"
check_file "scripts/monitoring.sh"
check_file "scripts/security-check.sh"
check_file "scripts/test.sh"

echo ""
echo "🛡️ Security & Middleware:"
check_file "src/middleware.ts"
check_file "src/lib/auth.ts"
check_file "src/lib/rate-limiter.ts"
check_file "src/lib/validation.ts"

echo ""
echo "🌐 API Endpoints:"
check_file "src/app/api/health/route.ts"
check_file "src/app/api/agents/route.ts"
check_file "src/app/api/chat/route.ts"
check_file "src/app/api/knowledge-sources/route.ts"

echo ""
echo "📊 Summary:"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"

if [[ $FAIL -eq 0 ]]; then
    echo "🎉 All files present - Production ready!"
else
    echo "⚠️  Some files missing - Check above"
fi
