import { CrawlOptions, PageOptions, CrawledPage, CrawlProgress } from './types';
import { load } from 'cheerio';
import { URL } from 'url';

export class WebCrawler {
  private visited: Set<string> = new Set();
  private queue: Array<{ url: string; depth: number }> = [];
  private options: CrawlOptions;
  private pageOptions: PageOptions;
  private onProgress?: (progress: CrawlProgress) => void;
  private abortController: AbortController;

  constructor(
    options: CrawlOptions,
    pageOptions: PageOptions,
    onProgress?: (progress: CrawlProgress) => void
  ) {
    this.options = options;
    this.pageOptions = pageOptions;
    this.onProgress = onProgress;
    this.abortController = new AbortController();
  }

  async crawl(startUrl: string): Promise<CrawledPage[]> {
    const results: CrawledPage[] = [];
    this.queue.push({ url: startUrl, depth: 0 });

    const robotsCache: Map<string, any> = new Map();

    while (this.queue.length > 0 && results.length < this.options.pageLimit) {
      if (this.abortController.signal.aborted) {
        break;
      }

      const { url, depth } = this.queue.shift()!;
      
      if (this.visited.has(url) || depth > this.options.maxDepth) {
        continue;
      }

      this.visited.add(url);

      try {
        // Check robots.txt if enabled
        if (this.options.respectRobotsTxt && !await this.canCrawl(url, robotsCache)) {
          continue;
        }

        // Check domain restrictions
        if (!this.isDomainAllowed(url)) {
          continue;
        }

        // Check path restrictions
        if (!this.isPathAllowed(url)) {
          continue;
        }

        this.emitProgress({
          type: 'state',
          data: {
            status: 'running',
            progress: (results.length / this.options.pageLimit) * 100,
            totalPages: this.options.pageLimit,
            completedPages: results.length
          }
        });

        const page = await this.crawlPage(url, depth);
        results.push(page);

        this.emitProgress({
          type: 'result',
          data: {
            url: url,
            completedPages: results.length
          }
        });

        // Add new links to queue
        if (depth < this.options.maxDepth) {
          const newLinks = await this.extractLinks(page.htmlContent || '', url);
          for (const link of newLinks) {
            if (!this.visited.has(link)) {
              this.queue.push({ url: link, depth: depth + 1 });
            }
          }
        }

        // Respect rate limiting
        if (this.options.delayBetweenRequests > 0) {
          await this.delay(this.options.delayBetweenRequests);
        }

      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
        this.emitProgress({
          type: 'error',
          data: {
            url: url,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return results;
  }

  private async crawlPage(url: string, depth: number): Promise<CrawledPage> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SupportAI Web Crawler 1.0',
        ...this.pageOptions.extraHeaders
      },
      signal: AbortSignal.timeout(this.pageOptions.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Wait if specified
    if (this.pageOptions.waitTime > 0) {
      await this.delay(this.pageOptions.waitTime);
    }

    // Extract content based on options
    let content = '';
    const title = $('title').text().trim() || '';

    if (this.pageOptions.onlyMainContent) {
      // Try to extract main content area
      const mainSelectors = ['main', 'article', '.content', '#content', '.main-content'];
      for (const selector of mainSelectors) {
        const mainContent = $(selector);
        if (mainContent.length > 0) {
          content = mainContent.text().trim();
          break;
        }
      }
      
      if (!content) {
        // Fallback to body content, removing nav, header, footer
        $('nav, header, footer, aside, script, style').remove();
        content = $('body').text().trim();
      }
    } else {
      // Include/exclude specific tags
      if (this.pageOptions.excludeTags.length > 0) {
        $(this.pageOptions.excludeTags.join(', ')).remove();
      }
      
      if (this.pageOptions.includeTags.length > 0) {
        content = $(this.pageOptions.includeTags.join(', ')).text().trim();
      } else {
        $('script, style').remove();
        content = $('body').text().trim();
      }
    }

    // Clean up content
    content = content.replace(/\s+/g, ' ').trim();

    // Extract links if requested
    const links: string[] = [];
    if (this.pageOptions.includeLinks) {
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).href;
            links.push(absoluteUrl);
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    }

    // Extract metadata
    const metadata: Record<string, any> = {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      'og:title': $('meta[property="og:title"]').attr('content') || '',
      'og:description': $('meta[property="og:description"]').attr('content') || '',
      'og:image': $('meta[property="og:image"]').attr('content') || '',
      contentType: response.headers.get('content-type') || '',
      lastModified: response.headers.get('last-modified') || '',
      contentLength: response.headers.get('content-length') || ''
    };

    return {
      id: this.generateId(),
      url,
      title,
      content,
      htmlContent: this.pageOptions.includeHtml ? html : undefined,
      metadata,
      links,
      depth,
      crawlRequestId: '', // Will be set by the service
      createdAt: new Date(),
      status: 'success'
    };
  }

  private async extractLinks(html: string, baseUrl: string): Promise<string[]> {
    const $ = load(html);
    const links: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          links.push(absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    return links;
  }

  private async canCrawl(url: string, robotsCache: Map<string, any>): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      if (!robotsCache.has(robotsUrl)) {
        try {
          const response = await fetch(robotsUrl);
          if (response.ok) {
            const robotsTxt = await response.text();
            const robotsRules = this.parseRobotsTxt(robotsTxt);
            robotsCache.set(robotsUrl, robotsRules);
          } else {
            robotsCache.set(robotsUrl, null);
          }
        } catch (e) {
          robotsCache.set(robotsUrl, null);
        }
      }

      const robotsRules = robotsCache.get(robotsUrl);
      if (robotsRules) {
        return this.isAllowedByRobots(url, robotsRules);
      }
      
      return true;
    } catch (e) {
      return true;
    }
  }

  private parseRobotsTxt(robotsTxt: string): { userAgent: string; disallowed: string[] }[] {
    const rules: { userAgent: string; disallowed: string[] }[] = [];
    const lines = robotsTxt.split('\n');
    
    let currentUserAgent = '';
    let currentDisallowed: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed) continue;
      
      if (trimmed.toLowerCase().startsWith('user-agent:')) {
        if (currentUserAgent) {
          rules.push({ userAgent: currentUserAgent, disallowed: currentDisallowed });
        }
        currentUserAgent = trimmed.substring(11).trim();
        currentDisallowed = [];
      } else if (trimmed.toLowerCase().startsWith('disallow:')) {
        const path = trimmed.substring(9).trim();
        if (path && currentUserAgent) {
          currentDisallowed.push(path);
        }
      }
    }
    
    if (currentUserAgent) {
      rules.push({ userAgent: currentUserAgent, disallowed: currentDisallowed });
    }
    
    return rules;
  }

  private isAllowedByRobots(url: string, rules: { userAgent: string; disallowed: string[] }[]): boolean {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Check for specific user agent rules first
    const specificRules = rules.find(rule => 
      rule.userAgent.toLowerCase() === 'supportai' || 
      rule.userAgent.toLowerCase() === 'supportai web crawler'
    );
    
    if (specificRules) {
      return !specificRules.disallowed.some(disallowed => 
        path.startsWith(disallowed) || disallowed === '*'
      );
    }
    
    // Check for * (all) user agent rules
    const allRules = rules.find(rule => rule.userAgent === '*');
    if (allRules) {
      return !allRules.disallowed.some(disallowed => 
        path.startsWith(disallowed) || disallowed === '*'
      );
    }
    
    return true;
  }

  private isDomainAllowed(url: string): boolean {
    if (this.options.allowedDomains.length === 0) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      return this.options.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch (e) {
      return false;
    }
  }

  private isPathAllowed(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Check exclude paths
      if (this.options.excludePaths.length > 0) {
        if (this.options.excludePaths.some(excludePath => path.startsWith(excludePath))) {
          return false;
        }
      }

      // Check include paths
      if (this.options.includePaths.length > 0) {
        return this.options.includePaths.some(includePath => path.startsWith(includePath));
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  private emitProgress(progress: CrawlProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop(): void {
    this.abortController.abort();
  }
}
