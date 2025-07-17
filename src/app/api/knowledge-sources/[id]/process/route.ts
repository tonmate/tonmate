import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';
import { KnowledgeProcessor } from '../../../../../lib/knowledge/KnowledgeProcessor';

// POST /api/knowledge-sources/[id]/process - Start processing a knowledge source
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify knowledge source ownership through agent
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      },
      include: {
        agent: true
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    if (!knowledgeSource.url) {
      return NextResponse.json({ error: 'No URL specified for processing' }, { status: 400 });
    }

    if (knowledgeSource.status === 'processing') {
      return NextResponse.json({ error: 'Knowledge source is already being processed' }, { status: 409 });
    }

    // Get processing options from request body
    const body = await request.json().catch(() => ({}));
    const {
      maxPages = 10,
      maxDepth = 2,
      generateEmbeddings = true
    } = body;

    // Start processing in background (don't await)
    const processor = new KnowledgeProcessor(session.user.id);
    
    // Process asynchronously with detailed error handling
    processor.processWebsite(id, knowledgeSource.url, {
      maxPages,
      maxDepth,
      generateEmbeddings
    }).catch(async (error) => {
      console.error('❌ Background processing failed:', error);
      console.error('Error stack:', error.stack);
      
      // Update knowledge source status to failed
      try {
        await prisma.knowledgeSource.update({
          where: { id: id },
          data: { status: 'failed' }
        });
        
        // Log the error to processing logs
        await prisma.processingLog.create({
          data: {
            knowledgeSourceId: id,
            level: 'error',
            message: 'Background processing failed: ' + error.message,
            details: JSON.stringify({
              error: error.message,
              stack: error.stack,
              url: knowledgeSource.url,
              options: { maxPages, maxDepth, generateEmbeddings }
            })
          }
        });
      } catch (dbError) {
        console.error('❌ Failed to update database after processing error:', dbError);
      }
    });

    return NextResponse.json({
      message: 'Processing started',
      knowledgeSourceId: id,
      status: 'processing',
      options: {
        maxPages,
        maxDepth,
        generateEmbeddings
      }
    });

  } catch (error) {
    console.error('Error starting knowledge processing:', error);
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    );
  }
}

// GET /api/knowledge-sources/[id]/process - Get processing status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get knowledge source with documents
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            url: true,
            wordCount: true,
            createdAt: true
          }
        }
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    // Parse metadata for processing stats
    let processingStats = null;
    if (knowledgeSource.metadata) {
      try {
        const metadata = JSON.parse(knowledgeSource.metadata as string);
        processingStats = metadata.processing || metadata;
      } catch (error) {
        console.error('Failed to parse metadata:', error);
      }
    }

    return NextResponse.json({
      id: knowledgeSource.id,
      name: knowledgeSource.name,
      url: knowledgeSource.url,
      status: knowledgeSource.status,
      documentCount: knowledgeSource.documents.length,
      documents: knowledgeSource.documents,
      processingStats,
      createdAt: knowledgeSource.createdAt,
      updatedAt: knowledgeSource.updatedAt
    });

  } catch (error) {
    console.error('Error getting processing status:', error);
    return NextResponse.json(
      { error: 'Failed to get processing status' },
      { status: 500 }
    );
  }
}
