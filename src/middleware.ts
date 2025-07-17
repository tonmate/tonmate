import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.cohere.ai;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
};

// Simple rate limiting for Edge Runtime
const rateLimits = new Map<string, { count: number; resetTime: number }>();

const createRateLimiter = (windowMs: number, max: number) => {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${request.nextUrl.pathname}`;
    
    const current = rateLimits.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return null;
    }
    
    if (current.count >= max) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          },
        }
      );
    }
    
    current.count++;
    return null;
  };
};

// Rate limiters
const apiLimiter = createRateLimiter(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const chatLimiter = createRateLimiter(60 * 1000, 60); // 60 requests per minute
const knowledgeLimiter = createRateLimiter(60 * 1000, 10); // 10 requests per minute

// Apply CORS
const applyCORS = (response: NextResponse, origin?: string | null) => {
  const allowedOrigins = [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'https://localhost:3000',
    'https://your-domain.com',
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
};

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const origin = request.headers.get('origin');
  
  // Handle OPTIONS requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return applyCORS(response, origin);
  }
  
  // Skip middleware for static files and public routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/' ||
    pathname === '/login'
  ) {
    const response = NextResponse.next();
    
    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return applyCORS(response, origin);
  }
  
  // Apply rate limiting
  let rateLimitResult = null;
  
  if (pathname.startsWith('/api/auth/')) {
    rateLimitResult = await authLimiter(request);
  } else if (pathname.startsWith('/api/chat/')) {
    rateLimitResult = await chatLimiter(request);
  } else if (pathname.startsWith('/api/knowledge-sources/')) {
    rateLimitResult = await knowledgeLimiter(request);
  } else if (pathname.startsWith('/api/')) {
    rateLimitResult = await apiLimiter(request);
  }
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Check authentication for protected routes
  if (pathname.startsWith('/dashboard') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return applyCORS(response, origin);
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
