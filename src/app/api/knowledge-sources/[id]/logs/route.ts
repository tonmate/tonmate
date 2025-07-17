import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

// GET /api/knowledge-sources/[id]/logs - Get detailed processing logs
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

    // Verify knowledge source ownership through agent
    const knowledgeSource = await prisma.knowledgeSource.findFirst({
      where: {
        id: id,
        agent: {
          userId: session.user.id
        }
      },
      include: {
        agent: true,
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!knowledgeSource) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    // Get processing logs from database
    const processingLogs = await prisma.processingLog.findMany({
      where: {
        knowledgeSourceId: id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format logs for frontend
    const formattedLogs = processingLogs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      level: log.level,
      message: log.message,
      details: log.details,
      url: log.url,
      step: log.step,
      progress: log.progress
    }));

    // Get summary statistics
    const totalDocuments = knowledgeSource.documents.length;
    const totalPages = processingLogs.filter(log => log.step === 'page_crawled').length;
    const totalLinks = processingLogs.filter(log => log.step === 'link_found').length;
    const failedPages = processingLogs.filter(log => log.level === 'error' && log.step === 'page_crawl_failed').length;

    return NextResponse.json({
      knowledgeSource: {
        id: knowledgeSource.id,
        name: knowledgeSource.name,
        url: knowledgeSource.url,
        status: knowledgeSource.status,
        createdAt: knowledgeSource.createdAt,
        updatedAt: knowledgeSource.updatedAt
      },
      statistics: {
        totalDocuments,
        totalPages,
        totalLinks,
        failedPages,
        successRate: totalPages > 0 ? ((totalPages - failedPages) / totalPages * 100).toFixed(1) : 0
      },
      logs: formattedLogs,
      documents: knowledgeSource.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        contentPreview: doc.content?.substring(0, 200) + '...',
        wordCount: doc.content?.split(' ').length || 0,
        createdAt: doc.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching processing logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processing logs' },
      { status: 500 }
    );
  }
}
