// Types for web crawling and knowledge base
export interface CrawlOptions {
  maxDepth: number;
  pageLimit: number;
  allowedDomains: string[];
  excludePaths: string[];
  includePaths: string[];
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
}

export interface PageOptions {
  excludeTags: string[];
  includeTags: string[];
  waitTime: number;
  includeHtml: boolean;
  onlyMainContent: boolean;
  includeLinks: boolean;
  timeout: number;
  extraHeaders: Record<string, string>;
}

export interface CrawlRequest {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  crawlOptions: CrawlOptions;
  pageOptions: PageOptions;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  totalPages: number;
  completedPages: number;
  userId: string;
}

export interface CrawledPage {
  id: string;
  url: string;
  title: string;
  content: string;
  htmlContent?: string;
  metadata: Record<string, any>;
  links: string[];
  depth: number;
  crawlRequestId: string;
  createdAt: Date;
  status: 'success' | 'failed';
  error?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  crawlRequestId: string;
  vectorized: boolean;
  totalChunks: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  pageId: string;
  knowledgeBaseId: string;
  chunkIndex: number;
  createdAt: Date;
}

export interface CrawlProgress {
  type: 'state' | 'result' | 'error';
  data: {
    status?: string;
    progress?: number;
    url?: string;
    error?: string;
    totalPages?: number;
    completedPages?: number;
  };
}

export interface SearchResult {
  page: CrawledPage;
  relevanceScore: number;
  chunks: KnowledgeChunk[];
}
