// lib/backend.ts
// Server-only: used by the API proxy routes. The backend refuses /api requests that don't carry the
// shared secret, so it can only be reached through these routes, which also tell it who the visitor
// is (for its per-visitor search limits). BACKEND_SHARED_SECRET has no NEXT_PUBLIC_ prefix, so it never
// reaches the browser.
import { NextRequest } from 'next/server';

export const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

// The visitor's IP. The proxy in front of this server appends the address it saw to X-Forwarded-For,
// so the last entry is the one a visitor can't fake (earlier entries are whatever the client sent).
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const last = forwarded?.split(',').map(part => part.trim()).filter(Boolean).pop();
  return last || req.headers.get('x-real-ip') || 'unknown';
}

export function backendHeaders(req: NextRequest, extra: Record<string, string> = {}): Record<string, string> {
  return {
    ...extra,
    'X-Pikflix-Proxy-Secret': process.env.BACKEND_SHARED_SECRET ?? '',
    'X-Pikflix-Client-Ip': clientIp(req),
  };
}
