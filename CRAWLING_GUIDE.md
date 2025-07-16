# Website Crawling and Knowledge Processing Guide

## Overview

The Universal AI Customer Support Platform now includes powerful website crawling and knowledge processing capabilities. This allows you to train your AI agents on your website content automatically.

## Features

### 🕷️ Website Crawler
- **Domain-limited crawling**: Only crawls pages within the specified domain
- **Content extraction**: Extracts titles, meta descriptions, and main textual content
- **Link discovery**: Follows internal links up to a configurable depth
- **Content filtering**: Removes navigation, ads, and non-content elements
- **Configurable limits**: Set maximum pages and crawl depth

### 🧠 Embedding System
- **Text chunking**: Splits large documents into manageable chunks with overlap
- **Vector embeddings**: Generates OpenAI embeddings for semantic search
- **Batch processing**: Efficient API usage with rate limiting
- **Cosine similarity**: Enables semantic search over knowledge base

### 📊 Knowledge Processor
- **Automated pipeline**: Combines crawling and embedding generation
- **Status tracking**: Real-time status updates during processing
- **Database integration**: Saves all crawled content and embeddings
- **Error handling**: Robust error handling with detailed logging

## How to Use

### 1. Create an Agent
1. Go to the Dashboard
2. Click "Create New Agent"
3. Fill in the agent details and create

### 2. Add Knowledge Sources
1. Navigate to `/api/knowledge-sources` endpoint or use the dashboard
2. Create a knowledge source with:
   - `name`: Descriptive name for the source
   - `url`: Website URL to crawl
   - `agentId`: ID of the agent to associate with
   - `type`: Set to "website"

### 3. Process Knowledge Source
1. In the dashboard, find your agent's knowledge sources
2. Click the "Process" button next to the source you want to crawl
3. The system will:
   - Start crawling the website
   - Extract content from each page
   - Generate embeddings for all content
   - Save everything to the database
   - Update the status to "completed"

### 4. Configuration Options

When processing a knowledge source, you can configure:

```json
{
  "maxPages": 10,        // Maximum pages to crawl
  "maxDepth": 2,         // Maximum crawl depth from starting URL
  "generateEmbeddings": true  // Whether to generate embeddings
}
```

## API Endpoints

### Create Knowledge Source
```bash
POST /api/knowledge-sources
{
  "name": "Company Website",
  "url": "https://example.com",
  "agentId": "agent-id",
  "type": "website"
}
```

### Start Processing
```bash
POST /api/knowledge-sources/{id}/process
{
  "maxPages": 10,
  "maxDepth": 2,
  "generateEmbeddings": true
}
```

### Check Processing Status
```bash
GET /api/knowledge-sources/{id}/process
```

## Status Values

- **`pending`**: Knowledge source created but not yet processed
- **`processing`**: Currently crawling and generating embeddings
- **`completed`**: Successfully processed and ready for use
- **`failed`**: Processing failed (check logs for details)

## Best Practices

### 1. Crawl Limits
- Start with small limits (5-10 pages) for testing
- Gradually increase based on your needs and API limits
- Consider your OpenAI API quota for embedding generation

### 2. Content Quality
- Ensure the target website has good, structured content
- The crawler works best with standard HTML structure
- Avoid crawling sites with heavy JavaScript rendering

### 3. API Key Management
- Ensure you have added your OpenAI API key to your user profile
- The system encrypts and securely manages your API keys
- Monitor your OpenAI usage to avoid unexpected costs

### 4. Processing Time
- Large websites may take several minutes to process
- Processing happens in the background, so you can continue using the platform
- Check the status periodically using the dashboard or API

## Technical Details

### Crawling Strategy
1. **Queue-based**: Uses breadth-first search for systematic crawling
2. **URL normalization**: Handles relative URLs and removes fragments
3. **Duplicate detection**: Avoids crawling the same page twice
4. **Respect for boundaries**: Only crawls within the specified domain

### Content Extraction
1. **Smart selection**: Prioritizes main content areas
2. **Filtering**: Removes navigation, ads, and boilerplate content
3. **Text cleaning**: Normalizes whitespace and removes empty sections
4. **Metadata extraction**: Captures titles and meta descriptions

### Embedding Generation
1. **Chunking**: Splits text into 1000-character chunks with 200-character overlap
2. **Batch processing**: Processes multiple chunks efficiently
3. **Rate limiting**: Respects OpenAI API rate limits
4. **Storage**: Saves embeddings as JSON arrays in the database

## Troubleshooting

### Common Issues

1. **Processing gets stuck**: Check if the website blocks crawlers or has complex authentication
2. **No content extracted**: Verify the website has readable text content
3. **Embedding generation fails**: Ensure your OpenAI API key is valid and has sufficient quota
4. **Status shows "failed"**: Check the server logs for detailed error messages

### Error Handling

The system includes comprehensive error handling:
- Network timeouts and connection issues
- Invalid HTML or parsing errors
- OpenAI API errors and rate limiting
- Database connection issues

All errors are logged with detailed context for debugging.

## Future Enhancements

Planned improvements include:
- Support for authenticated websites
- PDF and document crawling
- Custom content selectors
- Scheduled re-crawling
- Advanced filtering options
- Integration with other knowledge sources

## Security Notes

- All user API keys are encrypted before storage
- Crawling respects robots.txt (future enhancement)
- No sensitive data is logged
- Processing happens in secure, isolated environments

## Next Steps

### 🎯 Immediate Development Priorities

#### 1. Chat Integration with Knowledge Base
**Priority: HIGH**
- Integrate crawled knowledge into the chat API (`/api/chat`)
- Implement semantic search during conversations
- Add context injection from relevant documents
- Update chat interface to show knowledge source references

**Tasks:**
- [ ] Modify chat API to query knowledge base before generating responses
- [ ] Add similarity search functionality to find relevant document chunks
- [ ] Update chat UI to display source citations
- [ ] Test end-to-end knowledge-assisted conversations

#### 2. Enhanced Dashboard Features
**Priority: HIGH**
- Add knowledge source management interface
- Implement document viewer for crawled content
- Create processing progress indicators
- Add re-crawling capabilities

**Tasks:**
- [ ] Build knowledge source detail page
- [ ] Add document listing with search/filter
- [ ] Implement progress bars for active crawling
- [ ] Add "Re-process" button for updating knowledge

#### 3. User Experience Improvements
**Priority: MEDIUM**
- Add guided onboarding for new users
- Implement knowledge source templates
- Create crawling preview/validation
- Add bulk knowledge source management

**Tasks:**
- [ ] Design onboarding flow for first-time users
- [ ] Create predefined templates for common website types
- [ ] Add URL validation and crawling preview
- [ ] Implement batch operations for multiple sources

### 🔧 Technical Enhancements

#### 4. Advanced Crawling Features
**Priority: MEDIUM**
- Support for authenticated websites (login required)
- PDF and document file crawling
- Custom content selectors for specific website structures
- Scheduled re-crawling for content updates

**Tasks:**
- [ ] Add authentication flow for protected websites
- [ ] Implement PDF text extraction using pdf-parse
- [ ] Create custom CSS selector configuration
- [ ] Build cron job system for scheduled crawling

#### 5. Performance & Scalability
**Priority: MEDIUM**
- Implement crawling queue with job processing
- Add Redis caching for frequently accessed embeddings
- Optimize database queries with proper indexing
- Implement rate limiting and throttling

**Tasks:**
- [ ] Set up job queue system (Bull/Agenda)
- [ ] Add Redis caching layer
- [ ] Create database indexes for search performance
- [ ] Implement API rate limiting middleware

#### 6. Monitoring & Analytics
**Priority: LOW**
- Add crawling analytics and reporting
- Implement system health monitoring
- Create usage dashboards for administrators
- Add error tracking and alerting

**Tasks:**
- [ ] Build analytics collection system
- [ ] Integrate monitoring tools (DataDog/New Relic)
- [ ] Create admin dashboard for system metrics
- [ ] Set up error reporting (Sentry)

### 🚀 Production Readiness

#### 7. Security Hardening
**Priority: HIGH**
- Implement rate limiting per user/IP
- Add input validation and sanitization
- Security audit of crawling system
- GDPR compliance for data processing

**Tasks:**
- [ ] Add comprehensive rate limiting
- [ ] Implement input validation middleware
- [ ] Conduct security penetration testing
- [ ] Add data privacy controls

#### 8. Deployment & DevOps
**Priority: HIGH**
- Set up production environment on Vercel
- Configure environment variables and secrets
- Implement CI/CD pipeline
- Add database backup and recovery

**Tasks:**
- [ ] Deploy to Vercel production
- [ ] Configure production database (PostgreSQL)
- [ ] Set up GitHub Actions for CI/CD
- [ ] Implement automated database backups

### 📊 Quality Assurance

#### 9. Testing & Validation
**Priority: MEDIUM**
- Write comprehensive test suite
- Add integration tests for crawling pipeline
- Implement end-to-end testing
- Performance testing under load

**Tasks:**
- [ ] Write unit tests for crawler and embedding services
- [ ] Add integration tests for API endpoints
- [ ] Implement E2E tests with Playwright
- [ ] Conduct load testing with realistic data

#### 10. Documentation & Training
**Priority: LOW**
- Create user documentation and tutorials
- Add API documentation with examples
- Record demo videos
- Write developer setup guide

**Tasks:**
- [ ] Write comprehensive user manual
- [ ] Generate API documentation with Swagger
- [ ] Create video tutorials for common workflows
- [ ] Document development environment setup

### 🎯 Development Timeline

**Week 1-2: Core Chat Integration**
- Focus on integrating knowledge base with chat system
- Implement semantic search in conversations
- Test end-to-end knowledge-assisted responses

**Week 3-4: Dashboard Enhancement**
- Build advanced knowledge source management
- Add document viewing and search capabilities
- Implement progress tracking and re-crawling

**Week 5-6: Production Deployment**
- Security hardening and performance optimization
- Deploy to production environment
- Set up monitoring and backup systems

**Week 7-8: Advanced Features**
- Implement authenticated crawling
- Add PDF support and custom selectors
- Build analytics and reporting features

### 💡 Feature Ideas for Future Versions

- **Multi-language Support**: Automatic language detection and translation
- **Visual Content Analysis**: Extract text from images using OCR
- **Social Media Integration**: Crawl and analyze social media content
- **API Integrations**: Connect with CRM systems and help desks
- **AI Training Feedback**: Learn from user interactions to improve responses
- **Custom AI Models**: Support for fine-tuned models beyond OpenAI
- **Real-time Collaboration**: Multi-user editing of knowledge bases
- **Knowledge Graphs**: Build interconnected knowledge representations

### 🔗 Getting Started with Next Steps

1. **Choose your priority**: Start with chat integration for immediate value
2. **Set up development environment**: Ensure all dependencies are installed
3. **Create feature branch**: Use Git flow for organized development
4. **Test thoroughly**: Validate each feature before moving to the next
5. **Document progress**: Update this guide as features are completed

For technical support or feature requests, please check the project documentation or create an issue in the repository.
