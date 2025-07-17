# Tonmate Library Code

This directory contains the core library code for the Tonmate platform.

## Structure

- `agents/` - AI agent implementations
  - `UniversalSupportAgent.ts` - Main support agent implementation

- `crawler/` - Website crawling functionality
  - `WebsiteCrawler.ts` - Core crawler implementation

- `models/` - Data models
  - `Order.js` - Order management models
  - `Product.js` - Product catalog models

- `tools/` - Agent tools and capabilities
  - `CustomActionTool.js` - Custom action handling
  - `EscalationTool.js` - Support escalation
  - `KnowledgeSearchTool.js` - Knowledge base searching
  - `OrderLookupTool.js` - Order lookup functionality
  - `ProductSearchTool.js` - Product search capabilities
  - `ShopInfoTool.js` - Store information retrieval

- `utils/` - Utility functions
  - `instagram/` - Instagram integration
  - `validation.ts` - Input validation utilities
  - `logger.js` - Logging utilities

- `embeddings/` - Vector embedding services
  - `EmbeddingService.ts` - Manages text embeddings

- `knowledge/` - Knowledge processing
  - `KnowledgeProcessor.ts` - Content processing

- `web-crawler/` - Advanced web crawling
  - `crawl-service.ts` - Crawling service implementation
  - `crawler.ts` - Advanced crawler features
  - `knowledge-processor.ts` - Knowledge extraction
  - `types.ts` - Type definitions

## Core Files

- `auth.ts` - Authentication utilities
- `db.ts` - Database connection and utilities
- `encryption.ts` - Encryption utilities
- `logger.ts` - Structured logging
- `middleware.ts` - API middleware functions
- `rateLimit.ts` - Rate limiting implementation
- `utils.ts` - General utility functions
- `validateEnv.js` - Environment validation
- `validation.ts` - Input validation

## Development Guidelines

1. **TypeScript**: Use TypeScript for all new code
2. **Error Handling**: Implement proper error handling and logging
3. **Documentation**: Include JSDoc comments for functions
4. **Testing**: Write tests for critical functionality
5. **Code Organization**: Keep related code together in appropriate directories
6. **Dependencies**: Minimize external dependencies
