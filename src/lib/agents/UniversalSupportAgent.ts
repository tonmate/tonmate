import OpenAI from 'openai';

export interface AgentConfig {
  name: string;
  description: string;
  prompt: string;
  greeting: string;
  temperature: number;
  llmProvider: string;
  apiKey?: string;  // User-specific API key
  model?: string;   // User-specific model
  maxTokens?: number;
}

export interface KnowledgeDocument {
  title: string;
  content: string;
  url: string;
  sourceType?: string;
  htmlContent?: string;
  metadata?: {
    contentType?: string;
    structuredContent?: any;
    hasMarkdown?: boolean;
    hasStructuredContent?: boolean;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  sources?: string[];
  error?: string;
}

export class UniversalSupportAgent {
  private config: AgentConfig;
  private knowledgeBase: KnowledgeDocument[] = [];
  private openai: OpenAI | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async initialize(
    knowledgeBase: KnowledgeDocument[] = [],
    chatHistory: ChatMessage[] = [],
    sessionId: string | null = null
  ): Promise<void> {
    console.log(`🚀 DEBUG: Initializing agent with ${knowledgeBase.length} knowledge documents`);
    if (knowledgeBase.length > 0) {
      console.log(`📚 DEBUG: Sample knowledge titles:`, knowledgeBase.slice(0, 3).map(doc => doc.title));
    }
    this.knowledgeBase = knowledgeBase;
    
    // Initialize OpenAI client with user-specific API key or fallback to env
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async processMessage(
    message: string,
    chatHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      if (!this.openai) {
        return {
          response: "I'm sorry, but I'm not properly configured. Please ensure the OpenAI API key is set.",
          confidence: 0,
          error: "OpenAI not configured"
        };
      }

      // Build context from knowledge base
      const knowledgeContext = this.buildKnowledgeContext(message);
      
      // Build conversation history
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(knowledgeContext)
        }
      ];

      // Add chat history
      chatHistory.slice(-10).forEach(msg => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      const completion = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens || 1000,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      // Extract sources if knowledge was used
      const sources = this.extractRelevantSources(message);

      return {
        response,
        confidence: 0.8,
        sources: sources.length > 0 ? sources : undefined
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "I'm sorry, I encountered an error processing your message. Please try again.",
        confidence: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private buildSystemPrompt(knowledgeContext: string): string {
    let prompt = this.config.prompt;
    
    if (knowledgeContext) {
      prompt += `\n\nRelevant Information from Knowledge Base:\n${knowledgeContext}`;
      prompt += '\n\nPlease use the above information to provide accurate and helpful responses. If the information is not in the knowledge base, clearly state that you don\'t have that specific information available.';
    }
    
    return prompt;
  }

  private buildKnowledgeContext(message: string): string {
    console.log(`🔍 DEBUG: Knowledge base size: ${this.knowledgeBase.length}`);
    console.log(`🔍 DEBUG: User message: "${message}"`);
    
    if (this.knowledgeBase.length === 0) {
      console.log('⚠️  WARNING: Knowledge base is empty!');
      return '';
    }

    // Multi-layered content extraction for universal website support
    const messageWords = message.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const scoredDocs = this.knowledgeBase.map(doc => {
      const contentWords = (doc.htmlContent || doc.content).toLowerCase();
      const titleWords = doc.title.toLowerCase();
      const url = doc.url.toLowerCase();
      
      let score = 0;
      
      // Layer 1: Exact phrase matching (highest priority)
      const messagePhrase = message.toLowerCase();
      if (contentWords.includes(messagePhrase) || titleWords.includes(messagePhrase)) {
        score += 100;
      }
      
      // Layer 2: Title relevance (high priority)
      messageWords.forEach(word => {
        if (titleWords.includes(word)) {
          score += 20;
        }
      });
      
      // Layer 3: URL path relevance (medium-high priority)
      messageWords.forEach(word => {
        if (url.includes(word)) {
          score += 15;
        }
      });
      
      // Layer 4: Content density scoring (comprehensive extraction)
      messageWords.forEach(word => {
        // Count occurrences of each word
        const wordCount = (contentWords.match(new RegExp(word, 'g')) || []).length;
        score += wordCount * 5;
      });
      
      // Layer 5: Semantic context boosting
      const contextualTerms = this.getContextualTerms(messageWords);
      contextualTerms.forEach(term => {
        if (contentWords.includes(term) || titleWords.includes(term)) {
          score += 10;
        }
      });
      
      // Layer 6: Structural content indicators
      const structuralIndicators = ['table', 'list', 'pricing', 'features', 'compare', 'options', 'details', 'info', 'about', 'service', 'product', 'offer'];
      if (doc.metadata?.hasStructuredContent) {
        structuralIndicators.forEach(indicator => {
          if (contentWords.includes(indicator)) {
            score += 8;
          }
        });
      }
      
      return { doc, score };
    });
    
    // Sort by relevance score and take top documents
    const sortedDocs = scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Increased from 3 to 5 for more comprehensive context
    
    console.log(`📊 DEBUG: Document scores:`, sortedDocs.slice(0, 5).map(item => ({
      title: item.doc.title,
      score: item.score,
      url: item.doc.url
    })));
    
    // If no documents have any relevance, include all documents (fallback)
    if (sortedDocs.every(item => item.score === 0)) {
      console.log('🚨 DEBUG: No relevant documents found, using fallback');
      return this.knowledgeBase
        .slice(0, 4)
        .map(doc => this.formatDocumentForContext(doc, 600)) // Increased context size
        .join('\n\n');
    }
    
    return sortedDocs
      .map(item => this.formatDocumentForContext(item.doc, 600))
      .join('\n\n');
  }
  
  private getContextualTerms(messageWords: string[]): string[] {
    const contextMap: { [key: string]: string[] } = {
      // Pricing and commercial terms
      'price': ['cost', 'fee', 'rate', 'charge', 'payment', 'billing', 'subscription', 'plan', 'pricing', 'free', 'paid', 'premium', 'basic', 'enterprise', 'starter', 'pro', 'business', 'individual', 'team', 'organization', 'monthly', 'yearly', 'annual', 'license', 'purchase', 'buy', 'order', 'checkout', 'cart', 'discount', 'offer', 'deal', 'sale', 'promotion'],
      'pricing': ['cost', 'fee', 'rate', 'charge', 'payment', 'billing', 'subscription', 'plan', 'price', 'free', 'paid', 'premium', 'basic', 'enterprise', 'starter', 'pro', 'business', 'individual', 'team', 'organization', 'monthly', 'yearly', 'annual'],
      'plan': ['subscription', 'package', 'tier', 'level', 'option', 'choice', 'service', 'offering', 'solution', 'product', 'feature', 'benefit', 'include', 'limit', 'usage', 'access', 'support'],
      'cost': ['price', 'fee', 'rate', 'charge', 'payment', 'billing', 'subscription', 'plan', 'pricing', 'expense', 'budget', 'investment', 'value', 'worth'],
      
      // Support and service terms
      'support': ['help', 'assistance', 'service', 'customer', 'contact', 'email', 'phone', 'chat', 'ticket', 'response', 'resolution', 'solution', 'guide', 'documentation', 'faq', 'knowledge', 'tutorial'],
      'help': ['support', 'assistance', 'service', 'guide', 'tutorial', 'documentation', 'faq', 'how', 'what', 'why', 'when', 'where', 'instruction', 'step', 'process'],
      
      // Feature and product terms
      'feature': ['functionality', 'capability', 'tool', 'option', 'benefit', 'advantage', 'include', 'offer', 'provide', 'enable', 'allow', 'support', 'integrate', 'compatible'],
      'product': ['service', 'solution', 'tool', 'software', 'platform', 'application', 'system', 'technology', 'offering', 'item', 'package'],
      
      // Technical terms
      'api': ['integration', 'developer', 'technical', 'code', 'programming', 'development', 'sdk', 'library', 'endpoint', 'webhook', 'authentication', 'authorization'],
      'integration': ['api', 'connect', 'sync', 'import', 'export', 'compatibility', 'plugin', 'extension', 'addon', 'third-party', 'external'],
      
      // Business terms
      'business': ['enterprise', 'company', 'organization', 'corporate', 'professional', 'commercial', 'industry', 'solution', 'service', 'client', 'customer'],
      'enterprise': ['business', 'corporate', 'organization', 'company', 'professional', 'commercial', 'large', 'scale', 'advanced', 'premium', 'custom']
    };
    
    const contextualTerms = new Set<string>();
    
    messageWords.forEach(word => {
      if (contextMap[word]) {
        contextMap[word].forEach(term => contextualTerms.add(term));
      }
    });
    
    return Array.from(contextualTerms);
  }
  
  private formatDocumentForContext(doc: KnowledgeDocument, maxLength: number): string {
    const title = doc.title;
    const url = doc.url ? ` (${doc.url})` : '';
    
    // Use structured content if available, otherwise fall back to regular content
    let content = doc.htmlContent || doc.content;
    
    // If we have structured content metadata, try to format it better
    if (doc.metadata?.hasStructuredContent && doc.metadata.structuredContent) {
      const structured = doc.metadata.structuredContent;
      let formattedContent = '';
      
      // Add headings
      if (structured.headings && structured.headings.length > 0) {
        formattedContent += structured.headings
          .slice(0, 3)
          .map((h: any) => `${h.level} ${h.content}`)
          .join('\n') + '\n\n';
      }
      
      // Add paragraphs
      if (structured.paragraphs && structured.paragraphs.length > 0) {
        formattedContent += structured.paragraphs
          .slice(0, 3)
          .map((p: any) => p.content)
          .join('\n\n') + '\n\n';
      }
      
      // Add lists
      if (structured.lists && structured.lists.length > 0) {
        structured.lists.slice(0, 2).forEach((list: any) => {
          if (list.items && list.items.length > 0) {
            formattedContent += list.items
              .slice(0, 5)
              .map((item: any) => `• ${item.content}`)
              .join('\n') + '\n\n';
          }
        });
      }
      
      // Add tables
      if (structured.tables && structured.tables.length > 0) {
        structured.tables.slice(0, 1).forEach((table: any) => {
          if (table.rows && table.rows.length > 0) {
            formattedContent += table.rows
              .slice(0, 3)
              .filter((row: any) => row && row.cells && Array.isArray(row.cells))
              .map((row: any) => 
                row.cells
                  .filter((cell: any) => cell && cell.content)
                  .map((cell: any) => cell.content)
                  .join(' | ')
              )
              .filter((rowContent: string) => rowContent.trim().length > 0)
              .join('\n') + '\n\n';
          }
        });
      }
      
      if (formattedContent.trim()) {
        content = formattedContent.trim();
      }
    }
    
    // Truncate if too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return `**${title}**${url}\n${content}`;
  }

  private extractRelevantSources(message: string): string[] {
    const messageWords = message.toLowerCase().split(/\s+/);
    const relevantSources: string[] = [];

    this.knowledgeBase.forEach(doc => {
      const contentWords = doc.content.toLowerCase();
      const hasRelevantContent = messageWords.some(word => 
        word.length > 3 && contentWords.includes(word)
      );
      
      if (hasRelevantContent) {
        relevantSources.push(doc.url);
      }
    });

    return [...new Set(relevantSources)].slice(0, 3);
  }

  getGreeting(): string {
    return this.config.greeting;
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}
