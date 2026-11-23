// app/api/books/[id]/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const WORK_ID = /^OL\d+W$/; // Open Library work key; anything else never reaches the backend

// A recommended book with its description (the backend loads it from Open Library on first open)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!WORK_ID.test(id)) {
    return Response.json({ error: 'Invalid book id' }, { status: 400 });
  }

  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/books/${id}`);
    if (!response.ok) {
      return Response.json({ error: 'Book not found' }, { status: response.status });
    }
    return Response.json(await response.json());
  } catch (error) {
    console.error('Error in books API route:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
