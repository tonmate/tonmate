import { OpenAI } from 'openai';

export interface DocumentChunk {
  content: string;
  embedding?: number[];
  metadata: {
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
    wordCount: number;
    isStructured?: boolean;
    structuredType?: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'mixed';
    containsMarkdown?: boolean;
  };
}

export interface EmbeddingConfig {
  model?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  maxTokens?: number;
}

export class EmbeddingService {
  private openai: OpenAI;
  private config: Required<EmbeddingConfig>;

  constructor(apiKey: string, config: EmbeddingConfig = {}) {
    this.openai = new OpenAI({ apiKey });
    this.config = {
      model: config.model || 'text-embedding-3-small',
      chunkSize: config.chunkSize || 1000,
      chunkOverlap: config.chunkOverlap || 200,
      maxTokens: config.maxTokens || 8000
    };
  }

  /**
   * Split structured content into intelligent chunks for embedding
   */
  chunkStructuredContent(content: string, structuredContent: any, url: string, title: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    
    if (structuredContent) {
      // Process headings with their content
      structuredContent.headings.forEach((heading: any, index: number) => {
        if (heading.content && heading.content.trim()) {
          chunks.push({
            content: `${heading.level} ${heading.content}`,
            metadata: {
              url,
              title,
              chunkIndex: chunks.length,
              totalChunks: 0,
              wordCount: heading.content.split(/\s+/).length,
              isStructured: true,
              structuredType: 'heading'
            }
          });
        }
      });
      
      // Process paragraphs
      structuredContent.paragraphs.forEach((paragraph: any) => {
        if (paragraph.content && paragraph.content.trim()) {
          chunks.push({
            content: paragraph.content,
            metadata: {
              url,
              title,
              chunkIndex: chunks.length,
              totalChunks: 0,
              wordCount: paragraph.content.split(/\s+/).length,
              isStructured: true,
              structuredType: 'paragraph'
            }
          });
        }
      });
      
      // Process lists
      structuredContent.lists.forEach((list: any) => {
        if (list.items && list.items.length > 0) {
          const listContent = list.items.map((item: any) => `• ${item.content}`).join('\n');
          chunks.push({
            content: listContent,
            metadata: {
              url,
              title,
              chunkIndex: chunks.length,
              totalChunks: 0,
              wordCount: listContent.split(/\s+/).length,
              isStructured: true,
              structuredType: 'list'
            }
          });
        }
      });
      
      // Process tables
      structuredContent.tables.forEach((table: any) => {
        if (table.rows && table.rows.length > 0) {
          const tableContent = table.rows
            .filter((row: any) => row && row.cells && Array.isArray(row.cells))
            .map((row: any) => 
              row.cells
                .filter((cell: any) => cell && cell.content)
                .map((cell: any) => cell.content)
                .join(' | ')
            )
            .filter((rowContent: string) => rowContent.trim().length > 0)
            .join('\n');
          
          // Only create chunk if table has actual content
          if (tableContent.trim().length > 0) {
            chunks.push({
              content: tableContent,
              metadata: {
                url,
                title,
                chunkIndex: chunks.length,
                totalChunks: 0,
                wordCount: tableContent.split(/\s+/).length,
                isStructured: true,
                structuredType: 'table'
              }
            });
          }
        }
      });
      
      // Process code blocks
      structuredContent.codeBlocks.forEach((codeBlock: any) => {
        if (codeBlock.content && codeBlock.content.trim()) {
          chunks.push({
            content: `Code (${codeBlock.language || 'unknown'}):\n${codeBlock.content}`,
            metadata: {
              url,
              title,
              chunkIndex: chunks.length,
              totalChunks: 0,
              wordCount: codeBlock.content.split(/\s+/).length,
              isStructured: true,
              structuredType: 'code'
            }
          });
        }
      });
    }
    
    // If no structured content was processed, fall back to regular text chunking
    if (chunks.length === 0) {
      return this.chunkText(content, url, title);
    }
    
    // Update totalChunks for all chunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });
    
    return chunks;
  }
  
  /**
   * Split text into chunks for embedding (fallback method)
   */
  chunkText(text: string, url: string, title: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentWordCount = 0;
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      const sentenceWordCount = words.length;
      
      // If adding this sentence would exceed chunk size, save current chunk
      if (currentWordCount + sentenceWordCount > this.config.chunkSize && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            url,
            title,
            chunkIndex: chunks.length,
            totalChunks: 0, // Will be updated later
            wordCount: currentWordCount,
            isStructured: false,
            structuredType: 'mixed'
          }
        });
        
        // Start new chunk with overlap
        const overlapWords = Math.min(this.config.chunkOverlap, currentWordCount);
        const overlapText = currentChunk.split(/\s+/).slice(-overlapWords).join(' ');
        currentChunk = overlapText + ' ' + sentence.trim();
        currentWordCount = overlapWords + sentenceWordCount;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence.trim();
        currentWordCount += sentenceWordCount;
      }
    }
    
    // Add final chunk if it has content
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          url,
          title,
          chunkIndex: chunks.length,
          totalChunks: 0,
          wordCount: currentWordCount,
          isStructured: false,
          structuredType: 'mixed'
        }
      });
    }
    
    // Update totalChunks for all chunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });
    
    return chunks;
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const embeddedChunks: DocumentChunk[] = [];
    
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    
    // Process in batches to avoid rate limits
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      try {
        const texts = batch.map(chunk => chunk.content);
        const response = await this.openai.embeddings.create({
          model: this.config.model,
          input: texts
        });
        
        // Add embeddings to chunks
        batch.forEach((chunk, index) => {
          embeddedChunks.push({
            ...chunk,
            embedding: response.data[index].embedding
          });
        });
        
        console.log(`✓ Generated embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
        
        // Rate limiting - wait between batches
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error generating embeddings for batch starting at ${i}:`, error);
        
        // Add chunks without embeddings so they're not lost
        batch.forEach(chunk => {
          embeddedChunks.push({
            ...chunk,
            embedding: undefined
          });
        });
      }
    }
    
    console.log(`✓ Embedding generation completed: ${embeddedChunks.filter(c => c.embedding).length}/${embeddedChunks.length} successful`);
    return embeddedChunks;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search for similar chunks based on query embedding
   */
  async searchSimilarChunks(
    query: string, 
    chunks: DocumentChunk[], 
    limit: number = 5,
    minSimilarity: number = 0.7
  ): Promise<Array<DocumentChunk & { similarity: number }>> {
    // Generate embedding for query
    const queryResponse = await this.openai.embeddings.create({
      model: this.config.model,
      input: query
    });
    
    const queryEmbedding = queryResponse.data[0].embedding;
    
    // Calculate similarities
    const results = chunks
      .filter(chunk => chunk.embedding) // Only chunks with embeddings
      .map(chunk => ({
        ...chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  }

  /**
   * Get embedding statistics
   */
  getEmbeddingStats(chunks: DocumentChunk[]) {
    const withEmbeddings = chunks.filter(c => c.embedding);
    const totalWords = chunks.reduce((sum, c) => sum + c.metadata.wordCount, 0);
    
    return {
      totalChunks: chunks.length,
      chunksWithEmbeddings: withEmbeddings.length,
      embeddingSuccess: (withEmbeddings.length / chunks.length) * 100,
      totalWords,
      averageWordsPerChunk: Math.round(totalWords / chunks.length) || 0,
      model: this.config.model
    };
  }
}
