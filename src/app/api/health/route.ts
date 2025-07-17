import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { logger } from '../../../lib/logger';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      message: string;
      responseTime?: number;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      message: string;
      requiredVars: string[];
      missingVars: string[];
    };
    memory: {
      status: 'healthy' | 'unhealthy';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: await checkDatabase(),
        environment: checkEnvironment(),
        memory: checkMemory(),
      },
    };

    // Determine overall health
    const allChecks = Object.values(result.checks);
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy');
    
    if (hasUnhealthy) {
      result.status = 'unhealthy';
    }

    const statusCode = result.status === 'healthy' ? 200 : 503;
    
    logger.info('Health check completed', {
      status: result.status,
      duration: Date.now() - startTime,
      checks: Object.fromEntries(
        Object.entries(result.checks).map(([key, value]) => [key, value.status])
      ),
    });

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
        environment: {
          status: 'unhealthy',
          message: 'Health check failed',
          requiredVars: [],
          missingVars: [],
        },
        memory: {
          status: 'unhealthy',
          used: 0,
          total: 0,
          percentage: 0,
        },
      },
    };

    return NextResponse.json(errorResult, { status: 503 });
  }
}

async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    // Simple database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy' as const,
      message: 'Database connection successful',
      responseTime,
    };
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    
    return {
      status: 'unhealthy' as const,
      message: `Database connection failed: ${(error as Error).message}`,
      responseTime: Date.now() - startTime,
    };
  }
}

function checkEnvironment() {
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      status: 'unhealthy' as const,
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      requiredVars,
      missingVars,
    };
  }

  return {
    status: 'healthy' as const,
    message: 'All required environment variables are set',
    requiredVars,
    missingVars: [],
  };
}

function checkMemory() {
  const usage = process.memoryUsage();
  const totalMemory = usage.heapTotal;
  const usedMemory = usage.heapUsed;
  const percentage = (usedMemory / totalMemory) * 100;

  // Consider memory usage unhealthy if over 90%
  const status: 'healthy' | 'unhealthy' = percentage > 90 ? 'unhealthy' : 'healthy';
  
  return {
    status,
    used: usedMemory,
    total: totalMemory,
    percentage,
  };
}

// Also provide a simple readiness check
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new Response(null, { status: 200 });
  } catch (error) {
    logger.error('Readiness check failed', error as Error);
    return new Response(null, { status: 503 });
  }
}
