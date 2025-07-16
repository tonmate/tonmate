import { NextRequest, NextResponse } from 'next/server';
import { CustomerSupportAgent } from '../../../../../lib/agents/CustomerSupportAgent.js';

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
    
    // Handle Instagram webhook verification
    if (body.hub && body.hub.mode === 'subscribe') {
      const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'your_verify_token';
      if (body.hub.verify_token === verifyToken) {
        return new NextResponse(body.hub.challenge);
      } else {
        return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
      }
    }

    // Handle Instagram messages
    if (body.entry && Array.isArray(body.entry)) {
      const supportAgent = await getAgent();
      
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message && messagingEvent.message.text) {
              const result = await supportAgent.processMessage(
                messagingEvent.message.text,
                []
              );
              
              // Here you would typically send the response back to Instagram
              // For now, we'll just log it
              console.log('Instagram response:', result);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle Instagram webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge);
  } else {
    return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
  }
}