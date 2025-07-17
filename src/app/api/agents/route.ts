import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

// GET /api/agents - List user's agents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await prisma.agent.findMany({
      where: { userId: session.user.id },
      include: {
        knowledgeSources: {
          include: {
            documents: true
          }
        },
        _count: {
          select: {
            conversations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      prompt,
      greeting,
      temperature = 0.7,
      llmProvider = 'openai',
      model = 'gpt-4',
      maxTokens = 2000,
      settings = {}
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || '',
        prompt: prompt?.trim() || 'You are a helpful customer support agent.',
        greeting: greeting?.trim() || 'Hello! How can I help you today?',
        temperature: Math.max(0, Math.min(1, temperature)), // Ensure between 0-1
        llmProvider,
        model: model || 'gpt-4',
        maxTokens: Math.max(100, Math.min(8000, maxTokens || 2000)), // Ensure reasonable token limits
        settings: settings ? JSON.stringify(settings) : null
      },
      include: {
        knowledgeSources: true
      }
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
