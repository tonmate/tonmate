import { PrismaClient } from '@/generated/prisma';
import { WebCrawler } from './crawler';
import { KnowledgeProcessor } from './knowledge-processor';
import { CrawlOptions, PageOptions, CrawlProgress } from './types';
import { EventEmitter } from 'events';

export class CrawlService extends EventEmitter {
  private prisma: PrismaClient;
  private activeCrawlers: Map<string, WebCrawler> = new Map();

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Start a new crawl request
   */
  async startCrawl(
    userId: string,
    url: string,
    options: Partial<CrawlOptions> = {},
    pageOptions: Partial<PageOptions> = {}
  ): Promise<string> {
    // Create crawl request in database
    const crawlRequest = await this.prisma.crawlRequest.create({
      data: {
        userId,
        url,
        status: 'pending',
        maxDepth: options.maxDepth || 2,
        pageLimit: options.pageLimit || 50,
        allowedDomains: JSON.stringify(options.allowedDomains || []),
        excludePaths: JSON.stringify(options.excludePaths || []),
        includePaths: JSON.stringify(options.includePaths || []),
        respectRobotsTxt: options.respectRobotsTxt ?? true,
        delayBetweenRequests: options.delayBetweenRequests || 1000,
        excludeTags: JSON.stringify(pageOptions.excludeTags || []),
        includeTags: JSON.stringify(pageOptions.includeTags || []),
        waitTime: pageOptions.waitTime || 0,
        includeHtml: pageOptions.includeHtml || false,
        onlyMainContent: pageOptions.onlyMainContent ?? true,
        includeLinks: pageOptions.includeLinks || false,
        timeout: pageOptions.timeout || 15000,
        extraHeaders: JSON.stringify(pageOptions.extraHeaders || {})
      }
    });

    // Start crawling asynchronously
    this.performCrawl(crawlRequest.id);

    return crawlRequest.id;
  }

  /**
   * Get crawl status
   */
  async getCrawlStatus(crawlRequestId: string) {
    const crawlRequest = await this.prisma.crawlRequest.findUnique({
      where: { id: crawlRequestId },
      include: {
        pages: {
          select: {
            id: true,
            url: true,
            title: true,
            status: true,
            depth: true,
            createdAt: true
          }
        }
      }
    });

    if (!crawlRequest) {
      throw new Error('Crawl request not found');
    }

    return crawlRequest;
  }

  /**
   * Stop an active crawl
   */
  async stopCrawl(crawlRequestId: string): Promise<void> {
    const crawler = this.activeCrawlers.get(crawlRequestId);
    if (crawler) {
      crawler.stop();
      this.activeCrawlers.delete(crawlRequestId);
    }

    await this.prisma.crawlRequest.update({
      where: { id: crawlRequestId },
      data: { status: 'stopped' }
    });
  }

  /**
   * Create knowledge base from crawl results
   */
  async createKnowledgeBase(
    crawlRequestId: string,
    name: string,
    description?: string
  ): Promise<string> {
    const crawlRequest = await this.prisma.crawlRequest.findUnique({
      where: { id: crawlRequestId },
      include: {
        pages: {
          where: { status: 'success' }
        }
      }
    });

    if (!crawlRequest) {
      throw new Error('Crawl request not found');
    }

    if (crawlRequest.status !== 'completed') {
      throw new Error('Crawl must be completed before creating knowledge base');
    }

    // Create knowledge base
    const knowledgeBase = await this.prisma.knowledgeBase.create({
      data: {
        userId: crawlRequest.userId,
        name,
        description,
        crawlRequestId,
        totalChunks: 0
      }
    });

    // Process pages into knowledge chunks
    const processor = new KnowledgeProcessor();
    const chunks = await processor.processPages(
      crawlRequest.pages.map(page => ({
        id: page.id,
        url: page.url,
        title: page.title,
        content: page.content,
        htmlContent: page.htmlContent ?? undefined,
        metadata: JSON.parse(page.metadata as string),
        links: JSON.parse(page.links as string),
        depth: page.depth,
        crawlRequestId: page.crawlRequestId,
        createdAt: page.createdAt,
        status: page.status as 'success' | 'failed'
      })),
      knowledgeBase.id
    );

    // Save chunks to database
    await this.prisma.knowledgeChunk.createMany({
      data: chunks.map(chunk => ({
        id: chunk.id,
        knowledgeBaseId: chunk.knowledgeBaseId,
        pageId: chunk.pageId,
        content: chunk.content,
        metadata: JSON.stringify(chunk.metadata),
        chunkIndex: chunk.chunkIndex,
        createdAt: chunk.createdAt
      }))
    });

    // Update total chunks count
    await this.prisma.knowledgeBase.update({
      where: { id: knowledgeBase.id },
      data: { totalChunks: chunks.length }
    });

    return knowledgeBase.id;
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(
    knowledgeBaseId: string,
    query: string,
    limit: number = 10
  ) {
    const knowledgeBase = await this.prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId },
      include: {
        chunks: {
          include: {
            page: {
              select: {
                url: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!knowledgeBase) {
      throw new Error('Knowledge base not found');
    }

    const processor = new KnowledgeProcessor();
    const chunks = knowledgeBase.chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      metadata: {
        ...chunk.metadata as any,
        url: chunk.page.url,
        title: chunk.page.title
      },
      pageId: chunk.pageId,
      knowledgeBaseId: chunk.knowledgeBaseId,
      chunkIndex: chunk.chunkIndex,
      createdAt: chunk.createdAt
    }));

    const results = processor.searchChunks(chunks, query, limit);
    return results;
  }

  /**
   * Get knowledge base details
   */
  async getKnowledgeBase(knowledgeBaseId: string) {
    const knowledgeBase = await this.prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId },
      include: {
        crawlRequest: {
          select: {
            url: true,
            status: true,
            totalPages: true,
            completedPages: true,
            createdAt: true,
            completedAt: true
          }
        },
        chunks: {
          take: 5,
          include: {
            page: {
              select: {
                url: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!knowledgeBase) {
      throw new Error('Knowledge base not found');
    }

    return knowledgeBase;
  }

  /**
   * List user's knowledge bases
   */
  async listKnowledgeBases(userId: string) {
    const knowledgeBases = await this.prisma.knowledgeBase.findMany({
      where: { userId },
      include: {
        crawlRequest: {
          select: {
            url: true,
            status: true,
            totalPages: true,
            completedPages: true,
            createdAt: true,
            completedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return knowledgeBases;
  }

  /**
   * Internal method to perform crawling
   */
  private async performCrawl(crawlRequestId: string): Promise<void> {
    try {
      const crawlRequest = await this.prisma.crawlRequest.findUnique({
        where: { id: crawlRequestId }
      });

      if (!crawlRequest) {
        throw new Error('Crawl request not found');
      }

      // Update status to running
      await this.prisma.crawlRequest.update({
        where: { id: crawlRequestId },
        data: { status: 'running' }
      });

      // Create crawler instance
      const crawler = new WebCrawler(
        {
          maxDepth: crawlRequest.maxDepth,
          pageLimit: crawlRequest.pageLimit,
          allowedDomains: JSON.parse(crawlRequest.allowedDomains as string),
          excludePaths: JSON.parse(crawlRequest.excludePaths as string),
          includePaths: JSON.parse(crawlRequest.includePaths as string),
          respectRobotsTxt: crawlRequest.respectRobotsTxt,
          delayBetweenRequests: crawlRequest.delayBetweenRequests
        },
        {
          excludeTags: JSON.parse(crawlRequest.excludeTags as string),
          includeTags: JSON.parse(crawlRequest.includeTags as string),
          waitTime: crawlRequest.waitTime,
          includeHtml: crawlRequest.includeHtml,
          onlyMainContent: crawlRequest.onlyMainContent,
          includeLinks: crawlRequest.includeLinks,
          timeout: crawlRequest.timeout,
          extraHeaders: JSON.parse(crawlRequest.extraHeaders as string)
        },
        (progress: CrawlProgress) => {
          this.handleCrawlProgress(crawlRequestId, progress);
        }
      );

      this.activeCrawlers.set(crawlRequestId, crawler);

      // Start crawling
      const pages = await crawler.crawl(crawlRequest.url);

      // Save pages to database
      for (const page of pages) {
        await this.prisma.crawledPage.create({
          data: {
            id: page.id,
            crawlRequestId,
            url: page.url,
            title: page.title,
            content: page.content,
            htmlContent: page.htmlContent,
            metadata: JSON.stringify(page.metadata),
            links: JSON.stringify(page.links),
            depth: page.depth,
            status: page.status,
            error: page.error
          }
        });
      }

      // Update crawl request as completed
      await this.prisma.crawlRequest.update({
        where: { id: crawlRequestId },
        data: {
          status: 'completed',
          completedPages: pages.length,
          totalPages: pages.length,
          completedAt: new Date()
        }
      });

      this.activeCrawlers.delete(crawlRequestId);
      
    } catch (error) {
      console.error(`Crawl failed for request ${crawlRequestId}:`, error);
      
      await this.prisma.crawlRequest.update({
        where: { id: crawlRequestId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      this.activeCrawlers.delete(crawlRequestId);
    }
  }

  /**
   * Handle crawl progress updates
   */
  private async handleCrawlProgress(crawlRequestId: string, progress: CrawlProgress): Promise<void> {
    if (progress.type === 'state') {
      await this.prisma.crawlRequest.update({
        where: { id: crawlRequestId },
        data: {
          progress: progress.data.progress,
          totalPages: progress.data.totalPages,
          completedPages: progress.data.completedPages
        }
      });
    }

    // Emit progress event for real-time updates
    this.emit('progress', { crawlRequestId, progress });
  }
}
