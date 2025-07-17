#!/bin/bash

# Tonmate - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Tonmate..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -p "process.versions.node" | awk -F. '{print ($1 >= 18)}' | grep -q 1; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version $NODE_VERSION is compatible${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is available${NC}"

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.local from environment.example...${NC}"
    cp environment.example .env.local
    echo -e "${GREEN}✅ .env.local created${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.local with your actual configuration values${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npm run db:generate

# Check if database is set up
if [ -f "prisma/dev.db" ] || [ -n "$DATABASE_URL" ]; then
    echo -e "${YELLOW}🗃️  Setting up database...${NC}"
    npm run db:push
    echo -e "${GREEN}✅ Database setup complete${NC}"
else
    echo -e "${YELLOW}⚠️  No database configured. Please set DATABASE_URL in .env.local${NC}"
fi

# Run type checking
echo -e "${YELLOW}🔍 Running type checks...${NC}"
npm run type-check

# Run linting
echo -e "${YELLOW}🔧 Running linter...${NC}"
npm run lint

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration values"
echo "2. Set up your database (PostgreSQL recommended for production)"
echo "3. Add your OpenAI API key to .env.local"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For more information, check out:"
echo "- README.md for detailed setup instructions"
echo "- CONTRIBUTING.md for contribution guidelines"
echo "- API_REFERENCE.md for API documentation"
echo ""
echo "🌟 Happy coding!"
