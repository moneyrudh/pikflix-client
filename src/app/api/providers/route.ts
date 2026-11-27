// app/api/providers/route.ts
import { NextRequest } from 'next/server';
import { BACKEND_URL, backendHeaders } from '@/lib/backend';
import { ContentType } from '@/types/content';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content_id, content_type = ContentType.MOVIE, region } = body;

    if (!content_id || !region) {
      return new Response(
        JSON.stringify({ error: 'content_id and region parameters are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/providers/`, {
      method: 'POST',
      headers: backendHeaders(req, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ content_id, content_type, region }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.detail || 'Failed to fetch providers' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in providers API route:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
