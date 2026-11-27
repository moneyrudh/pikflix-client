// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { BACKEND_URL, backendHeaders } from '@/lib/backend';

export const runtime = 'edge';

// One agent turn. Proxies the backend's NDJSON stream unchanged; the chat page parses the events (see ChatEvent).
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const { message, session_id } = await req.json();
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: backendHeaders(req, { 'Content-Type': 'application/json', Authorization: authorization }),
      body: JSON.stringify({ message, session_id }),
      signal: req.signal, // the backend stops Claude and its tools when the user leaves
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // A string detail is meant for users; FastAPI validation errors (a list) are internal
      const detail = typeof errorData.detail === 'string' ? errorData.detail : null;
      return Response.json({ error: detail || 'Something went wrong. Please try again.' }, { status: response.status });
    }

    return new Response(response.body, { headers: { 'Content-Type': 'application/x-ndjson' } });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
