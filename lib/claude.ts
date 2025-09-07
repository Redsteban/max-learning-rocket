import { ChatMessage } from '@/types';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ClaudeResponse {
  content: string;
  isAppropriate: boolean;
}

// Child-safe system prompt
const SYSTEM_PROMPT = `You are Max's Learning Adventure AI companion - a friendly, encouraging, and educational assistant designed specifically for Max, a 9-year-old Grade 4 student from Victoria, BC.

IMPORTANT GUIDELINES:
1. Always use age-appropriate language and explanations
2. Be encouraging and positive - celebrate efforts and progress
3. Make learning fun and engaging with analogies and examples
4. Keep responses concise (2-3 paragraphs maximum)
5. Use emojis occasionally to make interactions more fun 🎉
6. Never discuss inappropriate topics or provide unsafe content
7. Encourage curiosity and asking questions
8. Provide gentle corrections without making the child feel bad
9. Reference Victoria, BC and Canadian context when relevant (like the Inner Harbour, BC ferries, or local wildlife)
10. Adapt difficulty based on the child's responses

TEACHING APPROACH:
- Use the Socratic method - ask guiding questions
- Break complex topics into small, understandable chunks
- Use real-world examples Max can relate to
- Incorporate games and challenges when appropriate
- Always end with an encouraging note or fun fact

PERSONALITY:
- Friendly and warm like a favorite teacher
- Patient and understanding
- Excited about learning
- Encouraging of creativity and exploration
- Sometimes playful and silly (appropriate humor)`;

export async function sendMessageToClaude(
  messages: ChatMessage[],
  moduleContext?: string
): Promise<ClaudeResponse> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Add module-specific context
  let contextualPrompt = SYSTEM_PROMPT;
  if (moduleContext) {
    contextualPrompt += `\n\nCURRENT MODULE: ${moduleContext}`;
    contextualPrompt += getModuleSpecificPrompt(moduleContext);
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.7,
        system: contextualPrompt,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Safety check
    const isAppropriate = await checkContentSafety(content);

    return {
      content,
      isAppropriate,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to get response from Claude');
  }
}

function getModuleSpecificPrompt(module: string): string {
  const prompts: { [key: string]: string } = {
    science: `
Focus on:
- Explaining scientific concepts with everyday examples
- Encouraging experimentation and observation
- Discussing how things work in the world
- Making connections to nature and technology`,
    
    math: `
Focus on:
- Breaking down math problems into simple steps
- Using visual explanations and real-world examples
- Making math feel like solving puzzles
- Celebrating problem-solving strategies`,
    
    stories: `
Focus on:
- Encouraging creative expression
- Helping with story structure and ideas
- Building vocabulary in a fun way
- Celebrating imagination and creativity`,
    
    world: `
Focus on:
- Making geography and history exciting
- Connecting to local Victoria/BC history
- Explaining different cultures respectfully
- Encouraging curiosity about the world`,
    
    entrepreneur: `
Focus on:
- Simple business concepts using lemonade stand examples
- Basic money math and saving
- Leadership and teamwork skills
- Creative problem-solving`,
  };

  return prompts[module] || '';
}

async function checkContentSafety(content: string): Promise<boolean> {
  // Basic safety checks
  const inappropriateKeywords = [
    'violence', 'inappropriate', 'adult', 'dangerous',
    // Add more keywords as needed
  ];

  const lowerContent = content.toLowerCase();
  for (const keyword of inappropriateKeywords) {
    if (lowerContent.includes(keyword)) {
      return false;
    }
  }

  return true;
}

export function createLearningPrompt(
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard',
  previousResponse?: string
): string {
  const prompts = {
    easy: 'Start with basic concepts and use lots of examples',
    medium: 'Build on fundamentals with some challenges',
    hard: 'Provide enriching content that stretches thinking',
  };

  let prompt = `Teaching ${subject} at ${difficulty} level. ${prompts[difficulty]}.`;
  
  if (previousResponse) {
    prompt += ` Building on: "${previousResponse.substring(0, 100)}..."`;
  }

  return prompt;
}