import { NextRequest, NextResponse } from 'next/server';
import { CustomerSupportAgent } from '../../../../lib/agents/CustomerSupportAgent.js';

// Initialize the agent
let agent: CustomerSupportAgent | null = null;

async function getAgent() {
  if (!agent) {
    agent = new CustomerSupportAgent();
    await agent.initialize();
  }
  return agent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId } = body;

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

    // Get agent and process message
    const supportAgent = await getAgent();
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