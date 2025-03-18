// app/api/providers/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movie_id, region } = body;

    if (!movie_id || !region) {
      return new Response(
        JSON.stringify({ error: 'movie_id and region parameters are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call our FastAPI backend
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/api/providers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie_id, region }),
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