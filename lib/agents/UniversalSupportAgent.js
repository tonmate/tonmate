import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { KnowledgeSearchTool } from '../tools/KnowledgeSearchTool.js';
import { EscalationTool } from '../tools/EscalationTool.js';
import { CustomActionTool } from '../tools/CustomActionTool.js';

/**
 * Universal Customer Support Agent
 * Configurable AI agent that can be customized for any business or use case
 */
export class UniversalSupportAgent {
  constructor(config = {}) {
    this.config = {
      name: 'Support Agent',
      description: 'AI Customer Support Agent',
      prompt: 'You are a helpful customer support agent.',
      greeting: 'Hello! How can I help you today?',
      temperature: 0.7,
      llmProvider: 'openai',
      ...config
    };
    
    this.knowledgeBase = [];
    this.customActions = [];
    this.agent = null;
    this.agentExecutor = null;
    this.model = null;
    this.demoMode = false;
  }

  /**
   * Get the system prompt for this agent
   */
  getSystemPrompt() {
    const basePrompt = this.config.prompt || 'You are a helpful customer support agent.';
    
    return `${basePrompt}

Your role and guidelines:
1. Provide excellent customer service with a professional, friendly tone
2. Use the knowledge_search tool to find relevant information when needed
3. Escalate to human agents when appropriate using escalate_to_human
4. Execute custom actions when requested using custom_action
5. Be empathetic and understanding of customer concerns
6. Keep responses clear, concise, and helpful
7. If you cannot find information, offer to connect with a human agent

Knowledge Base: ${this.knowledgeBase.length > 0 ? 'Available' : 'No knowledge base configured yet'}
Custom Actions: ${this.customActions.length > 0 ? this.customActions.map(a => a.name).join(', ') : 'None configured'}

Agent Configuration:
- Name: ${this.config.name}
- Description: ${this.config.description}
- Greeting: ${this.config.greeting}

Remember: Always prioritize customer satisfaction and provide accurate, helpful information.`;
  }

  /**
   * Initialize the agent with knowledge base and custom actions
   */
  async initialize(knowledgeBase = [], customActions = [], sessionId = null) {
    try {
      this.knowledgeBase = knowledgeBase;
      this.customActions = customActions;

      // Check if we should use demo mode
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'demo' || apiKey === '') {
        console.log('No OpenAI API key found. Running in demo mode.');
        this.demoMode = true;
        return;
      }

      // Initialize the LLM
      this.model = new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: this.config.temperature,
        openAIApiKey: apiKey,
      });

      // Create tools
      const tools = [
        new KnowledgeSearchTool(this.knowledgeBase),
        new EscalationTool({ sessionId }),
        new CustomActionTool(this.customActions)
      ];

      // Create the prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', this.getSystemPrompt()],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad')
      ]);

      // Create the agent
      this.agent = await createOpenAIFunctionsAgent({
        llm: this.model,
        tools,
        prompt
      });

      // Create the agent executor
      this.agentExecutor = new AgentExecutor({
        agent: this.agent,
        tools,
        verbose: process.env.NODE_ENV === 'development',
        maxIterations: 5
      });

      console.log(`Universal Support Agent "${this.config.name}" initialized successfully`);
      
    } catch (error) {
      console.error('Error initializing Universal Support Agent:', error);
      this.demoMode = true;
    }
  }

  /**
   * Process a message and return a response
   */
  async processMessage(message, chatHistory = []) {
    try {
      if (!message || message.trim().length === 0) {
        return 'Hello! How can I help you today?';
      }

      // Demo mode response
      if (this.demoMode) {
        return this.getDemoResponse(message);
      }

      // Format chat history for LangChain
      const formattedHistory = chatHistory.map(msg => {
        if (msg.role === 'user' || msg.role === 'human') {
          return ['human', msg.content];
        } else {
          return ['assistant', msg.content];
        }
      });

      // Process with the agent
      const result = await this.agentExecutor.invoke({
        input: message,
        chat_history: formattedHistory
      });

      return result.output || 'I apologize, but I encountered an issue processing your request. Please try again.';

    } catch (error) {
      console.error('Error processing message:', error);
      return 'I apologize, but I encountered an error. Please try again or contact our support team for assistance.';
    }
  }

  /**
   * Demo mode responses for testing without API key
   */
  getDemoResponse(message) {
    const responses = [
      `Thank you for your message: "${message}". This is a demo response from the ${this.config.name}. In production, I would search our knowledge base and provide detailed assistance based on your specific needs.`,
      
      `I understand you're asking about "${message}". This is a demonstration of our AI customer support platform. The actual agent would have access to your business knowledge base and would provide specific, helpful responses.`,
      
      `Hi! I received your question about "${message}". This is demo mode - in a real deployment, I would search through your website content, documentation, and configured knowledge sources to provide accurate assistance.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Update agent configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update knowledge base
   */
  updateKnowledgeBase(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  /**
   * Update custom actions
   */
  updateCustomActions(customActions) {
    this.customActions = customActions;
  }

  /**
   * Get agent status and configuration
   */
  getStatus() {
    return {
      initialized: !!this.agentExecutor,
      demoMode: this.demoMode,
      config: this.config,
      knowledgeBaseSize: this.knowledgeBase.length,
      customActionsCount: this.customActions.length
    };
  }
}
