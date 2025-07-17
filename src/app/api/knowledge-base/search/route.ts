import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';
import { CrawlService } from '@/lib/web-crawler/crawl-service';
import { z } from 'zod';

const prisma = new PrismaClient();
const crawlService = new CrawlService(prisma);

const searchSchema = z.object({
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
    const validatedData = searchSchema.parse(body);

    // Verify user owns the knowledge base
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: validatedData.knowledgeBaseId },
      select: { userId: true }
    });

    if (!knowledgeBase || knowledgeBase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await crawlService.searchKnowledgeBase(
      validatedData.knowledgeBaseId,
      validatedData.query,
      validatedData.limit || 10
    );

    return NextResponse.json({ 
      success: true, 
      data: results,
      query: validatedData.query 
    });

  } catch (error) {
    console.error('Error searching knowledge base:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to search knowledge base' 
    }, { status: 500 });
  }
}
