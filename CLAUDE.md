# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tonmate is a comprehensive AI-powered customer support platform that enables businesses to create, deploy, and manage intelligent support agents trained on their specific content. It features advanced web crawling, multi-AI provider integrations, real-time analytics, and production-ready architecture.

## Key Technologies

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js 15 API Routes, Prisma ORM with PostgreSQL
- **AI/ML**: LangChain.js, OpenAI, Anthropic, Google AI, Mistral AI, Cohere
- **Authentication**: NextAuth.js with JWT
- **Database**: PostgreSQL (production), SQLite (dev fallback)
- **Testing**: Jest with jsdom, React Testing Library
- **Deployment**: Docker, Vercel support

## Essential Commands

### Development
```bash
npm run dev                    # Start development server
npm run db:generate           # Generate Prisma client
npm run db:push              # Push schema changes to database
npm run db:migrate           # Create and apply migrations
npm run db:studio            # Open Prisma Studio
```

### Testing & Quality
```bash
npm run test                 # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript type checking
```

### Build & Deployment
```bash
npm run build               # Build for production
npm run start               # Start production server
npm run build:production    # Build with NODE_ENV=production
```

### Database Operations
```bash
npm run db:reset            # Reset database (dev only)
npm run db:seed             # Seed database with test data
npm run db:deploy           # Deploy migrations (production)
```

### Docker Commands
```bash
npm run docker:compose      # Start all services with Docker
npm run docker:build        # Build Docker image
npm run docker:db:migrate   # Run migrations in Docker container
```

## Project Architecture

### Core Structure
```
src/
├── app/                    # Next.js App Router (pages & API routes)
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── AgentDetails/      # Agent management components
│   ├── Layout/            # Layout components
│   └── sidebar-pages/     # Sidebar page components
├── lib/                   # Core business logic
│   ├── agents/           # AI agent implementations
│   ├── crawler/          # Website crawling system
│   ├── embeddings/       # Vector embeddings service
│   ├── knowledge/        # Knowledge processing pipeline
│   ├── tools/            # Agent tools (LangChain)
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

### Database Models (Prisma)
Key models in `prisma/schema.prisma`:
- **User**: User accounts with encrypted API keys
- **Agent**: AI agent configurations and settings
- **KnowledgeSource**: Website/content sources for training
- **Document**: Processed documents with embeddings
- **Conversation**: Chat history and context
- **ModelConfiguration**: Multi-provider AI settings
- **CrawlerConfiguration**: User-specific crawler settings

### AI Agent System
The platform uses a sophisticated AI agent architecture:
- **Universal Support Agent**: Main customer support agent (`src/lib/agents/UniversalSupportAgent.ts`)
- **Custom Tools**: LangChain tools for specialized functions (`src/lib/tools/`)
- **Knowledge Retrieval**: Vector-based semantic search using embeddings
- **Multi-Provider Support**: OpenAI, Anthropic, Google AI, Mistral, Cohere

### Knowledge Processing Pipeline
1. **Web Crawling**: `src/lib/crawler/WebsiteCrawler.ts` - Intelligent website content extraction
2. **Content Processing**: `src/lib/knowledge/KnowledgeProcessor.ts` - Text chunking and processing
3. **Embeddings**: `src/lib/embeddings/EmbeddingService.ts` - Vector embedding generation
4. **Storage**: Prisma models for structured knowledge storage

## Environment Configuration

Copy `environment.example` to `.env.local` for development. Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: 32+ character secret for authentication
- `ENCRYPTION_KEY`: For encrypting user API keys
- `NEXTAUTH_URL`: Application URL

Note: AI provider API keys (OpenAI, Anthropic, etc.) are configured per user through the web interface, not as global environment variables.

## Testing Strategy

- **Unit Tests**: Located in `__tests__/` directory
- **Component Tests**: React components with Testing Library
- **API Tests**: API route testing
- **Coverage Target**: 70% minimum across all metrics
- **Test Environment**: jsdom for DOM simulation

## Database Migration Workflow

1. **Schema Changes**: Modify `prisma/schema.prisma`
2. **Generate Migration**: `npm run db:migrate`
3. **Apply Changes**: Automatically applied in development
4. **Production**: Use `npm run db:deploy`

## Key Development Patterns

### API Routes Structure
- Authentication required for most routes
- Rate limiting implemented
- Input validation with Zod schemas
- Error handling with proper HTTP status codes

### Component Architecture
- Reusable UI components in `src/components/ui/`
- Feature-specific components organized by domain
- TypeScript interfaces for all props
- Tailwind CSS for styling

### Security Practices
- API keys encrypted before database storage
- Rate limiting on authentication and API endpoints
- Input validation on all user inputs
- CORS and security headers configured

## Production Deployment

### Docker Deployment (Recommended)
```bash
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks
- Endpoint: `/api/health`
- Database connectivity verification
- Health check script: `docker/healthcheck.js`

### Scripts
- `scripts/deploy.sh`: Automated deployment
- `scripts/backup.sh`: Database backup
- `scripts/monitor.sh`: System monitoring
- `scripts/test.sh`: Comprehensive testing

## Common Development Tasks

### Adding New AI Provider
1. Add configuration to User model in `prisma/schema.prisma`
2. Update `ModelConfiguration` handling
3. Add provider-specific logic to agent implementation
4. Update settings UI components

### Implementing New Agent Tool
1. Create tool class in `src/lib/tools/`
2. Implement LangChain tool interface
3. Add tool to agent configuration
4. Update tool registration in agent setup

### Adding New Knowledge Source Type
1. Extend `KnowledgeSource` model if needed
2. Update knowledge processor for new type
3. Add UI components for configuration
4. Implement specific processing logic

## Performance Considerations

- **Database**: Connection pooling configured for production
- **Caching**: Consider Redis for session storage in production
- **Embeddings**: Chunking strategy optimized for retrieval
- **Rate Limiting**: Configured per user and endpoint
- **Bundle Size**: Tree shaking and code splitting enabled

## Debugging and Monitoring

- **Logs**: Structured logging with configurable levels
- **Processing Logs**: Detailed crawling and knowledge processing logs in database
- **Health Monitoring**: `/api/health` endpoint with database checks
- **Error Tracking**: Console errors and processing failures logged

## Important File Locations

- **Environment Config**: `environment.example`, `environment.production.example`
- **Database Schema**: `prisma/schema.prisma`
- **Next.js Config**: `next.config.ts`
- **TypeScript Config**: `tsconfig.json`
- **Jest Config**: `jest.config.js`
- **Docker Config**: `docker/docker-compose.*.yml`
- **Production Checklist**: `docs/PRODUCTION_CHECKLIST.md`