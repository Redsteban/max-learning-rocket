import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToClaude } from '@/lib/claude';
import { verifyToken } from '@/lib/auth';
import { ChatMessage } from '@/types';
import { generalApiThrottle } from '@/src/lib/api-throttle';

// Rate limiting
const userMessageCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_MESSAGES_PER_HOUR = 100;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Rate limiting check
    const now = Date.now();
    const userRateLimit = userMessageCounts.get(tokenData.userId) || { count: 0, resetTime: now + 3600000 };
    
    if (now > userRateLimit.resetTime) {
      userRateLimit.count = 0;
      userRateLimit.resetTime = now + 3600000;
    }

    if (userRateLimit.count >= MAX_MESSAGES_PER_HOUR) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      );
    }

    // Parse request body
    const { messages, moduleContext, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Send message to Claude with throttling
    const response = await generalApiThrottle.throttle(
      async () => sendMessageToClaude(messages, moduleContext),
      {
        cacheKey: `chat-${tokenData.userId}-${messages[messages.length - 1]?.content?.substring(0, 30)}`,
        priority: 1
      }
    );

    if (!response.isAppropriate) {
      return NextResponse.json(
        { error: 'The response was filtered for safety. Please try rephrasing your question.' },
        { status: 400 }
      );
    }

    // Update rate limit
    userRateLimit.count++;
    userMessageCounts.set(tokenData.userId, userRateLimit);

    // Store conversation in session (in production, use database)
    // This is for parent review
    storeConversation(tokenData.userId, sessionId, messages, response.content);

    return NextResponse.json({
      message: response.content,
      sessionId,
      remainingMessages: MAX_MESSAGES_PER_HOUR - userRateLimit.count,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}

// Store conversation for parent review (simplified for MVP)
const conversations = new Map<string, any[]>();

function storeConversation(userId: string, sessionId: string, messages: ChatMessage[], response: string) {
  const key = `${userId}_${sessionId}`;
  const existing = conversations.get(key) || [];
  existing.push({
    timestamp: new Date(),
    messages,
    response,
  });
  conversations.set(key, existing);
  
  // In production, store in database
  // Also implement cleanup of old conversations
}

export async function GET(request: NextRequest) {
  // Endpoint for parents to review conversations
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokenData = verifyToken(token);
  if (!tokenData || tokenData.role !== 'parent') {
    return NextResponse.json({ error: 'Parent access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get('childId');
  const sessionId = searchParams.get('sessionId');

  if (!childId) {
    return NextResponse.json({ error: 'Child ID required' }, { status: 400 });
  }

  const key = sessionId ? `${childId}_${sessionId}` : null;
  
  if (key) {
    const conversation = conversations.get(key);
    return NextResponse.json({ conversation: conversation || [] });
  }

  // Return all sessions for the child
  const childSessions: any[] = [];
  conversations.forEach((value, k) => {
    if (k.startsWith(`${childId}_`)) {
      childSessions.push({
        sessionId: k.split('_')[1],
        conversations: value,
      });
    }
  });

  return NextResponse.json({ sessions: childSessions });
}