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

For technical support or feature requests, please check the project documentation or create an issue in the repository.
