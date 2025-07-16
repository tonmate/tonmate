import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

// POST /api/knowledge-sources - Create knowledge source from website
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, url, name, description, maxDepth = 2 } = body;

    // Validate required fields
    if (!agentId || !url || !name) {
      return NextResponse.json(
        { error: 'Agent ID, URL, and name are required' },
        { status: 400 }
      );
    }

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: session.user.id
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create knowledge source
    const knowledgeSource = await prisma.knowledgeSource.create({
      data: {
        agentId,
        name: name.trim(),
        type: 'website',
        url: url.trim(),
        status: 'processing'
      }
    });

    // Knowledge source created, processing will be triggered separately via /process endpoint
    return NextResponse.json({
      ...knowledgeSource,
      message: 'Knowledge source created. Use the /process endpoint to start crawling and embedding.'
    });
  } catch (error) {
    console.error('Error creating knowledge source:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge source' },
      { status: 500 }
    );
  }
}

// GET /api/knowledge-sources?agentId=... - List knowledge sources for agent
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: session.user.id
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const knowledgeSources = await prisma.knowledgeSource.findMany({
      where: { agentId },
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(knowledgeSources);
  } catch (error) {
    console.error('Error fetching knowledge sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge sources' },
      { status: 500 }
    );
  }
}
