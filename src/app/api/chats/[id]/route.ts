// app/api/chats/[id]/route.ts
import { NextRequest } from 'next/server';
import { BACKEND_URL, backendHeaders } from '@/lib/backend';

export const runtime = 'edge';

const CHAT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i; // anything else never reaches the backend

async function forward(req: NextRequest, params: Promise<{ id: string }>, method: 'GET' | 'DELETE') {
  const { id } = await params;
  if (!CHAT_ID.test(id)) {
    return Response.json({ error: 'Chat not found' }, { status: 404 });
  }
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/chats/${id}`, { method, headers: backendHeaders(req, { Authorization: authorization }) });
    if (!response.ok) {
      return Response.json({ error: response.status === 404 ? 'Chat not found' : 'Something went wrong' }, { status: response.status });
    }
    return method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json(await response.json());
  } catch (error) {
    console.error('Error in chat API route:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// A stored chat, rendered like the stream (to reopen it)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return forward(req, params, 'GET');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return forward(req, params, 'DELETE');
}
