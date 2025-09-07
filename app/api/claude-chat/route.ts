import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getModulePrompt, extractLearningInsights, LearningContext } from '@/src/lib/claude-prompts';
import { processClaudeResponse } from '@/src/lib/response-handler';
import { claudeThrottle } from '@/src/lib/api-throttle';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, module, history } = await request.json();

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Check message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long! Keep it under 500 characters.' },
        { status: 400 }
      );
    }

    // Extract learning insights from history
    const insights = extractLearningInsights(history || []);
    
    // Create learning context
    const context: LearningContext = {
      module: module || 'general',
      difficulty: insights.difficulty,
      recentTopics: insights.topics,
      successRate: insights.engagement,
      interests: [], // Could be loaded from user profile
      conversationCount: history?.length || 0
    };

    // Get module-specific prompt with context
    const systemPrompt = getModulePrompt(module || 'general', context);

    // Prepare conversation history
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Call Claude API with throttling
    const completion = await claudeThrottle.throttle(
      async () => anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Using Haiku for faster, cheaper responses
        max_tokens: 500, // Limit response length for kids
        temperature: 0.7, // Balanced creativity
        messages: messages.slice(-10), // Keep last 10 messages for context
      }),
      {
        cacheKey: `claude-${module}-${message.substring(0, 50)}`,
        priority: 1
      }
    );

    // Extract text response
    const responseText = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    // Process response with smart handler
    const processedResponse = processClaudeResponse(responseText, module, 9);

    // Add some fun elements if the response is short
    let finalResponse = processedResponse.processedContent;
    if (finalResponse.length < 50 && !finalResponse.includes('�')) {
      finalResponse += ' 🌟';
    }

    return NextResponse.json({
      message: finalResponse,
      processedResponse: processedResponse,
      module: module,
      timestamp: new Date().toISOString(),
      xpAwarded: processedResponse.xpAwarded,
      learningPoints: processedResponse.learningPoints,
      vocabulary: processedResponse.keyVocabulary,
      activities: processedResponse.activities,
      funFacts: processedResponse.funFacts,
      followUpQuestions: processedResponse.followUpQuestions
    });

  } catch (error: any) {
    console.error('Claude API error:', error);
    
    // Check if it's a rate limit error
    if (error?.status === 429 || error?.status === 529 || error?.message?.includes('Circuit breaker')) {
      return NextResponse.json({
        message: "Max is thinking really hard! 🤔 Give me just a moment to catch my breath, then try again!",
        error: true,
        retryAfter: 5000, // Suggest retry after 5 seconds
        errorType: 'rate_limit'
      }, { status: 429 });
    }
    
    // Kid-friendly error messages for other errors
    const errorMessages = [
      "Oops! My thinking cap fell off! 🎩 Can you ask that again?",
      "Oh no! My brain got a bit fuzzy! 🌀 Let's try once more!",
      "Hmm, I need to put on my smart glasses! 👓 Ask me again!",
      "My circuits are doing a little dance! 💃 One more time please!",
      "I got distracted by a butterfly! 🦋 What was that again?"
    ];
    
    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    
    return NextResponse.json({
      message: randomError,
      error: true
    });
  }
}