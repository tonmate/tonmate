import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { encrypt, decrypt } from '../../../lib/encryption';

interface SettingsData {
  openaiApiKey?: string;
  openaiModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  anthropicApiKey?: string;
  anthropicModel?: string;
  cohereApiKey?: string;
  huggingFaceApiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        openaiApiKey: true,
        openaiModel: true,
        defaultTemperature: true,
        defaultMaxTokens: true,
        anthropicApiKey: true,
        anthropicModel: true,
        cohereApiKey: true,
        huggingFaceApiKey: true,
        webhookUrl: true,
        webhookSecret: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Decrypt sensitive fields
    const decryptedSettings: SettingsData = {
      openaiApiKey: user.openaiApiKey ? decrypt(user.openaiApiKey) : '',
      openaiModel: user.openaiModel || 'gpt-3.5-turbo',
      defaultTemperature: user.defaultTemperature || 0.7,
      defaultMaxTokens: user.defaultMaxTokens || 1000,
      anthropicApiKey: user.anthropicApiKey ? decrypt(user.anthropicApiKey) : '',
      anthropicModel: user.anthropicModel || 'claude-3-sonnet-20240229',
      cohereApiKey: user.cohereApiKey ? decrypt(user.cohereApiKey) : '',
      huggingFaceApiKey: user.huggingFaceApiKey ? decrypt(user.huggingFaceApiKey) : '',
      webhookUrl: user.webhookUrl || '',
      webhookSecret: user.webhookSecret ? decrypt(user.webhookSecret) : '',
    };

    return NextResponse.json(decryptedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SettingsData = await request.json();

    // Prepare data for database update
    const updateData: any = {};

    // Encrypt sensitive fields if provided
    if (body.openaiApiKey !== undefined) {
      updateData.openaiApiKey = body.openaiApiKey ? encrypt(body.openaiApiKey) : null;
    }
    if (body.openaiModel !== undefined) {
      updateData.openaiModel = body.openaiModel;
    }
    if (body.defaultTemperature !== undefined) {
      updateData.defaultTemperature = body.defaultTemperature;
    }
    if (body.defaultMaxTokens !== undefined) {
      updateData.defaultMaxTokens = body.defaultMaxTokens;
    }
    if (body.anthropicApiKey !== undefined) {
      updateData.anthropicApiKey = body.anthropicApiKey ? encrypt(body.anthropicApiKey) : null;
    }
    if (body.anthropicModel !== undefined) {
      updateData.anthropicModel = body.anthropicModel;
    }
    if (body.cohereApiKey !== undefined) {
      updateData.cohereApiKey = body.cohereApiKey ? encrypt(body.cohereApiKey) : null;
    }
    if (body.huggingFaceApiKey !== undefined) {
      updateData.huggingFaceApiKey = body.huggingFaceApiKey ? encrypt(body.huggingFaceApiKey) : null;
    }
    if (body.webhookUrl !== undefined) {
      updateData.webhookUrl = body.webhookUrl || null;
    }
    if (body.webhookSecret !== undefined) {
      updateData.webhookSecret = body.webhookSecret ? encrypt(body.webhookSecret) : null;
    }

    // Update user settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
