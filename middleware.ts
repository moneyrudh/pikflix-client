// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define interface for rate limit data structure
interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting with proper typing
const rateLimitMap = new Map<string, RateLimitData>();

// Rate limit configuration
const RATE_LIMIT = 20; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute in milliseconds

export function middleware(request: NextRequest): NextResponse {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get IP with fallbacks and proper type assertion
    const ip: string = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const now: number = Date.now();
    
    // Get or initialize rate limit data for this IP
    const existingData = rateLimitMap.get(ip);
    const rateData: RateLimitData = existingData || {
      count: 0,
      resetTime: now + WINDOW_MS
    };
    
    // Reset counter if the window has passed
    if (now > rateData.resetTime) {
      rateData.count = 0;
      rateData.resetTime = now + WINDOW_MS;
    }
    
    // Increment counter
    rateData.count += 1;
    rateLimitMap.set(ip, rateData);
    
    // Calculate seconds until reset for headers
    const retryAfterSeconds: number = Math.ceil((rateData.resetTime - now) / 1000);
    
    // Check if rate limit exceeded
    if (rateData.count > RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: retryAfterSeconds
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': retryAfterSeconds.toString()
          } 
        }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};