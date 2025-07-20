# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tonmate** is an AI-powered customer support platform that enables businesses to create intelligent support agents trained on their website content. It's built with Next.js 15, TypeScript, and includes advanced web crawling, multi-AI provider integrations, and production-ready deployment options.

## Essential Commands

### Development
```bash
npm run dev                    # Start development server
npm run build                  # Build for production (includes Prisma generation)
npm run start                  # Start production server
npm run setup:complete        # Complete automated setup (env + install + db + dev)
```

### Testing & Quality
```bash
npm run test                   # Run Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate test coverage report
npm run lint                   # Run ESLint
npm run type-check             # TypeScript type checking
```

### Database (Prisma)
```bash
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to database
npm run db:migrate             # Create and apply migrations
npm run db:studio              # Open Prisma Studio
npm run db:reset               # Reset database
```

### Docker Commands
```bash
npm run docker:compose         # Start all services with Docker Compose
npm run docker:compose:build   # Build and start services
npm run docker:compose:down    # Stop all services
npm run docker:db:migrate      # Run migrations in Docker container
```

## Architecture Overview

### Core Components

1. **AI Agent System** (`src/lib/agents/`)
   - `UniversalSupportAgent.ts` - Main agent implementation with knowledge retrieval
   - Currently supports OpenAI (GPT-3.5, GPT-4) with plans for additional providers
   - Includes advanced context building and document scoring algorithms

2. **Knowledge Processing Pipeline** (`src/lib/`)
   - `crawler/WebsiteCrawler.ts` - Advanced web crawling with content extraction
   - `knowledge/KnowledgeProcessor.ts` - Content processing and chunking
   - `embeddings/EmbeddingService.ts` - Vector embeddings generation

3. **Agent Tools** (`src/lib/tools/`)
   - Domain-specific tools (OrderLookup, ProductSearch, ShopInfo, etc.)
   - Custom action and escalation tools for enhanced agent capabilities

4. **Next.js App Router Structure** (`src/app/`)
   - API routes for agents, chat, knowledge sources, and analytics
   - Pages for dashboard, agent management, and settings
   - Real-time chat interface with playground

### Database Schema (Prisma)

Key models:
- **User** - Authentication and user-specific AI configurations
- **Agent** - AI agent configurations with custom prompts and settings
- **KnowledgeSource/Document** - Content sources and processed documents
- **Conversation** - Chat history and analytics
- **CrawlRequest/CrawledPage** - Web crawling operations and results
- **ModelConfiguration** - Multi-provider AI model settings

### Key Features

- **OpenAI Integration**: GPT-3.5 and GPT-4 models with custom knowledge training
- **Advanced Web Crawling**: Configurable crawler with content extraction and filtering
- **Knowledge Base Training**: Automatic content processing with semantic search
- **Real-time Chat Interface**: ChatGPT-style playground for testing agents
- **Production Deployment**: Docker setup with health checks and monitoring

## Development Guidelines

### Environment Setup
1. Copy `environment.example` to `.env.local`
2. Configure required API keys (at minimum OpenAI)
3. Set up PostgreSQL database
4. Run `npm run setup:complete` for automated setup

### Database Development
- Always run `npm run db:generate` after schema changes
- Use `npm run db:push` for development, `npm run db:migrate` for production
- The Prisma client is generated to `src/generated/prisma/`

### Testing
- Tests are located in `__tests__/` directory
- Use Jest with jsdom environment for component testing
- Coverage threshold is set to 70% for all metrics
- Run `npm run test:coverage` before submitting changes

### AI Provider Integration
- AI configurations are stored per-user in the database (encrypted)
- Default to environment variables as fallback for API keys
- Support multiple models per provider with configurable parameters

### Agent Development
- Agents use knowledge-based context building with advanced document scoring
- Support for structured content extraction (tables, lists, headings)
- Multi-layered relevance scoring for improved context selection

## Common Development Tasks

### Adding New AI Providers (Future Enhancement)
1. Update `ModelConfiguration` schema in `prisma/schema.prisma`
2. Add provider logic in `UniversalSupportAgent.ts`
3. Update settings UI in `src/components/sidebar-pages/ModelIntegrations.tsx`
4. Note: Currently only OpenAI is fully implemented

### Extending Knowledge Processing
1. Modify crawler settings in `CrawlerConfiguration` model
2. Update content extraction in `WebsiteCrawler.ts`
3. Enhance document scoring in `UniversalSupportAgent.ts`

### Adding Agent Tools
1. Create new tool in `src/lib/tools/`
2. Follow existing tool patterns for integration
3. Update agent configuration to include new tools

## Deployment

### Production Environment
- Use `npm run build:production` for optimized builds
- Set `NODE_ENV=production` for production deployment
- Configure PostgreSQL and Redis for production use

### Docker Deployment
- Use `docker-compose.prod.yml` for production
- Health checks available at `/api/health`
- Comprehensive monitoring and backup scripts in `scripts/`

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `OPENAI_API_KEY` - OpenAI API key (required)
- `ENCRYPTION_KEY` - Key encryption secret

## Project Structure Notes

- TypeScript path mapping: `@/*` maps to `src/*`
- Prisma client output: `src/generated/prisma/`
- Next.js standalone output for Docker deployment
- Comprehensive documentation in `docs/` directory
- Production deployment scripts in `scripts/` directory

## Docker Optimization Notes
- Consider multi-stage builds to reduce image size
- Use `.dockerignore` to exclude unnecessary files
- Optimize layer caching by ordering Dockerfile commands
- Minimize the number of layers in Docker images