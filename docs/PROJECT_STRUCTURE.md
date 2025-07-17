# Tonmate Project Structure

This document provides an overview of the Tonmate project structure after reorganization.

## Directory Overview

```
tonmate/
├── .github/                   # GitHub workflows and configuration
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── scripts/                   # Organized maintenance scripts
│   ├── deploy/                # Deployment scripts
│   ├── monitoring/            # Monitoring scripts
│   └── maintenance/           # Maintenance scripts
├── src/                       # Source code
│   ├── app/                   # Next.js App Router structure
│   ├── components/            # React components
│   │   ├── features/          # Feature-specific components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Library code
│   │   ├── agents/            # AI agent implementations
│   │   ├── models/            # Data models
│   │   ├── tools/             # Agent tools
│   │   ├── utils/             # Utility functions
│   │   ├── crawler/           # Website crawling
│   │   ├── embeddings/        # Vector embeddings
│   │   └── knowledge/         # Knowledge processing
│   ├── types/                 # TypeScript type definitions
│   └── generated/             # Auto-generated code
└── docs/                      # Documentation
```

## Key Components

### AI Agents

The core of Tonmate is the AI agent system that powers the customer support experience. Agents are implemented in the `src/lib/agents` directory.

- **Universal Support Agent**: The primary agent that handles customer inquiries
- **Custom Tools**: Domain-specific tools to enhance agent capabilities

### Knowledge Processing

Tonmate includes a sophisticated knowledge processing pipeline for training agents on custom content:

1. **Web Crawler**: Scrapes website content from specified URLs
2. **Content Processing**: Extracts and normalizes text content
3. **Vector Embeddings**: Creates searchable embeddings for knowledge retrieval
4. **Knowledge Base**: Stores processed knowledge for agent access

### User Interface

The user interface is built with React and Next.js, providing a modern and responsive experience:

- **Chat Interface**: Real-time conversation with AI agents
- **Dashboard**: Agent management and analytics
- **Settings**: Configuration for AI providers and system settings

## Database Schema

Tonmate uses PostgreSQL with Prisma ORM for data management. Key models include:

- **User**: Authentication and user management
- **Conversation**: Chat history and context
- **KnowledgeSource**: Content sources for agent training
- **Agent**: Agent configuration and settings

## Deployment Options

Tonmate supports multiple deployment options:

1. **Vercel Deployment**: For quick cloud deployment (recommended for most users)
2. **Docker Deployment**: For self-hosted installations with full control
3. **Development Setup**: For local development and testing

## Scripts

Organized scripts are provided for common operations:

- **Deployment**: Deploy to production environments
- **Monitoring**: Monitor system health and performance
- **Maintenance**: Backup data and perform security checks

## Documentation

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: Guidelines for contributors
- **DEPLOYMENT.md**: Detailed deployment instructions
- **API.md**: API documentation
- **SECURITY.md**: Security policies and procedures
