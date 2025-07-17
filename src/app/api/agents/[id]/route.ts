import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

// GET /api/agents/[id] - Get specific agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await prisma.agent.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        knowledgeSources: {
          include: {
            documents: true
          }
        },
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 conversations
        },
        _count: {
          select: {
            conversations: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      temperature,
      llmProvider,
      isActive
    } = body;

    // Verify agent ownership
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Update the agent
    const agent = await prisma.agent.update({
      where: { id: id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(prompt && { prompt: prompt.trim() }),
        ...(greeting && { greeting: greeting.trim() }),
        ...(temperature !== undefined && { 
          temperature: Math.max(0, Math.min(1, temperature)) 
        }),
        ...(llmProvider && { llmProvider }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        knowledgeSources: true
      }
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify agent ownership
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Delete the agent (cascade will handle related records)
    await prisma.agent.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
