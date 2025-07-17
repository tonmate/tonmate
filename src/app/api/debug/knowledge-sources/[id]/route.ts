import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

// Debug endpoint to check knowledge source processing details
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

    // Get detailed knowledge source info
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        },
        documents: {
          select: {
            id: true,
            content: true,
            embedding: true,
            createdAt: true
          }
        }
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    // Get user's OpenAI key status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        openaiApiKey: true,
        createdAt: true
      }
    });

    const debugInfo = {
      knowledgeSource: {
        id: knowledgeSource.id,
        name: knowledgeSource.name,
        url: knowledgeSource.url,
        status: knowledgeSource.status,
        createdAt: knowledgeSource.createdAt,
        updatedAt: knowledgeSource.updatedAt,
        agent: knowledgeSource.agent
      },
      documents: {
        count: knowledgeSource.documents.length,
        items: knowledgeSource.documents.map(doc => ({
          id: doc.id,
          contentLength: doc.content?.length || 0,
          hasEmbedding: !!doc.embedding,
          createdAt: doc.createdAt
        }))
      },
      user: {
        hasOpenAIKey: !!user?.openaiApiKey,
        userCreated: user?.createdAt
      },
      processingAnalysis: {
        timeElapsed: Date.now() - new Date(knowledgeSource.updatedAt).getTime(),
        timeElapsedMinutes: Math.round((Date.now() - new Date(knowledgeSource.updatedAt).getTime()) / 60000),
        isStuck: knowledgeSource.status === 'processing' && (Date.now() - new Date(knowledgeSource.updatedAt).getTime()) > 10 * 60 * 1000, // 10 minutes
        possibleIssues: [] as string[]
      }
    };

    // Add possible issues analysis
    if (!user?.openaiApiKey) {
      debugInfo.processingAnalysis.possibleIssues.push('No OpenAI API key configured');
    }
    
    if (knowledgeSource.status === 'processing' && debugInfo.processingAnalysis.timeElapsedMinutes > 5) {
      debugInfo.processingAnalysis.possibleIssues.push(`Processing has been running for ${debugInfo.processingAnalysis.timeElapsedMinutes} minutes - may be stuck`);
    }

    if (knowledgeSource.documents.length === 0 && knowledgeSource.status === 'processing') {
      debugInfo.processingAnalysis.possibleIssues.push('No documents created yet - crawling may have failed');
    }

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug check failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
