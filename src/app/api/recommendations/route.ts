// app/api/recommendations/route.ts
import { NextRequest } from 'next/server';
import { ContentType, ContentTypeMode } from '@/types/content';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, history, content_type = ContentTypeMode.MOVIE } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call streaming FastAPI backend
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';

    const requestBody: Record<string, unknown> = { query, content_type };
    if (history && history.length > 0) {
      requestBody.history = history;
    }

    const response = await fetch(`${apiUrl}/api/recommendations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.detail || 'Failed to fetch recommendations' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set up a transform stream to process the ndjson from backend
    const { readable, writable } = new TransformStream();

    // Process the stream
    const processStream = async () => {
      const reader = response.body?.getReader();
      const writer = writable.getWriter();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      let buffer = '';
      const recommendations: Record<string, unknown>[] = [];

      try {
        while (true) {
          const { value, done } = await reader!.read();

          if (done) {
            if (buffer.trim()) {
              try {
                const event = JSON.parse(buffer.trim());
                if (event.type === 'content' || event.type === 'movie') {
                  const item = { ...event.data, content_type: event.content_type || ContentType.MOVIE };
                  recommendations.push(item);
                }
              } catch (e) {
                console.error('Error parsing JSON:', buffer);
              }
            }

            await writer.write(encoder.encode(JSON.stringify({
              recommendations,
              query
            })));

            await writer.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const event = JSON.parse(line.trim());

                if (event.type === 'init') {
                  await writer.write(encoder.encode(JSON.stringify({
                    recommendations: [],
                    query: event.query
                  }) + '\n'));
                }
                else if (event.type === 'content' || event.type === 'movie') {
                  const item = { ...event.data, content_type: event.content_type || ContentType.MOVIE };
                  recommendations.push(item);
                  await writer.write(encoder.encode(JSON.stringify({
                    recommendations,
                    query
                  }) + '\n'));
                }
              } catch (e) {
                console.error('Error parsing JSON:', line);
              }
            }
          }
        }
      } catch (e) {
        console.error('Stream processing error:', e);
        writer.abort(e);
      }
    };

    processStream();

    return new Response(readable, {
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
