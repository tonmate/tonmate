import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { decrypt } from '../../../lib/encryption';
import { CustomerSupportAgent } from '../../../../lib/agents/CustomerSupportAgent.js';

// Cache for agents per user
const userAgents = new Map<string, CustomerSupportAgent>();

async function getUserAgent(userId: string, useUserConfig: boolean = false) {
  let agent = userAgents.get(userId);
  
  if (!agent) {
    agent = new CustomerSupportAgent();
    
    if (useUserConfig) {
      // Get user configuration
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          products: true,
          orders: true
        }
      });

      if (user) {
        // Use user's OpenAI API key if available
        if (user.openaiApiKey) {
          try {
            const decryptedKey = decrypt(user.openaiApiKey);
            process.env.OPENAI_API_KEY = decryptedKey;
          } catch (error) {
            console.error('Error decrypting user API key:', error);
          }
        }

        // Set user's shop information
        if (user.shopName) process.env.SHOP_NAME = user.shopName;
        if (user.shopDescription) process.env.SHOP_DESCRIPTION = user.shopDescription;
        if (user.shopUrl) process.env.SHOP_URL = user.shopUrl;

        // Initialize agent with user's data
        await agent.initialize(user.products, user.orders);
      } else {
        await agent.initialize();
      }
    } else {
      await agent.initialize();
    }
    
    userAgents.set(userId, agent);
  }
  
  return agent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, useUserConfig = false } = body;

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

    // If using user config, verify authentication
    if (useUserConfig) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get agent and process message
    const supportAgent = await getUserAgent(userId, useUserConfig);
    const result = await supportAgent.processMessage(message, []);

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