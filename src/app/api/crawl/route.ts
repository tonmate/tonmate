import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CrawlService } from '@/lib/web-crawler/crawl-service';
import { z } from 'zod';

const crawlService = new CrawlService(prisma);

// Zod schema for validation
const CrawlRequestSchema = z.object({
  url: z.string().url(),
  maxDepth: z.number().int().min(1).max(10).default(3),
  maxPages: z.number().int().min(1).max(1000).default(50),
  allowedDomains: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  respectRobotsTxt: z.boolean().default(true),
  rateLimit: z.number().int().min(100).max(5000).default(1000),
  pageOptions: z.object({
    excludeTags: z.array(z.string()).optional(),
    includeTags: z.array(z.string()).optional(),
    waitTime: z.number().int().min(0).max(10000).optional(),
    includeHtml: z.boolean().optional(),
    onlyMainContent: z.boolean().optional(),
    includeLinks: z.boolean().optional(),
    timeout: z.number().int().min(1000).max(30000).optional(),
    extraHeaders: z.record(z.string(), z.string()).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CrawlRequestSchema.parse(body);

    const crawlRequestId = await crawlService.startCrawl(
      session.user.id,
      validatedData.url,
      {
        maxDepth: validatedData.maxDepth,
        pageLimit: validatedData.maxPages,
        allowedDomains: validatedData.allowedDomains,
        excludePaths: validatedData.excludePatterns,
        respectRobotsTxt: validatedData.respectRobotsTxt,
        delayBetweenRequests: validatedData.rateLimit
      },
      validatedData.pageOptions
    );

    return NextResponse.json({ 
      success: true, 
      crawlRequestId,
      message: 'Crawl started successfully' 
    });

  } catch (error) {
    console.error('Error starting crawl:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to start crawl' 
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
    const crawlRequestId = searchParams.get('id');

    if (!crawlRequestId) {
      return NextResponse.json({ error: 'Crawl request ID is required' }, { status: 400 });
    }

    const crawlStatus = await crawlService.getCrawlStatus(crawlRequestId);
    
    // Check if user owns this crawl request
    if (crawlStatus.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      data: crawlStatus 
    });

  } catch (error) {
    console.error('Error getting crawl status:', error);
    return NextResponse.json({ 
      error: 'Failed to get crawl status' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const crawlRequestId = searchParams.get('id');

    if (!crawlRequestId) {
      return NextResponse.json({ error: 'Crawl request ID is required' }, { status: 400 });
    }

    // Verify ownership
    const crawlRequest = await prisma.crawlRequest.findUnique({
      where: { id: crawlRequestId },
      select: { userId: true }
    });

    if (!crawlRequest || crawlRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await crawlService.stopCrawl(crawlRequestId);

    return NextResponse.json({ 
      success: true, 
      message: 'Crawl stopped successfully' 
    });

  } catch (error) {
    console.error('Error stopping crawl:', error);
    return NextResponse.json({ 
      error: 'Failed to stop crawl' 
    }, { status: 500 });
  }
}
