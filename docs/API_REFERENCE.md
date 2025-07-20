# API Reference

Tonmate provides a RESTful API for managing AI agents, knowledge sources, and conversations.

## Base URL
```
https://your-domain.com/api
```

## Authentication

All API endpoints require authentication using session tokens or API keys.

### Session Authentication
Include session cookie in requests:
```bash
curl -X GET "https://your-domain.com/api/agents" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### API Key Authentication
Include API key in headers:
```bash
curl -X GET "https://your-domain.com/api/agents" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Endpoints

### Health Check

#### GET /api/health
Returns system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "responseTime": 25
    },
    "environment": {
      "status": "healthy",
      "message": "All required environment variables are set",
      "requiredVars": ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"],
      "missingVars": []
    },
    "memory": {
      "status": "healthy",
      "used": 134217728,
      "total": 536870912,
      "percentage": 25
    }
  }
}
```

### Agents

#### GET /api/agents
List all AI agents for the authenticated user.

**Response:**
```json
{
  "agents": [
    {
      "id": "agent-123",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries",
      "prompt": "You are a helpful customer support agent...",
      "greeting": "Hello! How can I help you today?",
      "temperature": 0.7,
      "llmProvider": "openai",
      "model": "gpt-4",
      "maxTokens": 2000,
      "settings": "{}",
      "createdAt": "2024-01-20T12:00:00Z",
      "updatedAt": "2024-01-20T12:00:00Z",
      "knowledgeSources": []
    }
  ]
}
```

#### POST /api/agents
Create a new AI agent.

**Request Body:**
```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "prompt": "You are a helpful customer support agent...",
  "greeting": "Hello! How can I help you today?",
  "temperature": 0.7,
  "llmProvider": "openai",
  "model": "gpt-4",
  "maxTokens": 2000,
  "settings": {}
}
```

**Response:**
```json
{
  "id": "agent-123",
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "prompt": "You are a helpful customer support agent...",
  "greeting": "Hello! How can I help you today?",
  "temperature": 0.7,
  "llmProvider": "openai",
  "model": "gpt-4",
  "maxTokens": 2000,
  "settings": "{}",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z",
  "knowledgeSources": []
}
```

#### GET /api/agents/{id}
Get details of a specific agent.

**Parameters:**
- `id` (string): Agent ID

**Response:**
```json
{
  "id": "agent-123",
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "prompt": "You are a helpful customer support agent...",
  "greeting": "Hello! How can I help you today?",
  "temperature": 0.7,
  "llmProvider": "openai",
  "model": "gpt-4",
  "maxTokens": 2000,
  "settings": "{}",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z",
  "knowledgeSources": [
    {
      "id": "source-456",
      "name": "Company Website",
      "url": "https://company.com",
      "status": "completed",
      "createdAt": "2024-01-20T12:00:00Z"
    }
  ]
}
```

#### PUT /api/agents/{id}
Update an existing agent.

**Parameters:**
- `id` (string): Agent ID

**Request Body:**
```json
{
  "name": "Updated Customer Support Bot",
  "description": "Enhanced customer support agent",
  "prompt": "You are an enhanced customer support agent...",
  "temperature": 0.8,
  "model": "gpt-4-turbo"
}
```

#### DELETE /api/agents/{id}
Delete an agent.

**Parameters:**
- `id` (string): Agent ID

**Response:**
```json
{
  "message": "Agent deleted successfully"
}
```

### Knowledge Sources

#### GET /api/knowledge-sources
List all knowledge sources for the authenticated user.

**Response:**
```json
{
  "knowledgeSources": [
    {
      "id": "source-456",
      "name": "Company Website",
      "url": "https://company.com",
      "status": "completed",
      "agentId": "agent-123",
      "createdAt": "2024-01-20T12:00:00Z",
      "updatedAt": "2024-01-20T12:00:00Z"
    }
  ]
}
```

#### POST /api/knowledge-sources
Create a new knowledge source.

**Request Body:**
```json
{
  "name": "Company Website",
  "url": "https://company.com",
  "agentId": "agent-123"
}
```

**Response:**
```json
{
  "id": "source-456",
  "name": "Company Website",
  "url": "https://company.com",
  "status": "processing",
  "agentId": "agent-123",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

#### DELETE /api/knowledge-sources/{id}
Delete a knowledge source.

**Parameters:**
- `id` (string): Knowledge source ID

**Response:**
```json
{
  "message": "Knowledge source deleted successfully"
}
```

### Conversations

#### GET /api/conversations
List all conversations for the authenticated user.

**Query Parameters:**
- `limit` (number, optional): Number of conversations to return (default: 20)
- `offset` (number, optional): Number of conversations to skip (default: 0)

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-789",
      "title": "Customer Support Chat",
      "agentId": "agent-123",
      "userId": "user-456",
      "messages": [
        {
          "type": "user",
          "content": "Hello, I need help with my order",
          "timestamp": "2024-01-20T12:00:00Z"
        },
        {
          "type": "bot",
          "content": "I'd be happy to help with your order. Can you provide your order number?",
          "timestamp": "2024-01-20T12:00:01Z"
        }
      ],
      "createdAt": "2024-01-20T12:00:00Z",
      "updatedAt": "2024-01-20T12:00:01Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### POST /api/conversations
Create a new conversation.

**Request Body:**
```json
{
  "agentId": "agent-123",
  "title": "Customer Support Chat",
  "message": "Hello, I need help with my order"
}
```

**Response:**
```json
{
  "id": "conv-789",
  "title": "Customer Support Chat",
  "agentId": "agent-123",
  "userId": "user-456",
  "messages": [
    {
      "type": "user",
      "content": "Hello, I need help with my order",
      "timestamp": "2024-01-20T12:00:00Z"
    },
    {
      "type": "bot",
      "content": "I'd be happy to help with your order. Can you provide your order number?",
      "timestamp": "2024-01-20T12:00:01Z"
    }
  ],
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:01Z"
}
```

#### GET /api/conversations/{id}
Get details of a specific conversation.

**Parameters:**
- `id` (string): Conversation ID

**Response:**
```json
{
  "id": "conv-789",
  "title": "Customer Support Chat",
  "agentId": "agent-123",
  "userId": "user-456",
  "messages": [
    {
      "type": "user",
      "content": "Hello, I need help with my order",
      "timestamp": "2024-01-20T12:00:00Z"
    },
    {
      "type": "bot",
      "content": "I'd be happy to help with your order. Can you provide your order number?",
      "timestamp": "2024-01-20T12:00:01Z"
    }
  ],
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:01Z"
}
```

#### DELETE /api/conversations/{id}
Delete a conversation.

**Parameters:**
- `id` (string): Conversation ID

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

### Chat

#### POST /api/chat
Send a message to an AI agent.

**Request Body:**
```json
{
  "message": "Hello, I need help with my order",
  "agentId": "agent-123",
  "conversationId": "conv-789"
}
```

**Response:**
```json
{
  "message": "I'd be happy to help with your order. Can you provide your order number?",
  "conversationId": "conv-789",
  "timestamp": "2024-01-20T12:00:01Z"
}
```

### Settings

#### GET /api/settings
Get user settings.

**Response:**
```json
{
  "llmSettings": {
    "openai": {
      "apiKey": "sk-...",
      "model": "gpt-4",
      "temperature": 0.7
    },
    "anthropic": {
      "apiKey": "sk-...",
      "model": "claude-3-sonnet"
    }
  },
  "crawlerSettings": {
    "maxPages": 100,
    "maxDepth": 5,
    "timeout": 60000,
    "concurrency": 8
  }
}
```

#### PUT /api/settings
Update user settings.

**Request Body:**
```json
{
  "llmSettings": {
    "openai": {
      "apiKey": "sk-...",
      "model": "gpt-4-turbo",
      "temperature": 0.8
    }
  }
}
```

**Response:**
```json
{
  "message": "Settings updated successfully"
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

Error response format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- General endpoints: 100 requests per minute
- Chat endpoints: 10 requests per minute
- Knowledge processing: 5 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

## Webhooks

The platform supports webhooks for real-time notifications:

### Webhook Events
- `conversation.created` - New conversation started
- `conversation.updated` - Conversation updated
- `knowledge.processed` - Knowledge source processing completed
- `agent.created` - New agent created

### Webhook Payload
```json
{
  "event": "conversation.created",
  "data": {
    "conversationId": "conv-789",
    "agentId": "agent-123",
    "userId": "user-456"
  },
  "timestamp": "2024-01-20T12:00:00Z"
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const { TonmateClient } = require('tonmate');

const client = new TonmateClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
});

// Create an agent
const agent = await client.agents.create({
  name: 'Customer Support Bot',
  description: 'Handles customer inquiries',
  model: 'gpt-4'
});

// Send a message
const response = await client.chat.send({
  message: 'Hello, I need help',
  agentId: agent.id
});
```

### Python
```python
from universal_ai_client import UniversalAIClient

client = UniversalAIClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# Create an agent
agent = client.agents.create(
    name='Customer Support Bot',
    description='Handles customer inquiries',
    model='gpt-4'
)

# Send a message
response = client.chat.send(
    message='Hello, I need help',
    agent_id=agent.id
)
```

## Support

For API support, please:
1. Check the [GitHub Issues](https://github.com/aryasadeghy/tonmate/issues)
2. Join our [Discord Community](https://discord.gg/universal-ai)
3. Email us at support@universalai.support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for API version history and breaking changes.
