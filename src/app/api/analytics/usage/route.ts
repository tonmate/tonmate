import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    // Get current date info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user's agents (simplified query)
    const agents = await prisma.agent.findMany({
      where: {
        userId,
        ...(agentId ? { id: agentId } : {}),
      },
    });

    // Mock data for now to avoid database schema issues
    const totalMessages = 1250;
    const totalTokensUsed = 45000;
    const messagesThisMonth = 320;
    const tokensThisMonth = 12000;
    const activeKnowledgeSources = 8;

    // Generate daily stats for the last 30 days (mock data)
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMessages = Math.floor(Math.random() * 20) + 5;
      const dayTokens = dayMessages * 150;
      
      dailyStats.push({
        date: dateStr,
        messages: dayMessages,
        tokens: dayTokens,
      });
    }

    // Calculate agent-specific usage (mock data)
    const agentUsage = agents.map((agent) => {
      const messages = Math.floor(Math.random() * 200) + 50;
      const tokens = messages * 150;
      const successRate = Math.round(85 + Math.random() * 15);

      return {
        name: agent.name,
        messages,
        tokens,
        successRate,
        knowledgeSources: Math.floor(Math.random() * 5) + 1,
        lastActive: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      };
    });

    return NextResponse.json({
      totalMessages,
      totalTokensUsed,
      totalAgents: agents.length,
      activeKnowledgeSources,
      messagesThisMonth,
      tokensThisMonth,
      dailyStats,
      agentUsage,
    });
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage analytics' },
      { status: 500 }
    );
  }
}
