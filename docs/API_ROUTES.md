# Tonmate API Routes

This directory contains the API endpoints for the Tonmate platform using Next.js API routes.

## Structure

- `agents/` - Agent management endpoints
- `analytics/` - Usage and performance metrics
- `auth/` - Authentication and user management
- `chat/` - Conversation and messaging
- `conversations/` - Conversation history and management
- `crawl/` - Website crawling endpoints
- `crawler/` - Crawler configuration
- `health/` - System health checks
- `knowledge-base/` - Knowledge base management
- `knowledge-sources/` - Content source management
- `models/` - AI model configuration
- `settings/` - System settings management
- `usage/` - Usage tracking and limits

## API Guidelines

1. **Route Naming**: Use kebab-case for all routes
2. **Request Validation**: Validate all incoming requests
3. **Error Handling**: Use consistent error response format
4. **Authentication**: Protect routes with proper authentication middleware
5. **Rate Limiting**: Apply rate limits to prevent abuse
6. **Documentation**: Include JSDoc comments for complex endpoints
7. **Testing**: Write tests for all API endpoints

## Response Format

All API responses should follow this format:

```typescript
// Success response
{
  success: true,
  data: { ... }  // The actual response data
}

// Error response
{
  success: false,
  error: {
    code: string,    // Error code
    message: string, // Human-readable error message
    details?: any    // Optional additional details
  }
}
```
