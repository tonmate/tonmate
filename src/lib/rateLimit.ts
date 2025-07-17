import { NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // Check if request should be rate limited
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const now = Date.now();
    const windowStart = now;
    const windowEnd = now + this.options.windowMs;

    if (!this.store[identifier]) {
      this.store[identifier] = {
        count: 0,
        resetTime: windowEnd,
      };
    }

    const entry = this.store[identifier];

    // Reset window if expired
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = windowEnd;
    }

    const allowed = entry.count < this.options.max;
    const remaining = Math.max(0, this.options.max - entry.count);

    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: remaining - (allowed ? 1 : 0),
      resetTime: entry.resetTime,
    };
  }

  // Middleware function
  middleware(getIdentifier: (request: Request) => string) {
    return (request: Request) => {
      const identifier = getIdentifier(request);
      const result = this.check(identifier);

      if (!result.allowed) {
        const headers = new Headers({
          'X-RateLimit-Limit': this.options.max.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        });

        return NextResponse.json(
          { error: this.options.message },
          { status: 429, headers }
        );
      }

      return null; // Allow request to proceed
    };
  }
}

// Pre-configured rate limiters
export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
});

export const chatLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
});

export const knowledgeLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 knowledge source processes per hour
});

// Helper function to get IP address
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Helper function to get user identifier
export function getUserIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIP(request)}`;
}

export default RateLimiter;
