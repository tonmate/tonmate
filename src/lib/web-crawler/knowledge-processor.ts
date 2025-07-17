import { CrawledPage, KnowledgeChunk } from './types';

export interface ChunkingOptions {
  maxChunkSize: number;
  chunkOverlap: number;
  minChunkSize: number;
  preserveStructure: boolean;
  separators: string[];
}

export class KnowledgeProcessor {
  private options: ChunkingOptions;

  constructor(options: ChunkingOptions = {
    maxChunkSize: 1000,
    chunkOverlap: 200,
    minChunkSize: 100,
    preserveStructure: true,
    separators: ['\n\n', '\n', '.', '!', '?', ';', ':', ' ']
  }) {
    this.options = options;
  }

  /**
   * Process crawled pages into knowledge chunks ready for LLM consumption
   */
  async processPages(pages: CrawledPage[], knowledgeBaseId: string): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = [];
    
    for (const page of pages) {
      const pageChunks = await this.processPage(page, knowledgeBaseId);
      chunks.push(...pageChunks);
    }

    return chunks;
  }

  /**
   * Process a single page into chunks
   */
  private async processPage(page: CrawledPage, knowledgeBaseId: string): Promise<KnowledgeChunk[]> {
    const chunks: KnowledgeChunk[] = [];
    
    // Prepare content for chunking
    const content = this.prepareContent(page);
    
    // Split content into chunks
    const textChunks = this.chunkText(content);
    
    // Create knowledge chunks
    textChunks.forEach((chunk, index) => {
      if (chunk.length >= this.options.minChunkSize) {
        chunks.push({
          id: this.generateChunkId(page.id, index),
          content: chunk,
          metadata: {
            url: page.url,
            title: page.title,
            depth: page.depth,
            chunkIndex: index,
            totalChunks: textChunks.length,
            originalPageId: page.id,
            crawledAt: page.createdAt,
            ...page.metadata
          },
          pageId: page.id,
          knowledgeBaseId,
          chunkIndex: index,
          createdAt: new Date()
        });
      }
    });

    return chunks;
  }

  /**
   * Prepare content for chunking by cleaning and structuring
   */
  private prepareContent(page: CrawledPage): string {
    let content = page.content;

    // Add title as context
    if (page.title) {
      content = `Title: ${page.title}\n\n${content}`;
    }

    // Add URL as context
    content = `URL: ${page.url}\n${content}`;

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Remove very short lines that might be navigation elements
    const lines = content.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 3 && !this.isNavigationLine(trimmed);
    });

    return cleanedLines.join('\n');
  }

  /**
   * Check if a line is likely navigation/UI element
   */
  private isNavigationLine(line: string): boolean {
    const navPatterns = [
      /^(home|about|contact|services|products|blog|news|login|register|sign up|sign in)$/i,
      /^(menu|navigation|nav|breadcrumb|skip to)$/i,
      /^(back|next|previous|more|read more|continue)$/i,
      /^(search|filter|sort|view all)$/i,
      /^\d+$/, // Just numbers
      /^(©|copyright|all rights reserved)/i
    ];

    return navPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Split text into chunks using recursive approach
   */
  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    
    if (text.length <= this.options.maxChunkSize) {
      return [text];
    }

    // Try to split using separators in order of preference
    for (const separator of this.options.separators) {
      const splits = text.split(separator);
      
      if (splits.length > 1) {
        let currentChunk = '';
        
        for (let i = 0; i < splits.length; i++) {
          const part = splits[i];
          const testChunk = currentChunk + (currentChunk ? separator : '') + part;
          
          if (testChunk.length <= this.options.maxChunkSize) {
            currentChunk = testChunk;
          } else {
            // Current chunk is ready
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            
            // Start new chunk with current part
            if (part.length > this.options.maxChunkSize) {
              // Recursively chunk this part
              const subChunks = this.chunkText(part);
              chunks.push(...subChunks);
              currentChunk = '';
            } else {
              currentChunk = part;
            }
          }
        }
        
        // Add the last chunk
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        break;
      }
    }

    // If no separator worked, split by character count
    if (chunks.length === 0) {
      for (let i = 0; i < text.length; i += this.options.maxChunkSize) {
        chunks.push(text.slice(i, i + this.options.maxChunkSize));
      }
    }

    // Add overlap between chunks
    return this.addOverlap(chunks);
  }

  /**
   * Add overlap between chunks for better context
   */
  private addOverlap(chunks: string[]): string[] {
    if (chunks.length <= 1 || this.options.chunkOverlap <= 0) {
      return chunks;
    }

    const overlappedChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];
      
      // Add overlap from previous chunk
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlap = prevChunk.slice(-this.options.chunkOverlap);
        chunk = overlap + ' ' + chunk;
      }
      
      // Add overlap from next chunk
      if (i < chunks.length - 1) {
        const nextChunk = chunks[i + 1];
        const overlap = nextChunk.slice(0, this.options.chunkOverlap);
        chunk = chunk + ' ' + overlap;
      }
      
      overlappedChunks.push(chunk);
    }

    return overlappedChunks;
  }

  /**
   * Create embeddings for chunks (placeholder for actual embedding service)
   */
  async createEmbeddings(chunks: KnowledgeChunk[]): Promise<KnowledgeChunk[]> {
    // This would integrate with your embedding service (OpenAI, Cohere, etc.)
    // For now, we'll just return the chunks without embeddings
    return chunks.map(chunk => ({
      ...chunk,
      // embedding: await this.embeddingService.embed(chunk.content)
    }));
  }

  /**
   * Search through knowledge chunks
   */
  searchChunks(chunks: KnowledgeChunk[], query: string, limit: number = 10): KnowledgeChunk[] {
    // Simple text-based search (would be replaced with vector search)
    const queryLower = query.toLowerCase();
    
    const scored = chunks.map(chunk => ({
      chunk,
      score: this.calculateTextSimilarity(chunk.content.toLowerCase(), queryLower)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.chunk);
  }

  /**
   * Simple text similarity calculation
   */
  private calculateTextSimilarity(text: string, query: string): number {
    const textWords = new Set(text.split(/\s+/));
    const queryWords = new Set(query.split(/\s+/));
    
    let matches = 0;
    for (const word of queryWords) {
      if (textWords.has(word)) {
        matches++;
      }
    }
    
    return queryWords.size > 0 ? matches / queryWords.size : 0;
  }

  /**
   * Generate context-aware prompt from chunks
   */
  generatePromptContext(chunks: KnowledgeChunk[], query: string): string {
    const contextParts: string[] = [];
    
    contextParts.push("Based on the following information from the website:");
    contextParts.push("");
    
    chunks.forEach((chunk, index) => {
      contextParts.push(`Source ${index + 1} (${chunk.metadata.url}):`);
      contextParts.push(`Title: ${chunk.metadata.title}`);
      contextParts.push(`Content: ${chunk.content}`);
      contextParts.push("");
    });
    
    contextParts.push(`User Question: ${query}`);
    contextParts.push("");
    contextParts.push("Please provide a helpful and accurate response based on the information above. If the information doesn't contain the answer, please say so.");
    
    return contextParts.join("\n");
  }

  private generateChunkId(pageId: string, chunkIndex: number): string {
    return `chunk_${pageId}_${chunkIndex}`;
  }
}
