// app/api/recommendations/route.ts
import { NextRequest } from 'next/server';
import { MediaType } from '@/types/content';

export const runtime = 'edge';

// Proxies the backend's NDJSON stream unchanged; the page parses the events (see StreamEvent).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, history, media_types = [MediaType.MOVIE], web_search = false } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';

    const requestBody: Record<string, unknown> = { query, media_types, web_search };
    if (history && history.length > 0) {
      requestBody.history = history;
    }

    const response = await fetch(`${apiUrl}/api/recommendations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: req.signal, // stop the backend work when the user navigates away
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // FastAPI validation errors come back as a list of {msg, ...}
      const detail = Array.isArray(errorData.detail) ? errorData.detail[0]?.msg : errorData.detail;
      return new Response(
        JSON.stringify({ error: detail || 'Failed to fetch recommendations' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'application/x-ndjson' }
    });
  } catch (error) {
    console.error('Error in recommendations API route:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
