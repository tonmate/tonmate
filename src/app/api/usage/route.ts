import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

interface ConversationMessage {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  cost?: number;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get user's agents
    const agents = await prisma.agent.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (agents.length === 0) {
      return NextResponse.json({
        totalTokens: 0,
        totalCost: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        averageResponseTime: 0,
        dailyUsage: []
      });
    }

    const agentIds = agents.map((agent: { id: string }) => agent.id);

    // Get conversations for the user's agents
    const conversations = await prisma.conversation.findMany({
      where: {
        agentId: { in: agentIds },
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Since we don't have token usage tracking yet, we'll use mock data
    // In a real implementation, you'd store this in the conversation metadata
    const estimatedTokensPerMessage = 50;
    const estimatedCostPerToken = 0.002 / 1000; // $0.002 per 1K tokens

    // Calculate statistics
    const totalMessages = conversations.reduce((sum: number, conv: any) => {
      const messages = Array.isArray(conv.messages) ? conv.messages : [];
      return sum + messages.length;
    }, 0);
    
    const totalTokens = totalMessages * estimatedTokensPerMessage;
    const totalCost = totalTokens * estimatedCostPerToken;

    // Today's requests
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestsToday = conversations.filter((conv: any) => 
      new Date(conv.createdAt) >= today
    ).length;

    // This month's requests
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const requestsThisMonth = conversations.filter((conv: any) => 
      new Date(conv.createdAt) >= thisMonth
    ).length;

    // Mock average response time
    const averageResponseTime = 1200; // 1.2 seconds

    // Daily usage breakdown
    const dailyUsage = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayConversations = conversations.filter((conv: any) => {
        const convDate = new Date(conv.createdAt);
        return convDate >= date && convDate < nextDate;
      });

      const dayMessages = dayConversations.reduce((sum: number, conv: any) => {
        const messages = Array.isArray(conv.messages) ? conv.messages : [];
        return sum + messages.length;
      }, 0);

      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        tokens: dayMessages * estimatedTokensPerMessage,
        requests: dayConversations.length,
        cost: dayMessages * estimatedTokensPerMessage * estimatedCostPerToken
      });
    }

    return NextResponse.json({
      totalTokens,
      totalCost,
      requestsToday,
      requestsThisMonth,
      averageResponseTime,
      dailyUsage: dailyUsage.reverse() // Show oldest first
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
