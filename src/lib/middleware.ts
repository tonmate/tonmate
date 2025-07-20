import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { apiLimiter, authLimiter, chatLimiter, knowledgeLimiter, getUserIdentifier } from './rateLimit';
import { logger } from './logger';

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting configuration per endpoint
const rateLimitConfig = {
  '/api/auth': authLimiter,
  '/api/chat': chatLimiter,
  '/api/knowledge-sources': knowledgeLimiter,
  default: apiLimiter,
};

// Apply security headers to response
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Apply CORS headers to response
export function withCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse> 
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized access attempt', {
        url: request.url,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      );
    }

    return await handler(request, session);
  } catch (error) {
    logger.error('Authentication middleware error', error as Error, {
      url: request.url,
      method: request.method,
    });
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Rate limiting middleware
export function withRateLimit(
  request: NextRequest,
  endpoint: string
): NextResponse | null {
  if (process.env.RATE_LIMIT_ENABLED !== 'true') {
    return null; // Rate limiting disabled
  }

  // Get appropriate rate limiter for endpoint
  const limiter = rateLimitConfig[endpoint as keyof typeof rateLimitConfig] || rateLimitConfig.default;
  
  // Get user identifier (prefer user ID over IP)
  const identifier = getUserIdentifier(request);
  
  // Check rate limit
  const rateLimitCheck = limiter.middleware((req: Request) => identifier);
  return rateLimitCheck(request);
}

// Input validation middleware
export function withValidation<T>(
  request: NextRequest,
  validator: (data: unknown) => T,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
): Promise<NextResponse> {
  return new Promise(async (resolve) => {
    try {
      const body = await request.json();
      const validatedData = validator(body);
      
      logger.debug('Request validation successful', {
        url: request.url,
        method: request.method,
        dataKeys: Object.keys(validatedData || {}),
      });
      
      resolve(await handler(request, validatedData));
    } catch (error) {
      logger.warn('Request validation failed', {
        url: request.url,
        method: request.method,
        error: (error as Error).message,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });
      
      resolve(NextResponse.json(
        { 
          error: 'Validation failed', 
          message: (error as Error).message 
        },
        { status: 400 }
      ));
    }
  });
}

// Combined middleware wrapper
export function withMiddleware(
  handler: (request: NextRequest, session?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: string;
    validation?: (data: unknown) => any;
  } = {}
) {
  return async (request: NextRequest, params?: any): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = withRateLimit(request, options.rateLimit);
        if (rateLimitResponse) {
          return withSecurityHeaders(withCorsHeaders(rateLimitResponse));
        }
      }

      // Handle OPTIONS requests (CORS preflight)
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        return withSecurityHeaders(withCorsHeaders(response));
      }

      // Log request
      logger.info('API request', {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      let response: NextResponse;

      // Apply authentication if required
      if (options.requireAuth) {
        response = await withAuth(request, async (req, session) => {
          // Apply validation if provided
          if (options.validation && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
            return await withValidation(request, options.validation, (validatedRequest, data) => 
              handler(validatedRequest, session)
            );
          }
          return await handler(req, session);
        });
      } else {
        // Apply validation if provided
        if (options.validation && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
          response = await withValidation(request, options.validation, (validatedRequest, data) => 
            handler(validatedRequest)
          );
        } else {
          response = await handler(request);
        }
      }

      // Apply security and CORS headers
      return withSecurityHeaders(withCorsHeaders(response));
    } catch (error) {
      logger.error('Middleware error', error as Error, {
        url: request.url,
        method: request.method,
      });
      
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      return withSecurityHeaders(withCorsHeaders(errorResponse));
    }
  };
}

// Helper function to create API responses with consistent format
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  const response = {
    success: status >= 200 && status < 300,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

// Helper function to create error responses
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

export default withMiddleware;
