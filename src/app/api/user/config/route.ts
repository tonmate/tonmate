import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { encrypt, decrypt } from '../../../../lib/encryption';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Decrypt API key for display (show only last 4 characters)
    let maskedApiKey = '';
    if (user.openaiApiKey) {
      try {
        const decryptedKey = decrypt(user.openaiApiKey);
        maskedApiKey = decryptedKey.length > 4 ? 
          '••••••••••••••••••••••••••••••••••••••••••••••••' + decryptedKey.slice(-4) : 
          decryptedKey;
      } catch (error) {
        console.error('Error decrypting API key:', error);
      }
    }

    return NextResponse.json({
      config: {
        openaiApiKey: maskedApiKey,
        shopUrl: user.shopUrl,
        shopName: user.shopName,
        shopDescription: user.shopDescription
      },
      products: user.products,
      orders: user.orders
    });
  } catch (error) {
    console.error('Error fetching user config:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { openaiApiKey, shopUrl, shopName, shopDescription } = await request.json();

    // Encrypt API key if provided
    let encryptedApiKey = undefined;
    if (openaiApiKey && openaiApiKey.trim() && !openaiApiKey.includes('••••')) {
      encryptedApiKey = encrypt(openaiApiKey.trim());
    }

    const updateData: any = {
      shopUrl: shopUrl || null,
      shopName: shopName || null,
      shopDescription: shopDescription || null
    };

    if (encryptedApiKey) {
      updateData.openaiApiKey = encryptedApiKey;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    // Return masked API key
    let maskedApiKey = '';
    if (user.openaiApiKey) {
      try {
        const decryptedKey = decrypt(user.openaiApiKey);
        maskedApiKey = decryptedKey.length > 4 ? 
          '••••••••••••••••••••••••••••••••••••••••••••••••' + decryptedKey.slice(-4) : 
          decryptedKey;
      } catch (error) {
        console.error('Error decrypting API key:', error);
      }
    }

    return NextResponse.json({
      config: {
        openaiApiKey: maskedApiKey,
        shopUrl: user.shopUrl,
        shopName: user.shopName,
        shopDescription: user.shopDescription
      }
    });
  } catch (error) {
    console.error('Error updating user config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}