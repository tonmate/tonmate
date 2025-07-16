import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ProductSearchTool } from '../tools/ProductSearchTool.js';
import { OrderLookupTool } from '../tools/OrderLookupTool.js';
import { ShopInfoTool } from '../tools/ShopInfoTool.js';

/**
 * Customer Support Agent for Instagram shop
 */
export class CustomerSupportAgent {
  constructor() {
    this.userProducts = [];
    this.userOrders = [];
    this.agent = null;
    this.agentExecutor = null;
    this.model = null;
    this.demoMode = false;
  }

  getSystemPrompt() {
    return `You are a friendly and helpful customer support agent for ${process.env.SHOP_NAME || 'Demo Fashion Store'}, an Instagram shop that sells fashion items and accessories.

Your role is to:
1. Help customers find products they're looking for
2. Provide information about orders and shipping
3. Answer questions about shop policies and procedures
4. Assist with returns, exchanges, and refunds
5. Provide excellent customer service with a warm, professional tone

Guidelines:
- Always be polite, helpful, and empathetic
- Use the available tools to search for products, look up orders, and get shop information
- If you can't find specific information, offer to connect the customer with a human agent
- Keep responses concise but informative
- Use emojis sparingly and appropriately for Instagram communication
- Always try to resolve the customer's issue or provide clear next steps
- If a customer seems frustrated, acknowledge their feelings and work to help them

Shop Information:
- Name: ${process.env.SHOP_NAME || 'Demo Fashion Store'}
- Description: ${process.env.SHOP_DESCRIPTION || 'Trendy fashion items for all ages'}
- Contact: ${process.env.SHOP_CONTACT_EMAIL || 'support@demofashion.com'}
- Policies: ${process.env.SHOP_POLICIES || '30-day return policy, free shipping over $50'}

Remember: You're representing the brand on Instagram, so maintain a professional yet friendly social media tone.`;
  }

  async initialize(userProducts = [], userOrders = []) {
    try {
      // Store user data
      this.userProducts = userProducts;
      this.userOrders = userOrders;

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.warn('⚠️  OpenAI API key not configured. Running in demo mode.');
        this.demoMode = true;
        this.model = null;
      } else {
        this.demoMode = false;
        this.model = new ChatOpenAI({
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
          openAIApiKey: process.env.OPENAI_API_KEY
        });
      }

      // Initialize tools with user data
      this.tools = [
        new ProductSearchTool(this.userProducts),
        new OrderLookupTool(this.userOrders),
        new ShopInfoTool()
      ];

      this.prompt = ChatPromptTemplate.fromMessages([
        ['system', this.getSystemPrompt()],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad')
      ]);

      if (this.demoMode) {
        console.log('🎭 Customer Support Agent initialized in demo mode');
        return;
      }

      this.agent = await createOpenAIFunctionsAgent({
        llm: this.model,
        tools: this.tools,
        prompt: this.prompt
      });

      this.agentExecutor = new AgentExecutor({
        agent: this.agent,
        tools: this.tools,
        verbose: process.env.NODE_ENV === 'development',
        maxIterations: 3
      });

      console.log('✅ Customer Support Agent initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Customer Support Agent:', error);
      throw error;
    }
  }

  async processMessage(message, chatHistory = []) {
    try {
      if (this.demoMode) {
        return await this.processDemoMessage(message);
      }

      if (!this.agentExecutor) {
        await this.initialize();
      }

      const response = await this.agentExecutor.invoke({
        input: message,
        chat_history: chatHistory
      });

      return {
        success: true,
        response: response.output,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      return {
        success: false,
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team directly.",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async processDemoMessage(message) {
    // Demo mode responses based on message content
    const lowerMessage = message.toLowerCase();
    
    // Product search responses
    if (lowerMessage.includes('white') && lowerMessage.includes('t-shirt')) {
      return {
        success: true,
        response: "Great! I found our Classic White T-Shirt for $25.99. It's available in sizes XS-XL and comes in White, Black, and Gray. It's currently in stock and perfect for everyday wear. Would you like more details or help with sizing?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    if (lowerMessage.includes('denim') || lowerMessage.includes('jeans')) {
      return {
        success: true,
        response: "We have high-quality Denim Jeans for $79.99! They're available in sizes 28-36 and come in Blue and Black. They feature a modern fit and are currently in stock. Would you like to know more about the sizing or see similar items?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    if (lowerMessage.includes('dress')) {
      return {
        success: true,
        response: "I found our Summer Dress for $45.99. Unfortunately, it's currently out of stock, but we're expecting new inventory soon! It comes in Floral, Solid Blue, and Yellow patterns in sizes XS-L. Would you like me to notify you when it's back in stock?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    // Order lookup responses
    if (lowerMessage.includes('order') && (lowerMessage.includes('ord-001') || lowerMessage.includes('001'))) {
      return {
        success: true,
        response: "I found order ORD-001 for John Doe. Status: Shipped ✅\n\nOrder Details:\n• Classic White T-Shirt (Qty: 2) - $25.99 each\n• Sneakers (Qty: 1) - $89.99\n• Total: $141.97\n• Tracking: TRK123456789\n\nYour order was shipped and should arrive within 2-3 business days. You can track it using the tracking number above.",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    if (lowerMessage.includes('order') && (lowerMessage.includes('ord-002') || lowerMessage.includes('002'))) {
      return {
        success: true,
        response: "I found order ORD-002 for Jane Smith. Status: Confirmed ✅\n\nOrder Details:\n• Denim Jeans (Qty: 1) - $79.99\n• Leather Handbag (Qty: 1) - $129.99\n• Total: $209.98\n\nYour order has been confirmed and is being prepared for shipping. You'll receive a tracking number within 24 hours.",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    // Policy responses
    if (lowerMessage.includes('return') && lowerMessage.includes('policy')) {
      return {
        success: true,
        response: "Our return policy is customer-friendly! 📋\n\n• 30-day return window from purchase date\n• Items must be unworn with original tags\n• Free returns on orders over $50\n• Refunds processed within 5-7 business days\n• Contact us to initiate a return\n\nNeed help with a specific return? I'm here to assist!",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    if (lowerMessage.includes('shipping')) {
      return {
        success: true,
        response: "Here are our shipping options! 📦\n\n• Standard Shipping: 5-7 business days ($5.99)\n• Express Shipping: 2-3 business days ($12.99)\n• FREE Standard Shipping on orders over $50! 🎉\n• International shipping available to select countries\n\nWhich shipping option works best for you?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      return {
        success: true,
        response: "You can reach our support team in several ways! 📞\n\n• Email: support@demofashion.com\n• Phone: +1234567890\n• Business Hours: Monday-Friday 9AM-6PM EST\n• Instagram DM: Right here! I'm available 24/7\n\nHow else can I help you today?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    // General greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('help')) {
      return {
        success: true,
        response: "Hello! 👋 Welcome to Demo Fashion Store! I'm your AI customer support assistant and I'm here to help you with:\n\n• Finding the perfect products 🛍️\n• Checking your order status 📦\n• Store policies and information 📋\n• Returns and exchanges 🔄\n\nWhat can I help you with today?",
        timestamp: new Date().toISOString(),
        demoMode: true
      };
    }
    
    // Default response
    return {
      success: true,
      response: "Thanks for your message! I'm currently running in demo mode. I can help you with:\n\n• Product searches (try: 'white t-shirt', 'denim jeans')\n• Order status (try: 'check order ORD-001')\n• Store policies (try: 'return policy', 'shipping info')\n• Contact information (try: 'contact support')\n\nTo enable full AI capabilities, please configure your OpenAI API key in the .env file. What would you like to know about our store?",
      timestamp: new Date().toISOString(),
      demoMode: true
    };
  }

  async handleInstagramMessage(messageData) {
    try {
      const { message, senderId, senderName } = messageData;
      
      // Process the message
      const result = await this.processMessage(message);
      
      // Format response for Instagram
      const instagramResponse = {
        recipientId: senderId,
        message: result.response,
        timestamp: result.timestamp,
        success: result.success
      };

      // Log the interaction
      console.log(`Instagram message from ${senderName} (${senderId}): ${message}`);
      console.log(`Response: ${result.response}`);

      return instagramResponse;

    } catch (error) {
      console.error('Error handling Instagram message:', error);
      
      return {
        recipientId: messageData.senderId,
        message: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
    }
  }
}