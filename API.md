# Tonmate - API Documentation

## Overview

This document describes the REST API endpoints for the Tonmate platform. The API provides functionality for user authentication, agent management, knowledge source processing, and AI-powered chat interactions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses NextAuth.js for authentication with JWT tokens. Include the session token in requests that require authentication.

### Headers

```http
Content-Type: application/json
Authorization: Bearer <session-token>
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Chat**: 10 requests per minute
- **Knowledge Processing**: 5 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /api/health

Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "responseTime": 15
    },
    "environment": {
      "status": "healthy",
      "message": "All required environment variables are set",
      "requiredVars": ["NEXTAUTH_SECRET", "DATABASE_URL"],
      "missingVars": []
    },
    "memory": {
      "status": "healthy",
      "used": 52428800,
      "total": 134217728,
      "percentage": 39.1
    }
  }
}
```

### Authentication

#### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "message": "Account created successfully"
}
```

### Agents

#### GET /api/agents

List all agents for the authenticated user.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-id",
      "name": "Customer Support Agent",
      "description": "AI agent for customer support",
      "systemPrompt": "You are a helpful customer support agent...",
      "greetingMessage": "Hello! How can I help you today?",
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 1000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "knowledgeSources": [],
      "_count": {
        "conversations": 5
      }
    }
  ]
}
```

#### POST /api/agents

Create a new agent.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "Customer Support Agent",
  "description": "AI agent for customer support",
  "systemPrompt": "You are a helpful customer support agent...",
  "greetingMessage": "Hello! How can I help you today?",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-id",
    "name": "Customer Support Agent",
    "description": "AI agent for customer support",
    "systemPrompt": "You are a helpful customer support agent...",
    "greetingMessage": "Hello! How can I help you today?",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 1000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/agents/{id}

Get a specific agent by ID.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "agent-id",
    "name": "Customer Support Agent",
    "description": "AI agent for customer support",
    "systemPrompt": "You are a helpful customer support agent...",
    "greetingMessage": "Hello! How can I help you today?",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 1000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "knowledgeSources": [
      {
        "id": "ks-id",
        "name": "Company Website",
        "url": "https://example.com",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "documents": []
      }
    ],
    "conversations": [
      {
        "id": "conv-id",
        "title": "Customer inquiry",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "_count": {
      "conversations": 5
    }
  }
}
```

#### PUT /api/agents/{id}

Update an existing agent.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "systemPrompt": "Updated system prompt...",
  "greetingMessage": "Updated greeting",
  "model": "gpt-4",
  "temperature": 0.8,
  "maxTokens": 1500
}
```

#### DELETE /api/agents/{id}

Delete an agent.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

### Knowledge Sources

#### POST /api/knowledge-sources

Create a new knowledge source.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "Company Website",
  "url": "https://example.com",
  "agentId": "agent-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ks-id",
    "name": "Company Website",
    "url": "https://example.com",
    "status": "pending",
    "agentId": "agent-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/knowledge-sources/{id}/process

Process a knowledge source (crawl and embed content).

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ks-id",
    "status": "processing",
    "message": "Processing started"
  }
}
```

#### GET /api/knowledge-sources/{id}/process

Check processing status of a knowledge source.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ks-id",
    "status": "completed",
    "documentsProcessed": 25,
    "lastProcessed": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /api/knowledge-sources/{id}

Delete a knowledge source.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "message": "Knowledge source deleted successfully"
}
```

### Debug

#### GET /api/debug/knowledge-sources/{id}

Get debug information for a knowledge source.

**Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ks-id",
    "name": "Company Website",
    "url": "https://example.com",
    "status": "completed",
    "agent": {
      "id": "agent-id",
      "name": "Customer Support Agent"
    },
    "documents": [
      {
        "id": "doc-id",
        "content": "Document content...",
        "embedding": [0.1, 0.2, 0.3],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "crawlStats": {
      "pagesFound": 50,
      "pagesProcessed": 25,
      "errors": 0
    },
    "embeddingStats": {
      "totalTokens": 10000,
      "averageTokensPerDocument": 400,
      "embeddingModel": "text-embedding-ada-002"
    }
  }
}
```

### Chat

#### POST /api/chat

Send a message to an AI agent.

**Authentication**: Required

**Request Body:**
```json
{
  "message": "Hello, I need help with my order",
  "agentId": "agent-id",
  "conversationId": "conv-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Hello! I'd be happy to help you with your order. Could you please provide your order number?",
    "conversationId": "conv-id",
    "messageId": "msg-id",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "tokensUsed": 150,
    "model": "gpt-4"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error |

## Common Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email address"
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Please sign in to access this resource"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
// Initialize API client
const apiClient = {
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + sessionToken
  }
};

// Create an agent
const createAgent = async (agentData) => {
  const response = await fetch(`${apiClient.baseURL}/agents`, {
    method: 'POST',
    headers: apiClient.headers,
    body: JSON.stringify(agentData)
  });
  return response.json();
};

// Send a chat message
const sendMessage = async (message, agentId) => {
  const response = await fetch(`${apiClient.baseURL}/chat`, {
    method: 'POST',
    headers: apiClient.headers,
    body: JSON.stringify({ message, agentId })
  });
  return response.json();
};
```

### Python

```python
import requests
import json

class CustomerSupportAPI:
    def __init__(self, base_url, session_token):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {session_token}'
        }
    
    def create_agent(self, agent_data):
        response = requests.post(
            f'{self.base_url}/agents',
            headers=self.headers,
            json=agent_data
        )
        return response.json()
    
    def send_message(self, message, agent_id):
        response = requests.post(
            f'{self.base_url}/chat',
            headers=self.headers,
            json={'message': message, 'agentId': agent_id}
        )
        return response.json()

# Usage
api = CustomerSupportAPI('http://localhost:3000/api', 'your-session-token')
```

## Webhook Events

The API supports webhook events for real-time updates:

### Knowledge Source Processing
```json
{
  "event": "knowledge_source.processing_complete",
  "data": {
    "id": "ks-id",
    "status": "completed",
    "documentsProcessed": 25,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Agent Response
```json
{
  "event": "agent.response_generated",
  "data": {
    "conversationId": "conv-id",
    "messageId": "msg-id",
    "response": "Generated response text",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Best Practices

1. **Rate Limiting**: Implement exponential backoff for rate-limited requests
2. **Error Handling**: Always check the `success` field in responses
3. **Security**: Never expose API keys in client-side code
4. **Caching**: Cache agent and knowledge source data to reduce API calls
5. **Pagination**: Use pagination for large data sets
6. **Versioning**: API versioning will be implemented in future releases

## Support

For API support and questions:
- Documentation: See README.md
- Issues: GitHub Issues
- Email: support@example.com

---

*This documentation is generated for Tonmate v1.0.0*
