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
    let systemPrompt = this.config.prompt;
    
    if (knowledgeContext) {
      systemPrompt += `\n\nKnowledge Base:\n${knowledgeContext}`;
      systemPrompt += '\n\nUse the knowledge base to answer questions when relevant. If you reference information from the knowledge base, be helpful and accurate.';
    }
    
    return systemPrompt;
  }

  private buildKnowledgeContext(message: string): string {
    if (this.knowledgeBase.length === 0) {
      return '';
    }

    // Simple keyword matching for relevant documents
    const relevantDocs = this.knowledgeBase.filter(doc => {
      const messageWords = message.toLowerCase().split(/\s+/);
      const contentWords = doc.content.toLowerCase();
      return messageWords.some(word => 
        word.length > 3 && contentWords.includes(word)
      );
    });

    if (relevantDocs.length === 0) {
      // If no specific matches, use first few documents
      return this.knowledgeBase
        .slice(0, 3)
        .map(doc => `${doc.title}: ${doc.content.substring(0, 500)}...`)
        .join('\n\n');
    }

    return relevantDocs
      .slice(0, 3)
      .map(doc => `${doc.title}: ${doc.content.substring(0, 500)}...`)
      .join('\n\n');
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
