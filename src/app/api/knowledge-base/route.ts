import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { CrawlService } from '@/lib/web-crawler/crawl-service';
import { z } from 'zod';

const prisma = new PrismaClient();
const crawlService = new CrawlService(prisma);

const createKnowledgeBaseSchema = z.object({
  crawlRequestId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

const searchKnowledgeBaseSchema = z.object({
  knowledgeBaseId: z.string(),
  query: z.string().min(1),
  limit: z.number().min(1).max(50).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createKnowledgeBaseSchema.parse(body);

    // Verify user owns the crawl request
    const crawlRequest = await prisma.crawlRequest.findUnique({
      where: { id: validatedData.crawlRequestId },
      select: { userId: true, status: true }
    });

    if (!crawlRequest || crawlRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (crawlRequest.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Cannot create knowledge base from incomplete crawl' 
      }, { status: 400 });
    }

    const knowledgeBaseId = await crawlService.createKnowledgeBase(
      validatedData.crawlRequestId,
      validatedData.name,
      validatedData.description
    );

    return NextResponse.json({ 
      success: true, 
      knowledgeBaseId,
      message: 'Knowledge base created successfully' 
    });

  } catch (error) {
    console.error('Error creating knowledge base:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create knowledge base' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('id');

    if (knowledgeBaseId) {
      // Get specific knowledge base
      const knowledgeBase = await crawlService.getKnowledgeBase(knowledgeBaseId);
      
      if (knowledgeBase.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true, 
        data: knowledgeBase 
      });
    } else {
      // List all knowledge bases for user
      const knowledgeBases = await crawlService.listKnowledgeBases(session.user.id);
      
      return NextResponse.json({ 
        success: true, 
        data: knowledgeBases 
      });
    }

  } catch (error) {
    console.error('Error getting knowledge base:', error);
    return NextResponse.json({ 
      error: 'Failed to get knowledge base' 
    }, { status: 500 });
  }
}
