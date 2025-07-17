import { prisma } from '../db';
import { WebsiteCrawler, CrawledDocument } from '../crawler/WebsiteCrawler';
import { EmbeddingService, DocumentChunk } from '../embeddings/EmbeddingService';
import { decrypt } from '../encryption';

export interface KnowledgeProcessingOptions {
  maxPages?: number;
  maxDepth?: number;
  chunkSize?: number;
  generateEmbeddings?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  documentsProcessed: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  error?: string;
  stats?: any;
}

export class KnowledgeProcessor {
  private embeddingService?: EmbeddingService;

  constructor(private userId: string) {}

  private async logProcessingStep(
    knowledgeSourceId: string,
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    details?: any,
    url?: string,
    step?: string,
    progress?: number
  ): Promise<void> {
    try {
      await prisma.processingLog.create({
        data: {
          knowledgeSourceId,
          level,
          message,
          details: details ? JSON.stringify(details) : undefined,
          url,
          step,
          progress
        }
      });
    } catch (error) {
      console.error('Failed to log processing step:', error);
    }
  }

  private async initializeEmbeddingService(): Promise<boolean> {
    try {
      // Get user's encrypted OpenAI API key
      const user = await prisma.user.findUnique({
        where: { id: this.userId },
        select: { openaiApiKey: true }
      });

      if (!user?.openaiApiKey) {
        console.log('No OpenAI API key found for user');
        return false;
      }

      // Decrypt the API key
      const apiKey = decrypt(user.openaiApiKey);
      this.embeddingService = new EmbeddingService(apiKey);
      return true;
    } catch (error) {
      console.error('Failed to initialize embedding service:', error);
      return false;
    }
  }

  async processWebsite(
    knowledgeSourceId: string,
    url: string,
    options: KnowledgeProcessingOptions = {}
  ): Promise<ProcessingResult> {
    try {
      console.log(`🚀 Starting knowledge processing for: ${url}`);
      
      // Log processing start
      await this.logProcessingStep(
        knowledgeSourceId,
        'info',
        'Starting website processing',
        { url, options },
        url,
        'started',
        0
      );

      // Update knowledge source status
      await prisma.knowledgeSource.update({
        where: { id: knowledgeSourceId },
        data: { status: 'processing' }
      });

      const {
        maxPages = 10,
        maxDepth = 2,
        chunkSize = 1000,
        generateEmbeddings = true
      } = options;

      // Initialize embedding service if needed
      const embeddingEnabled = generateEmbeddings && await this.initializeEmbeddingService();
      
      if (!embeddingEnabled) {
        await this.logProcessingStep(
          knowledgeSourceId,
          'warning',
          'Embedding generation disabled - no API key or disabled by user',
          { generateEmbeddings, hasApiKey: !!this.embeddingService },
          url,
          'embedding_setup',
          10
        );
      }

      // 1. Crawl the website
      console.log('📡 Starting website crawl for:', url);
      await this.logProcessingStep(
        knowledgeSourceId,
        'info',
        'Starting website crawl',
        { maxPages, maxDepth },
        url,
        'crawl_start',
        15
      );
      
      const crawler = new WebsiteCrawler(url);
      console.log('🔍 Crawler initialized, starting crawl...');
      
      const crawledDocuments = await crawler.crawlWebsite({
        maxPages,
        maxDepth,
        delay: 1000
      });

      console.log(`📊 Crawl completed. Found ${crawledDocuments.length} documents`);
      
      if (crawledDocuments.length === 0) {
        console.error('❌ No documents could be crawled from the website');
        await this.logProcessingStep(
          knowledgeSourceId,
          'error',
          'No documents could be crawled from the website',
          { url, maxPages, maxDepth },
          url,
          'crawl_failed',
          20
        );
        
        // Update knowledge source status to failed
        await prisma.knowledgeSource.update({
          where: { id: knowledgeSourceId },
          data: { status: 'failed' }
        });
        
        throw new Error('No documents could be crawled from the website');
      }

      console.log(`✓ Crawled ${crawledDocuments.length} pages`);
      await this.logProcessingStep(
        knowledgeSourceId,
        'success',
        `Successfully crawled ${crawledDocuments.length} pages`,
        { 
          totalPages: crawledDocuments.length,
          pages: crawledDocuments.map(doc => ({ title: doc.title, url: doc.url, wordCount: doc.wordCount }))
        },
        url,
        'crawl_completed',
        30
      );

      // 2. Process each document
      let totalChunksCreated = 0;
      let totalEmbeddingsGenerated = 0;

      for (const [index, doc] of crawledDocuments.entries()) {
        console.log(`📄 Processing document ${index + 1}/${crawledDocuments.length}: ${doc.title}`);
        
        const progress = 30 + (index / crawledDocuments.length) * 60;
        await this.logProcessingStep(
          knowledgeSourceId,
          'info',
          `Processing document: ${doc.title}`,
          { 
            index: index + 1,
            total: crawledDocuments.length,
            title: doc.title,
            wordCount: doc.wordCount,
            url: doc.url
          },
          doc.url,
          'page_processing',
          progress
        );

        // Create document chunks for embedding
        let chunks: DocumentChunk[] = [];
        if (embeddingEnabled && this.embeddingService) {
          chunks = this.embeddingService.chunkText(doc.content, doc.url, doc.title);
          
          await this.logProcessingStep(
            knowledgeSourceId,
            'info',
            `Created ${chunks.length} chunks for embedding`,
            { chunksCount: chunks.length, chunkSize },
            doc.url,
            'chunks_created',
            progress + 5
          );
          
          if (chunks.length > 0) {
            // Generate embeddings for chunks
            chunks = await this.embeddingService.generateEmbeddings(chunks);
            
            await this.logProcessingStep(
              knowledgeSourceId,
              'success',
              `Generated embeddings for ${chunks.length} chunks`,
              { embeddingsCount: chunks.length },
              doc.url,
              'embeddings_generated',
              progress + 10
            );
          }
        }

        // Save document to database
        const document = await prisma.document.create({
          data: {
            sourceId: knowledgeSourceId,
            title: doc.title,
            content: doc.content,
            url: doc.url,
            wordCount: doc.wordCount,
            embedding: embeddingEnabled && chunks.length > 0 ? 
              JSON.stringify(chunks.map(chunk => ({
                content: chunk.content,
                embedding: chunk.embedding,
                metadata: chunk.metadata
              }))) : undefined
          }
        });
        
        await this.logProcessingStep(
          knowledgeSourceId,
          'success',
          `Document saved to database`,
          { documentId: document.id, hasEmbeddings: chunks.length > 0 },
          doc.url,
          'document_saved',
          progress + 15
        );

        totalChunksCreated += chunks.length;
        totalEmbeddingsGenerated += chunks.filter(c => c.embedding).length;

        console.log(`✓ Saved document: ${doc.title} (${chunks.length} chunks)`);
      }

      // 3. Update knowledge source with completion status
      await prisma.knowledgeSource.update({
        where: { id: knowledgeSourceId },
        data: { 
          status: 'completed',
          metadata: JSON.stringify({
            crawlStats: crawler.getStats(),
            processing: {
              documentsProcessed: crawledDocuments.length,
              chunksCreated: totalChunksCreated,
              embeddingsGenerated: totalEmbeddingsGenerated,
              embeddingEnabled,
              processedAt: new Date().toISOString()
            }
          })
        }
      });

      const result: ProcessingResult = {
        success: true,
        documentsProcessed: crawledDocuments.length,
        chunksCreated: totalChunksCreated,
        embeddingsGenerated: totalEmbeddingsGenerated,
        stats: {
          crawlStats: crawler.getStats(),
          embeddingStats: embeddingEnabled && this.embeddingService ? 
            this.embeddingService.getEmbeddingStats(
              crawledDocuments.flatMap(doc => 
                this.embeddingService!.chunkText(doc.content, doc.url, doc.title)
              )
            ) : null
        }
      };

      console.log('🎉 Knowledge processing completed successfully!');
      console.log(`📊 Results: ${result.documentsProcessed} docs, ${result.chunksCreated} chunks, ${result.embeddingsGenerated} embeddings`);
      
      // Log completion
      await this.logProcessingStep(
        knowledgeSourceId,
        'success',
        'Knowledge processing completed successfully',
        {
          documentsProcessed: result.documentsProcessed,
          chunksCreated: result.chunksCreated,
          embeddingsGenerated: result.embeddingsGenerated,
          crawlStats: crawler.getStats()
        },
        url,
        'completed',
        100
      );

      return result;

    } catch (error) {
      console.error('💥 Knowledge processing failed:', error);
      
      // Log the error
      await this.logProcessingStep(
        knowledgeSourceId,
        'error',
        'Knowledge processing failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        url,
        'failed',
        0
      );

      // Update knowledge source with error status
      await prisma.knowledgeSource.update({
        where: { id: knowledgeSourceId },
        data: { 
          status: 'failed',
          metadata: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString()
          })
        }
      });

      return {
        success: false,
        documentsProcessed: 0,
        chunksCreated: 0,
        embeddingsGenerated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async searchKnowledgeBase(
    agentId: string,
    query: string,
    limit: number = 5
  ): Promise<Array<{ content: string; url: string; title: string; similarity: number }>> {
    try {
      if (!await this.initializeEmbeddingService() || !this.embeddingService) {
        throw new Error('Embedding service not available');
      }

      // Get all documents for this agent
      const documents = await prisma.document.findMany({
        where: {
          source: {
            agentId: agentId
          }
        },
        select: {
          title: true,
          url: true,
          embedding: true
        }
      });

      if (documents.length === 0) {
        return [];
      }

      // Collect all chunks from all documents
      const allChunks: DocumentChunk[] = [];
      for (const doc of documents) {
        if (doc.embedding) {
          try {
            const chunks = JSON.parse(doc.embedding as string) as DocumentChunk[];
            allChunks.push(...chunks);
          } catch (error) {
            console.error('Failed to parse embeddings for document:', doc.title);
          }
        }
      }

      if (allChunks.length === 0) {
        return [];
      }

      // Search for similar chunks
      const results = await this.embeddingService.searchSimilarChunks(
        query,
        allChunks,
        limit,
        0.7 // Minimum similarity threshold
      );

      return results.map(result => ({
        content: result.content,
        url: result.metadata.url,
        title: result.metadata.title,
        similarity: result.similarity
      }));

    } catch (error) {
      console.error('Knowledge search failed:', error);
      return [];
    }
  }

  async getKnowledgeSourceStats(knowledgeSourceId: string) {
    const documents = await prisma.document.findMany({
      where: { sourceId: knowledgeSourceId }
    });

    const totalWords = documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
    const documentsWithEmbeddings = documents.filter(doc => doc.embedding).length;

    return {
      documentCount: documents.length,
      totalWords,
      averageWordsPerDocument: Math.round(totalWords / documents.length) || 0,
      embeddingCoverage: (documentsWithEmbeddings / documents.length) * 100
    };
  }
}
