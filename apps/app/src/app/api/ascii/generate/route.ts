import { auth } from '@clerk/nextjs/server';
import { generateAsciiArt } from '@repo/services/ascii';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt, apiKey } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate ASCII art using the service
    const result = await generateAsciiArt(prompt, apiKey);
    
    return Response.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('ASCII generation error:', error);
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate ASCII art'
      },
      { status: 500 }
    );
  }
}