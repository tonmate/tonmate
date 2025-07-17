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
  // NEW: Enhanced content structure for better LLM retrieval
  structuredContent?: {
    headings: Array<{ level: number; text: string; id?: string }>;
    paragraphs: string[];
    lists: Array<{ type: 'ordered' | 'unordered'; items: string[] }>;
    tables: Array<{ headers: string[]; rows: string[][] }>;
    codeBlocks: Array<{ language?: string; code: string }>;
    images: Array<{ src: string; alt: string; caption?: string }>;
  };
  markdownContent?: string; // NEW: Content in markdown format for better LLM processing
  extractedAt: Date;
  contentType: 'text' | 'structured' | 'markdown';
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  respectRobotsTxt?: boolean;
  delay?: number; // ms between requests
  includePatterns?: string[];
  excludePatterns?: string[];
  extractFullContent?: boolean; // NEW: Extract full page content including headings, paragraphs, lists, etc.
  preserveFormatting?: boolean; // NEW: Preserve HTML structure in markdown format
  includeImages?: boolean; // NEW: Include image descriptions and alt text
  extractTables?: boolean; // NEW: Extract and format table data
  extractCodeBlocks?: boolean; // NEW: Extract code blocks with syntax highlighting info
}

export class WebsiteCrawler {
  private baseUrl: string;
  private domain: string;
  private visitedUrls = new Set<string>();
  private crawledDocuments: CrawledDocument[] = [];
  private options: CrawlOptions;

  constructor(baseUrl: string, options: CrawlOptions = {}) {
    this.baseUrl = this.normalizeUrl(baseUrl);
    this.domain = new URL(this.baseUrl).hostname;
    this.options = {
      extractFullContent: true,
      preserveFormatting: true,
      includeImages: true,
      extractTables: true,
      extractCodeBlocks: true,
      ...options
    };
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

  private extractContent($: ReturnType<typeof cheerio.load>): { 
    title: string; 
    content: string; 
    description?: string;
    structuredContent?: CrawledDocument['structuredContent'];
    markdownContent?: string;
  } {
    // Extract title
    const title = $('title').text().trim() || 
                 $('h1').first().text().trim() || 
                 'Untitled Page';

    // Extract meta description
    const description = $('meta[name="description"]').attr('content')?.trim();

    // Remove unwanted elements but keep more content
    $('script, style, .advertisement, .ads, .cookie-banner, .popup, .modal, .overlay').remove();
    
    // Find main content area
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

    if (!$mainContent || $mainContent.length === 0) {
      $mainContent = $('body');
    }

    let content = '';
    let structuredContent: CrawledDocument['structuredContent'] | undefined;
    let markdownContent = '';

    if (this.options.extractFullContent) {
      // Extract structured content
      structuredContent = this.extractStructuredContent($mainContent, $);
      
      // Generate markdown content
      if (this.options.preserveFormatting) {
        markdownContent = this.generateMarkdownContent($mainContent, $);
      }
      
      // Extract comprehensive text content
      content = this.extractComprehensiveTextContent($mainContent, $);
    } else {
      // Basic text extraction (legacy mode)
      content = $mainContent
        .find('h1, h2, h3, h4, h5, h6, p, li, td, div')
        .map((_: any, el: any) => $(el).text().trim())
        .get()
        .filter((text: string) => text.length > 20)
        .join('\n\n');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return { title, content, description, structuredContent, markdownContent };
  }

  private extractStructuredContent($mainContent: any, $: ReturnType<typeof cheerio.load>): CrawledDocument['structuredContent'] {
    const structuredContent: NonNullable<CrawledDocument['structuredContent']> = {
      headings: [],
      paragraphs: [],
      lists: [],
      tables: [],
      codeBlocks: [],
      images: []
    };

    // Extract headings
    $mainContent.find('h1, h2, h3, h4, h5, h6').each((_: any, el: any) => {
      const $el = $(el);
      const level = parseInt(el.tagName.charAt(1));
      const text = $el.text().trim();
      const id = $el.attr('id');
      if (text) {
        structuredContent.headings.push({ level, text, id });
      }
    });

    // Extract paragraphs
    $mainContent.find('p').each((_: any, el: any) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) {
        structuredContent.paragraphs.push(text);
      }
    });

    // Extract lists
    if (this.options.extractFullContent) {
      $mainContent.find('ul, ol').each((_: any, el: any) => {
        const $el = $(el);
        const type = el.tagName.toLowerCase() === 'ul' ? 'unordered' : 'ordered';
        const items: string[] = [];
        $el.find('li').each((_: any, li: any) => {
          const text = $(li).text().trim();
          if (text) items.push(text);
        });
        if (items.length > 0) {
          structuredContent.lists.push({ type, items });
        }
      });
    }

    // Extract tables
    if (this.options.extractTables) {
      $mainContent.find('table').each((_: any, el: any) => {
        const $table = $(el);
        const headers: string[] = [];
        const rows: string[][] = [];
        
        // Extract headers
        $table.find('thead th, tbody tr:first-child th').each((_: any, th: any) => {
          headers.push($(th).text().trim());
        });
        
        // Extract rows
        $table.find('tbody tr, tr').each((_: any, tr: any) => {
          const $tr = $(tr);
          if ($tr.find('th').length === 0) { // Skip header rows
            const rowData: string[] = [];
            $tr.find('td').each((_: any, td: any) => {
              rowData.push($(td).text().trim());
            });
            if (rowData.length > 0) {
              rows.push(rowData);
            }
          }
        });
        
        if (headers.length > 0 || rows.length > 0) {
          structuredContent.tables.push({ headers, rows });
        }
      });
    }

    // Extract code blocks
    if (this.options.extractCodeBlocks) {
      $mainContent.find('pre code, code').each((_: any, el: any) => {
        const $el = $(el);
        const code = $el.text().trim();
        if (code && code.length > 10) {
          const language = $el.attr('class')?.match(/language-([\w-]+)/)?.[1];
          structuredContent.codeBlocks.push({ language, code });
        }
      });
    }

    // Extract images
    if (this.options.includeImages) {
      $mainContent.find('img').each((_: any, el: any) => {
        const $el = $(el);
        const src = $el.attr('src');
        const alt = $el.attr('alt') || '';
        const caption = $el.parent().find('figcaption').text().trim();
        if (src) {
          structuredContent.images.push({ src, alt, caption: caption || undefined });
        }
      });
    }

    return structuredContent;
  }

  private generateMarkdownContent($mainContent: any, $: ReturnType<typeof cheerio.load>): string {
    let markdown = '';
    
    // Convert content to markdown format
    $mainContent.find('h1, h2, h3, h4, h5, h6, p, ul, ol, pre, table').each((_: any, el: any) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          markdown += `# ${$el.text().trim()}\n\n`;
          break;
        case 'h2':
          markdown += `## ${$el.text().trim()}\n\n`;
          break;
        case 'h3':
          markdown += `### ${$el.text().trim()}\n\n`;
          break;
        case 'h4':
          markdown += `#### ${$el.text().trim()}\n\n`;
          break;
        case 'h5':
          markdown += `##### ${$el.text().trim()}\n\n`;
          break;
        case 'h6':
          markdown += `###### ${$el.text().trim()}\n\n`;
          break;
        case 'p':
          const pText = $el.text().trim();
          if (pText) {
            markdown += `${pText}\n\n`;
          }
          break;
        case 'ul':
          $el.find('li').each((_: any, li: any) => {
            const text = $(li).text().trim();
            if (text) {
              markdown += `- ${text}\n`;
            }
          });
          markdown += '\n';
          break;
        case 'ol':
          $el.find('li').each((index: number, li: any) => {
            const text = $(li).text().trim();
            if (text) {
              markdown += `${index + 1}. ${text}\n`;
            }
          });
          markdown += '\n';
          break;
        case 'pre':
          const code = $el.text().trim();
          if (code) {
            markdown += `\`\`\`\n${code}\n\`\`\`\n\n`;
          }
          break;
        case 'table':
          // Simple table markdown conversion
          const rows: string[][] = [];
          $el.find('tr').each((_: any, tr: any) => {
            const row: string[] = [];
            $(tr).find('td, th').each((_: any, cell: any) => {
              row.push($(cell).text().trim());
            });
            if (row.length > 0) {
              rows.push(row);
            }
          });
          
          if (rows.length > 0) {
            // Add header row
            markdown += `| ${rows[0].join(' | ')} |\n`;
            markdown += `| ${rows[0].map(() => '---').join(' | ')} |\n`;
            
            // Add data rows
            for (let i = 1; i < rows.length; i++) {
              markdown += `| ${rows[i].join(' | ')} |\n`;
            }
            markdown += '\n';
          }
          break;
      }
    });
    
    return markdown.trim();
  }

  private extractComprehensiveTextContent($mainContent: any, $: ReturnType<typeof cheerio.load>): string {
    const contentParts: string[] = [];
    
    // Extract ALL text content comprehensively
    $mainContent.find('h1, h2, h3, h4, h5, h6, p, span, div, section, article, main, aside, blockquote, pre, code, li, td, th, dt, dd, figcaption, legend, label, button, a').each((_: any, el: any) => {
      const $el = $(el);
      const text = $el.text().trim();
      
      // Extract text from various elements with better filtering
      if (text && text.length > 5) {
        const tagName = el.tagName.toLowerCase();
        
        // Add context for different element types
        if (tagName.startsWith('h')) {
          const level = tagName.charAt(1);
          contentParts.push(`\n\n${'#'.repeat(parseInt(level))} ${text}\n`);
        } else if (tagName === 'p') {
          contentParts.push(text);
        } else if (tagName === 'li') {
          contentParts.push(`• ${text}`);
        } else if (tagName === 'blockquote') {
          contentParts.push(`> ${text}`);
        } else if (tagName === 'pre' || tagName === 'code') {
          contentParts.push(`\`\`\`\n${text}\n\`\`\``);
        } else if (tagName === 'th') {
          contentParts.push(`**${text}**`);
        } else if (tagName === 'td') {
          contentParts.push(`| ${text}`);
        } else if (tagName === 'figcaption') {
          contentParts.push(`*${text}*`);
        } else if (tagName === 'label') {
          contentParts.push(`Label: ${text}`);
        } else if (tagName === 'button') {
          contentParts.push(`Button: ${text}`);
        } else if (tagName === 'a') {
          const href = $el.attr('href');
          if (href && !href.startsWith('#')) {
            contentParts.push(`Link: ${text} (${href})`);
          } else {
            contentParts.push(`Link: ${text}`);
          }
        } else if (text.length > 10) {
          contentParts.push(text);
        }
      }
    });
    
    // Also extract meta information
    const metaInfo: string[] = [];
    
    // Extract meta keywords
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      metaInfo.push(`Keywords: ${keywords}`);
    }
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content');
    if (description) {
      metaInfo.push(`Description: ${description}`);
    }
    
    // Extract OpenGraph data
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    if (ogTitle) metaInfo.push(`OG Title: ${ogTitle}`);
    if (ogDescription) metaInfo.push(`OG Description: ${ogDescription}`);
    
    // Extract structured data from JSON-LD
    $('script[type="application/ld+json"]').each((_: any, el: any) => {
      try {
        const jsonLd = JSON.parse($(el).html() || '{}');
        if (jsonLd.name) metaInfo.push(`Name: ${jsonLd.name}`);
        if (jsonLd.description) metaInfo.push(`Structured Description: ${jsonLd.description}`);
        if (jsonLd.offers && jsonLd.offers.price) metaInfo.push(`Price: ${jsonLd.offers.price}`);
        if (jsonLd.offers && jsonLd.offers.priceCurrency) metaInfo.push(`Currency: ${jsonLd.offers.priceCurrency}`);
      } catch (e) {
        // Ignore malformed JSON-LD
      }
    });
    
    // Combine meta info with content
    let finalContent = '';
    if (metaInfo.length > 0) {
      finalContent += `\n\n--- META INFORMATION ---\n${metaInfo.join('\n')}\n\n--- CONTENT ---\n`;
    }
    
    finalContent += contentParts.join('\n\n');
    
    return finalContent;
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
      const { title, content, description, structuredContent, markdownContent } = this.extractContent($);
      
      // Calculate word count
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      // Extract links if needed
      const links = this.extractLinks($, url);
      
      console.log(`[WebsiteCrawler] Successfully crawled ${url} - ${wordCount} words, ${links.length} links`);
      
      // Determine content type based on options
      let contentType: 'text' | 'structured' | 'markdown';
      if (this.options.extractFullContent && this.options.preserveFormatting) {
        contentType = 'markdown';
      } else if (this.options.extractFullContent) {
        contentType = 'structured';
      } else {
        contentType = 'text';
      }
      
      const document: CrawledDocument = {
        url,
        title,
        content,
        description,
        wordCount,
        links,
        structuredContent,
        markdownContent,
        extractedAt: new Date(),
        contentType
      };
      
      this.crawledDocuments.push(document);
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
