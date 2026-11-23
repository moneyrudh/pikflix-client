// app/api/chats/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// The signed-in user's chats, most recent first
export async function GET(req: NextRequest) {
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/chats`, { headers: { Authorization: authorization } });
    if (!response.ok) {
      return Response.json({ error: "Couldn't load your chats" }, { status: response.status });
    }
    return Response.json(await response.json());
  } catch (error) {
    console.error('Error in chats API route:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
