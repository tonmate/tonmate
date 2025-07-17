# Tonmate Source Code

This directory contains the organized source code for the Tonmate AI customer support platform.

## Directory Structure

- **app/** - Next.js App Router pages and API routes
  - `api/` - Backend API endpoints
  - `auth/` - Authentication-related pages
  - `chat/` - Chat interface and conversation pages
  - `dashboard/` - Admin dashboard pages
  - `settings/` - Application settings pages

- **components/** - React components
  - `features/` - Feature-specific components
    - `AgentDetails/` - Components for agent configuration and management
  - `ui/` - Reusable UI components
  - `Layout/` - Page layout components

- **lib/** - Library code and utilities
  - `agents/` - AI agent implementations
  - `models/` - Data models
  - `tools/` - Agent tools and capabilities
  - `utils/` - Utility functions
  - `crawler/` - Website crawling functionality
  - `embeddings/` - Vector embeddings for knowledge retrieval
  - `knowledge/` - Knowledge processing and management
  - `web-crawler/` - Advanced web crawling functionality

- **types/** - TypeScript type definitions

- **generated/** - Auto-generated code (Prisma client, etc.)

## Development Guidelines

1. **Component Structure**:
   - Use PascalCase for component names
   - Place components in appropriate feature directories
   - Keep UI components generic and reusable

2. **Library Code**:
   - Add proper TypeScript types
   - Include JSDoc comments for functions
   - Use consistent error handling

3. **API Routes**:
   - Follow RESTful conventions
   - Include validation for all inputs
   - Handle errors consistently

4. **Testing**:
   - Write tests for critical functionality
   - Place tests in the same directory as the code they test
