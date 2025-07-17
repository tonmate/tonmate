# Tonmate

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![GitHub stars](https://img.shields.io/github/stars/aryasadeghy/tonmate?style=social)](https://github.com/aryasadeghy/tonmate/stargazers)

</div>

> **🚀 AI-Powered Customer Support Platform - Deploy intelligent support agents trained on your content in minutes**

Tonmate is a comprehensive, enterprise-grade open source platform that enables businesses to create, deploy, and manage intelligent support agents trained on their specific content. Features advanced web crawling, multi-AI provider integrations, real-time analytics, Docker deployment, and production-ready architecture.

## ✨ Why Choose Tonmate?

- **🎯 Zero Configuration**: Start with sane defaults, customize as needed
- **🔧 Production Ready**: Docker, health checks, monitoring, and deployment scripts included
- **🌐 Universal**: Works with any website structure or content organization
- **🔒 Enterprise Security**: Authentication, rate limiting, input validation, and encryption
- **📊 Comprehensive Analytics**: Usage tracking, performance metrics, and insights
- **🚀 Multi-Provider AI**: OpenAI, Anthropic, Google AI, Mistral AI, and Cohere support
- **🎨 Modern UI**: Beautiful, responsive interface with ChatGPT-style interactions
- **📚 Open Source**: MIT licensed, community-driven development

## 🚀 Quick Start

### Development Setup

```bash
# Clone the repository
git clone https://github.com/aryasadeghy/tonmate.git
cd tonmate

# Run automated setup script
./scripts/setup.sh

# Or manual setup:
npm install
cp environment.example .env.local
# Edit .env.local with your API keys
npm run db:push
npm run dev
```

### Production Deployment

```bash
# Quick Docker deployment
docker-compose -f docker-compose.prod.yml up -d

# Or using deployment script
./scripts/deploy.sh --env production

# Health check
./healthcheck.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Production Checklist](#-production-checklist)
- [Monitoring](#-monitoring)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## ✨ Features

### 🤖 **AI Agent Management**
- **Multi-Provider AI Integration**: OpenAI, Anthropic, Google AI, Mistral AI, Cohere
- **Custom Agent Creation**: Unlimited agents with unique personalities
- **Knowledge Base Training**: Automatic website content processing
- **Real-time Chat Interface**: ChatGPT-style playground
- **Conversation History**: Complete analytics and insights
- **Developer Tools**: API key management and embed code generation

### 🕷️ Advanced Web Crawling
- **Intelligent Website Crawling**: Domain-limited crawling with smart content extraction
- **Configurable Crawler Settings**: Customize depth, concurrency, delays, and patterns
- **Content Processing**: Automatic text chunking and embedding generation
- **Performance Controls**: Timeout settings, retry logic, and rate limiting
- **Filter Management**: Include/exclude patterns, file type restrictions
- **JavaScript Rendering**: Optional JS execution for dynamic content

### 📊 Enhanced Analytics & Monitoring
- **Aggregated Usage Analytics**: Period-based summaries instead of daily breakdowns
- **Usage Trends**: 7, 30, 90-day analytics with averages and totals
- **Token & Cost Tracking**: Detailed usage statistics and cost estimation
- **Real-Time Status Updates**: Live processing indicators and progress tracking
- **Performance Metrics**: Response times, success rates, and system health

### 🛡️ Enterprise Security
- **Multi-Tenant Architecture**: Secure isolation between users and organizations
- **Rate Limiting**: Configurable limits for API, authentication, and processing
- **Input Validation**: Comprehensive validation with Zod schemas
- **Security Headers**: CORS, XSS protection, and content security policies
- **Audit Logging**: Complete activity tracking and security monitoring

### 📊 Monitoring & Analytics
- **Health Checks**: Automated system health monitoring
- **Performance Metrics**: Response time and resource usage tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Debug Tools**: Advanced debugging and troubleshooting capabilities
- **Real-Time Dashboards**: Live system status and analytics

### 🚀 Production Ready
- **Docker Deployment**: Multi-stage builds with security best practices
- **Automated Scripts**: Setup, deployment, testing, and health check scripts
- **Database Migrations**: Versioned schema management with Prisma
- **Backup Systems**: Automated backup and recovery scripts
- **Environment Management**: Separate configurations for dev/staging/prod
- **Health Monitoring**: Comprehensive health checks and monitoring
- **SSL/TLS**: HTTPS enforcement and certificate management
- **Performance Optimization**: Caching, compression, and CDN integration

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React Server Components and App Router
- **React 19**: Latest React features and optimizations
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Modern, responsive design system
- **Responsive Design**: Mobile-first approach with perfect UX

### Backend
- **Next.js 15 API Routes**: Modern serverless API architecture with async params
- **Prisma ORM**: Type-safe database operations with advanced migrations
- **NextAuth.js**: Enterprise authentication and session management
- **LangChain.js**: Advanced AI orchestration and prompt engineering
- **Multi-AI Provider APIs**: Integrated OpenAI, Anthropic, Google AI, Mistral, Cohere
- **Rate Limiting**: Redis-based rate limiting with configurable policies
- **Input Validation**: Comprehensive Zod schema validation

### Database & Infrastructure
- **SQLite/PostgreSQL**: Flexible database options with full schema migrations
- **Redis**: Caching and session storage for performance
- **Vector Storage**: Efficient similarity search and embeddings with chunking
- **Advanced Crawler**: Multi-threaded web crawling with content processing
- **Docker**: Production-ready containerization with multi-stage builds
- **Nginx**: Reverse proxy with SSL termination and load balancing

## 🛠️ Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- PostgreSQL 13+ or SQLite (for development)
- Redis (for production)
- Docker (for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aryasadeghy/tonmate.git
   cd tonmate
   ```

2. **Run automated setup**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Manual setup (alternative)**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment
   cp environment.example .env.local
   
   # Configure your environment variables
   nano .env.local
   
   # Set up database
   npm run db:push
   
   # Start development server
   npm run dev
   ```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Configuration

### Environment Variables

The platform uses two environment configuration files:

1. **`environment.example`** - Development configuration template
2. **`environment.production.example`** - Production configuration template

#### Core Configuration

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Tonmate"

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# AI Providers
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Redis (Production)
REDIS_URL=redis://localhost:6379

# Security
ENCRYPTION_KEY=your-encryption-key
```

#### Advanced Configuration

```bash
# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_AUTH_ATTEMPTS=5

# Crawling
CRAWLER_MAX_PAGES=50
CRAWLER_MAX_DEPTH=4
CRAWLER_DELAY_MS=500

# Monitoring
HEALTH_CHECK_INTERVAL=30000
LOG_LEVEL=info

# Email (Optional)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### AI Provider Configuration

Users can configure multiple AI providers through the Settings page:

- **OpenAI**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Anthropic**: Claude 3 Haiku, Claude 3 Sonnet, Claude 3 Opus
- **Google AI**: Gemini Pro, Gemini Pro Vision
- **Mistral AI**: Mistral 7B, Mistral 8x7B, Mistral Large
- **Cohere**: Command, Command Light, Command Nightly

### Crawler Configuration

Advanced crawler settings available in the Crawler Settings page:

- **Performance**: Max pages, depth, concurrency, delays
- **Filtering**: Include/exclude patterns, file types
- **Content**: JavaScript rendering, table extraction, code blocks
- **Security**: User agent, custom headers, timeout settings

## 🚀 Deployment

### Docker Production Deployment

1. **Setup production environment**
   ```bash
   cp environment.production.example .env.production
   # Edit .env.production with your production settings
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Or use deployment script**
   ```bash
   ./scripts/deploy.sh --env production
   ```

### Manual Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Deployment Scripts

- **`./scripts/setup.sh`** - Automated environment setup
- **`./scripts/deploy.sh`** - Deployment management
- **`./scripts/test.sh`** - Comprehensive testing
- **`./healthcheck.js`** - Health monitoring

## 🏥 Production Checklist

Before deploying to production, ensure you've completed all items in [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md):

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Backup systems active
- [ ] Performance optimized

## 📊 Monitoring

### Health Checks

```bash
# Quick health check
./healthcheck.js

# API health endpoint
curl -f http://localhost:3000/api/health

# Docker health status
docker-compose ps
```

### Monitoring Endpoints

- **Health**: `/api/health` - System health status
- **Metrics**: `/api/metrics` - Performance metrics
- **Status**: `/api/status` - Service status

### Logging

```bash
# View application logs
docker-compose logs -f app

# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres redis nginx
```

## 🎯 Usage

### Core Workflow

1. **Create AI Agent**: Define personality, behavior, and responses
2. **Add Knowledge Sources**: Provide websites for training content
3. **Configure Settings**: Customize AI models and crawler behavior
4. **Test in Playground**: Full-screen ChatGPT-style testing
5. **Deploy & Monitor**: Use API endpoints or embed widgets

### Dashboard Features

1. **Dashboard**: Main analytics hub with aggregated usage statistics
2. **AI Model Integrations** (`/integrations`): Configure OpenAI, Anthropic, Google AI, Mistral AI, Cohere
3. **Crawler Settings** (`/crawler-settings`): Customize web crawling behavior
4. **Agent Management**: Create and configure AI agents with specific personalities
5. **Agent Playground**: Full-screen ChatGPT-style testing interface
6. **Usage Analytics**: Detailed analytics with period-based summaries

### AI Model Integration
- Connect multiple AI providers with custom API keys
- Configure model parameters (temperature, max tokens, default models)
- Real-time connection status with visual indicators
- Easy disconnect/reconnect functionality

### Web Crawler Configuration
- **General Settings**: Max pages, crawl depth, delays, concurrency
- **Performance**: Timeout, retry attempts, file size limits
- **Filters**: Include/exclude patterns, allowed file types
- **Advanced**: JavaScript rendering, custom headers, wait selectors

### Agent Development
- **ChatGPT-Style Playground**: Full-screen testing interface
- **Developer Tools**: API key management and embed code generation
- **Live Preview**: Real-time widget preview with configuration
- **Multi-Platform Integration**: HTML, React, WordPress code snippets

## 📚 API Reference

### Core APIs

#### Authentication
```bash
# NextAuth.js endpoints
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

#### Agent Management
```bash
# Agent CRUD operations
GET    /api/agents           # List user's agents
POST   /api/agents           # Create new agent
GET    /api/agents/[id]      # Get agent details
PUT    /api/agents/[id]      # Update agent
DELETE /api/agents/[id]      # Delete agent

# Agent testing
POST   /api/chat             # Chat with agent
GET    /api/agents/[id]/playground  # Agent playground
```

#### Knowledge Base
```bash
# Knowledge source management
GET  /api/knowledge-sources           # List knowledge sources
POST /api/knowledge-sources           # Create knowledge source
POST /api/knowledge-sources/[id]/process  # Process website
GET  /api/knowledge-sources/[id]/status   # Processing status
```

#### AI Model Configuration
```bash
# Multi-provider AI configuration
GET  /api/models/configure      # Get user's AI model configs
POST /api/models/configure      # Save AI model configuration
POST /api/models/disconnect     # Disconnect AI provider
```

#### Crawler Configuration
```bash
# Crawler settings management
GET  /api/crawler/config        # Get crawler settings
POST /api/crawler/config        # Save crawler configuration
```

#### Analytics & Monitoring
```bash
# Usage analytics
GET /api/analytics/usage        # Usage statistics
GET /api/usage                  # Usage trends
GET /api/analytics/agents       # Agent-specific analytics

# System monitoring
GET /api/health                 # Health check
GET /api/metrics                # Performance metrics
GET /api/status                 # Service status
```

### WebSocket APIs

```bash
# Real-time features
ws://localhost:3000/api/ws/chat     # Real-time chat
ws://localhost:3000/api/ws/status   # Live status updates
```

### Embed Widget API

```bash
# Widget integration
GET /api/embed/config/[agentId]     # Widget configuration
GET /api/embed/chat/[agentId]       # Widget chat endpoint
```

## 🤝 Contributing

We welcome contributions to improve the platform! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   ./scripts/test.sh --all
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Follow conventional commit messages

### Reporting Issues

- Use the GitHub issue tracker
- Include detailed reproduction steps
- Provide system information
- Add screenshots if applicable

### Feature Requests

- Check existing issues first
- Provide clear use cases
- Explain the problem it solves
- Consider implementation complexity

## 🆘 Support

### Documentation

- [Installation Guide](./docs/installation.md)
- [Configuration Reference](./docs/configuration.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

### Community

- [GitHub Discussions](https://github.com/aryasadeghy/tonmate/discussions)
- [GitHub Issues](https://github.com/aryasadeghy/tonmate/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tonmate)

### Getting Help

1. **Check the documentation** first
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join the community** discussions

### Commercial Support

- Priority support available
- Custom development services
- Enterprise consulting
- Training and workshops
- SLA-backed support plans

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [LangChain.js](https://js.langchain.com/) for AI orchestration
- [Prisma](https://prisma.io/) for database management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [OpenAI](https://openai.com/) for AI capabilities
- [Vercel](https://vercel.com/) for deployment platform
- All contributors and supporters

## 🔗 Related Projects

- [LangChain](https://github.com/langchain-ai/langchain) - AI orchestration
- [Next.js](https://github.com/vercel/next.js) - React framework
- [Prisma](https://github.com/prisma/prisma) - Database toolkit
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - CSS framework

## 🚗 Roadmap

### Version 2.0
- [ ] Voice chat integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Plugin system
- [ ] White-label solutions

### Version 2.1
- [ ] Mobile app
- [ ] Advanced integrations
- [ ] AI model fine-tuning
- [ ] Enterprise features
- [ ] Advanced security

### Community Requests
- [ ] Slack integration
- [ ] Teams integration
- [ ] Zapier integration
- [ ] Custom themes
- [ ] Advanced reporting

---

<div align="center">

**Made with ❤️ by the Tonmate team**

[⭐ Star this repository](https://github.com/aryasadeghy/tonmate) if you find it useful!

[![GitHub stars](https://img.shields.io/github/stars/aryasadeghy/tonmate?style=social)](https://github.com/aryasadeghy/tonmate/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/aryasadeghy/tonmate?style=social)](https://github.com/aryasadeghy/tonmate/network)
[![GitHub issues](https://img.shields.io/github/issues/aryasadeghy/tonmate)](https://github.com/aryasadeghy/tonmate/issues)
[![GitHub license](https://img.shields.io/github/license/aryasadeghy/tonmate)](https://github.com/aryasadeghy/tonmate/blob/main/LICENSE)

</div>



