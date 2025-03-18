// app/api/movies/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call streaming FastAPI backend
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/api/movies/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.detail || 'Failed to fetch movie recommendations' }),
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
      const recommendations = [];
      
      try {
        while (true) {
          const { value, done } = await reader!.read();
          
          if (done) {
            // Send final state if there's anything in buffer
            if (buffer.trim()) {
              try {
                const event = JSON.parse(buffer.trim());
                if (event.type === 'movie') {
                  recommendations.push(event.data);
                }
              } catch (e) {
                console.error('Error parsing JSON:', buffer);
              }
            }
            
            // Always send a final state
            await writer.write(encoder.encode(JSON.stringify({
              recommendations,
              query
            })));
            
            await writer.close();
            break;
          }
          
          // Add new chunk to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep last incomplete line
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const event = JSON.parse(line.trim());
                
                if (event.type === 'init') {
                  // Initialize with empty recommendations
                  await writer.write(encoder.encode(JSON.stringify({
                    recommendations: [],
                    query: event.query
                  }) + '\n'));
                }
                else if (event.type === 'movie') {
                  // Add movie to recommendations and send update
                  recommendations.push(event.data);
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
    
    // Start processing without waiting
    processStream();
    
    // Return the readable part of the stream to the client
    return new Response(readable, {
      headers: { 'Content-Type': 'application/x-ndjson' }
    });
  } catch (error) {
    console.error('Error in movie API route:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}