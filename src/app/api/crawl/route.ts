import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { StoreCrawler } from '../../../lib/crawler';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopUrl } = await request.json();

    if (!shopUrl) {
      return NextResponse.json({ error: 'Shop URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(shopUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const crawler = new StoreCrawler(shopUrl);

    // Crawl products and orders
    const [crawledProducts, crawledOrders] = await Promise.all([
      crawler.crawlProducts(),
      crawler.crawlOrders()
    ]);

    // Clear existing data for this user
    await prisma.product.deleteMany({
      where: { userId: session.user.id }
    });

    await prisma.order.deleteMany({
      where: { userId: session.user.id }
    });

    // Insert new products
    const products = await Promise.all(
      crawledProducts.map(product =>
        prisma.product.create({
          data: {
            userId: session.user.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            size: product.size,
            color: product.color,
            inStock: product.inStock,
            imageUrl: product.imageUrl,
            url: product.url
          }
        })
      )
    );

    // Insert new orders
    const orders = await Promise.all(
      crawledOrders.map(order =>
        prisma.order.create({
          data: {
            userId: session.user.id,
            orderId: order.orderId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            status: order.status,
            total: order.total,
            items: order.items,
            trackingNumber: order.trackingNumber
          }
        })
      )
    );

    return NextResponse.json({
      message: 'Store crawled successfully',
      products,
      orders
    });
  } catch (error) {
    console.error('Error crawling store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}