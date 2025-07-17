import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      providerId, 
      apiKey, 
      defaultModel, 
      temperature, 
      maxTokens, 
      topP, 
      frequencyPenalty, 
      presencePenalty 
    } = body;

    if (!providerId || !apiKey || !defaultModel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save model configuration
    const modelConfig = await prisma.modelConfiguration.upsert({
      where: {
        userId_providerId: {
          userId: user.id,
          providerId: providerId
        }
      },
      update: {
        apiKey: apiKey,
        defaultModel: defaultModel,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2000,
        topP: topP || 0.9,
        frequencyPenalty: frequencyPenalty || 0,
        presencePenalty: presencePenalty || 0,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        providerId: providerId,
        apiKey: apiKey,
        defaultModel: defaultModel,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2000,
        topP: topP || 0.9,
        frequencyPenalty: frequencyPenalty || 0,
        presencePenalty: presencePenalty || 0,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Model configuration saved successfully',
      configuration: modelConfig 
    });

  } catch (error) {
    console.error('Error saving model configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const configurations = await prisma.modelConfiguration.findMany({
      where: { userId: user.id },
      select: {
        providerId: true,
        defaultModel: true,
        temperature: true,
        maxTokens: true,
        topP: true,
        frequencyPenalty: true,
        presencePenalty: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ configurations });

  } catch (error) {
    console.error('Error fetching model configurations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
