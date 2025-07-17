import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { decrypt } from '../../../lib/encryption';
import { UniversalSupportAgent } from '../../../lib/agents/UniversalSupportAgent';

// Cache for agents per user
const userAgents = new Map<string, UniversalSupportAgent>();

async function getUserAgent(userId: string, agentId?: string) {
  const agentKey = agentId ? `${userId}_${agentId}` : userId;
  let agent = userAgents.get(agentKey);
  
  if (!agent) {
    // Get user and agent configuration
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agents: {
          include: {
            knowledgeSources: {
              include: {
                documents: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find the specific agent or use the first one, or create a default
    let agentConfig;
    if (agentId) {
      agentConfig = user.agents.find(a => a.id === agentId);
      if (!agentConfig) {
        throw new Error('Agent not found');
      }
    } else {
      agentConfig = user.agents[0]; // Use first agent if no specific agent requested
    }

    // Create default config if no agents exist
    if (!agentConfig) {
      agentConfig = {
        id: 'demo',
        name: 'Demo Support Agent',
        description: 'Demo customer support agent',
        prompt: 'You are a helpful customer support agent.',
        greeting: 'Hello! How can I help you today?',
        temperature: 0.7,
        llmProvider: 'openai',
        knowledgeSources: []
      };
    }

    // Decrypt user's API key if available
    let userApiKey: string | undefined;
    if (user.openaiApiKey) {
      try {
        userApiKey = decrypt(user.openaiApiKey);
      } catch (error) {
        console.error('Error decrypting user API key:', error);
      }
    }

    // Initialize the universal agent with user-specific settings
    agent = new UniversalSupportAgent({
      name: agentConfig.name,
      description: agentConfig.description || 'AI Support Agent',
      prompt: agentConfig.prompt,
      greeting: agentConfig.greeting,
      temperature: user.defaultTemperature || agentConfig.temperature || 0.7,
      llmProvider: agentConfig.llmProvider,
      apiKey: userApiKey,
      model: user.openaiModel || 'gpt-3.5-turbo',
      maxTokens: user.defaultMaxTokens || 1000
    });

    // Prepare knowledge base from documents
    const knowledgeBase = agentConfig.knowledgeSources?.flatMap(source => 
      source.documents?.map(doc => ({
        title: doc.title,
        content: doc.content,
        url: doc.url || '',
        sourceType: source.type || 'website'
      })) || []
    ) || [];

    // Initialize agent with knowledge base (sessionId is different from agentId)
    await agent.initialize(knowledgeBase, [], null);
    
    userAgents.set(agentKey, agent);
  }
  
  return agent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, agentId, conversationId, chatHistory = [] } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agent and process message
    const supportAgent = await getUserAgent(userId, agentId);
    const result = await supportAgent.processMessage(message, chatHistory);

    // Save message to conversation if conversationId is provided
    if (conversationId) {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (conversation) {
          const existingMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
          const newMessages = [
            ...existingMessages,
            {
              id: Date.now().toString(),
              type: 'bot',
              content: result.response,
              timestamp: new Date()
            }
          ];

          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              messages: newMessages,
              updatedAt: new Date()
            }
          });
        }
      } catch (error) {
        console.error('Error saving message to conversation:', error);
        // Don't fail the request if saving fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Instagram Customer Support Agent API',
    version: '2.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      instagram: 'POST /api/chat/instagram'
    }
  });
}