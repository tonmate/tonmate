import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

// PATCH /api/knowledge-sources/[id] - Update knowledge source (mainly for resetting status)
export async function PATCH(
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
    const { status } = body;

    // Verify knowledge source ownership
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    // Update the knowledge source
    const updatedSource = await prisma.knowledgeSource.update({
      where: { id },
      data: {
        status: status || knowledgeSource.status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedSource);

  } catch (error) {
    console.error('Error updating knowledge source:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge source' },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge-sources/[id] - Delete knowledge source
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

    // Verify knowledge source ownership
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    // Delete associated documents first
    await prisma.document.deleteMany({
      where: { sourceId: id }
    });

    // Delete the knowledge source
    await prisma.knowledgeSource.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Knowledge source deleted successfully' });

  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge source' },
      { status: 500 }
    );
  }
}
