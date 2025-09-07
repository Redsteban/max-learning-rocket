import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: 'API key not configured',
        details: 'ANTHROPIC_API_KEY is missing from environment variables'
      }, { status: 500 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Make a simple test request to Claude
    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      temperature: 0.7,
      system: "You are a friendly educational assistant for a 9-year-old child named Max. Keep responses brief, fun, and age-appropriate. Use emojis occasionally.",
      messages: [
        { role: 'user', content: message || 'Say hello to Max and tell him a fun fact about science!' }
      ]
    });

    // Extract the response text
    const responseText = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : 'Unable to get response';

    return NextResponse.json({ 
      success: true,
      response: responseText,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Claude API Error:', error);
    
    // Check for specific error types
    if (error.status === 401) {
      return NextResponse.json({ 
        error: 'Invalid API key',
        details: 'The Anthropic API key is invalid or expired'
      }, { status: 401 });
    }
    
    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.'
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to connect to Claude',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// GET endpoint for quick browser testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Claude API Test Endpoint',
    instructions: 'Send a POST request with { "message": "your message" } to test the API'
  });
}