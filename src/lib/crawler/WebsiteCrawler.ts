import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface CrawledDocument {
  url: string;
  title: string;
  content: string;
  description?: string;
  wordCount: number;
  links: string[];
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  respectRobotsTxt?: boolean;
  delay?: number; // ms between requests
  includePatterns?: string[];
  excludePatterns?: string[];
}

export class WebsiteCrawler {
  private baseUrl: string;
  private domain: string;
  private visitedUrls = new Set<string>();
  private crawledDocuments: CrawledDocument[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = this.normalizeUrl(baseUrl);
    this.domain = new URL(this.baseUrl).hostname;
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  private isValidUrl(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url, baseUrl);
      
      // Only crawl same domain
      if (urlObj.hostname !== this.domain) {
        return false;
      }

      // Skip common non-content URLs
      const skipPatterns = [
        /\.(pdf|jpg|jpeg|png|gif|svg|css|js|ico|xml|rss)$/i,
        /\/api\//,
        /\/admin\//,
        /\/wp-admin\//,
        /\/search\?/,
        /\/tag\//,
        /\/category\//,
        /#/
      ];

      return !skipPatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractContent($: ReturnType<typeof cheerio.load>): { title: string; content: string; description?: string } {
    // Extract title
    const title = $('title').text().trim() || 
                 $('h1').first().text().trim() || 
                 'Untitled Page';

    // Extract meta description
    const description = $('meta[name="description"]').attr('content')?.trim();

    // Remove unwanted elements
    $('script, style, nav, footer, header, .navigation, .menu, .sidebar').remove();
    
    // Extract main content
    let content = '';
    
    // Try to find main content areas
    const contentSelectors = [
      'main',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      'article',
      '.article-body',
      '#content',
      '.page-content'
    ];

    let $mainContent = null;
    for (const selector of contentSelectors) {
      $mainContent = $(selector);
      if ($mainContent.length > 0) {
        break;
      }
    }

    // If no main content found, use body but filter out navigation
    if (!$mainContent || $mainContent.length === 0) {
      $mainContent = $('body');
    }

    // Extract text content
    content = $mainContent
      .find('h1, h2, h3, h4, h5, h6, p, li, td, div')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
      .filter((text: string) => text.length > 20) // Filter out short snippets
      .join('\n\n');

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return { title, content, description };
  }

  private extractLinks($: ReturnType<typeof cheerio.load>, currentUrl: string): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_: any, element: any) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, currentUrl).href;
          if (this.isValidUrl(absoluteUrl, currentUrl)) {
            links.push(absoluteUrl);
          }
        } catch {
          // Invalid URL, skip
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  async crawlPage(url: string): Promise<CrawledDocument | null> {
    if (this.visitedUrls.has(url)) {
      return null;
    }

    this.visitedUrls.add(url);

    try {
      console.log(`Crawling: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UniversalAI-Crawler/1.0)'
        },
        maxRedirects: 3
      });

      if (!response.headers['content-type']?.includes('text/html')) {
        return null;
      }

      const $ = cheerio.load(response.data);
      const { title, content, description } = this.extractContent($);
      const links = this.extractLinks($, url);

      if (content.length < 100) {
        console.log(`Skipping ${url} - insufficient content`);
        return null;
      }

      const document: CrawledDocument = {
        url,
        title,
        content,
        description,
        wordCount: content.split(/\s+/).length,
        links
      };

      this.crawledDocuments.push(document);
      console.log(`✓ Crawled: ${title} (${document.wordCount} words)`);
      
      return document;
    } catch (error) {
      console.error(`Error crawling ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async crawlWebsite(options: CrawlOptions = {}): Promise<CrawledDocument[]> {
    const {
      maxPages = 50,
      maxDepth = 3,
      delay: delayMs = 1000
    } = options;

    const urlQueue: Array<{ url: string; depth: number }> = [{ url: this.baseUrl, depth: 0 }];
    const processedUrls = new Set<string>();

    console.log(`Starting crawl of ${this.baseUrl}`);
    console.log(`Max pages: ${maxPages}, Max depth: ${maxDepth}`);

    while (urlQueue.length > 0 && this.crawledDocuments.length < maxPages) {
      const { url, depth } = urlQueue.shift()!;

      if (processedUrls.has(url) || depth > maxDepth) {
        continue;
      }

      processedUrls.add(url);

      const document = await this.crawlPage(url);
      
      if (document && depth < maxDepth) {
        // Add linked pages to queue
        for (const link of document.links) {
          if (!processedUrls.has(link) && !urlQueue.some(item => item.url === link)) {
            urlQueue.push({ url: link, depth: depth + 1 });
          }
        }
      }

      // Rate limiting
      if (delayMs > 0) {
        await this.delay(delayMs);
      }
    }

    console.log(`✓ Crawl completed: ${this.crawledDocuments.length} pages`);
    return this.crawledDocuments;
  }

  getCrawledDocuments(): CrawledDocument[] {
    return this.crawledDocuments;
  }

  getStats() {
    const totalWords = this.crawledDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
    return {
      pagesCrawled: this.crawledDocuments.length,
      totalWords,
      averageWordsPerPage: Math.round(totalWords / this.crawledDocuments.length) || 0,
      urlsVisited: this.visitedUrls.size
    };
  }
}
