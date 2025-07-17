import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { agentId, sessionId, initialMessage } = await request.json();

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        agentId,
        sessionId,
        messages: [
          {
            id: '1',
            type: 'bot',
            content: `Hello! I'm your AI assistant. How can I help you today?`,
            timestamp: new Date()
          },
          {
            id: '2',
            type: 'user',
            content: initialMessage,
            timestamp: new Date()
          }
        ]
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const whereClause = agentId ? 
      { 
        agent: { userId: session.user.id },
        agentId 
      } : 
      { 
        agent: { userId: session.user.id } 
      };

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
