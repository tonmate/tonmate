import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

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

    // Check if user already has an API key
    const existingApiKey = await prisma.apiKey.findFirst({
      where: { userId: user.id }
    });

    return NextResponse.json({
      apiKey: existingApiKey?.key || null,
      createdAt: existingApiKey?.createdAt || null
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API key' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Generate a new API key
    const newApiKey = `sk-${randomBytes(32).toString('hex')}`;

    // Delete existing API key if any
    await prisma.apiKey.deleteMany({
      where: { userId: user.id }
    });

    // Create new API key
    const apiKey = await prisma.apiKey.create({
      data: {
        key: newApiKey,
        userId: user.id,
        name: 'Default API Key'
      }
    });

    return NextResponse.json({
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
