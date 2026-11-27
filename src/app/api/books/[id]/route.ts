// app/api/books/[id]/route.ts
import { NextRequest } from 'next/server';
import { BACKEND_URL, backendHeaders } from '@/lib/backend';

export const runtime = 'edge';

const WORK_ID = /^OL\d+W$/; // Open Library work key; anything else never reaches the backend

// A recommended book with its description (the backend loads it from Open Library on first open)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!WORK_ID.test(id)) {
    return Response.json({ error: 'Invalid book id' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/books/${id}`, { headers: backendHeaders(req) });
    if (!response.ok) {
      return Response.json({ error: 'Book not found' }, { status: response.status });
    }
    return Response.json(await response.json());
  } catch (error) {
    console.error('Error in books API route:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
