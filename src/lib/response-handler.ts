export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model?: string;
}

export interface ProcessedResponse {
  message: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  xpValue: number;
  followUpQuestions: string[];
  isAppropriate: boolean;
  tokensUsed: number;
}

export function processClaudeResponse(response: ClaudeResponse): ProcessedResponse {
  const content = response.content || '';
  
  // Basic content safety check
  const inappropriateKeywords = [
    'violence', 'inappropriate', 'adult', 'dangerous', 'harmful'
  ];
  
  const isAppropriate = !inappropriateKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );

  // Extract learning insights
  const topics: string[] = [];
  const words = content.toLowerCase().split(' ');
  
  const topicKeywords = {
    'math': ['number', 'count', 'add', 'subtract', 'multiply', 'divide', 'problem', 'equation'],
    'science': ['experiment', 'observe', 'hypothesis', 'nature', 'animal', 'plant', 'physics', 'chemistry'],
    'reading': ['story', 'character', 'plot', 'book', 'read', 'write', 'literature', 'poetry'],
    'social': ['world', 'country', 'culture', 'history', 'community', 'geography', 'government']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      topics.push(topic);
    }
  }

  // Determine difficulty based on response characteristics
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length 
    : 0;
  
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (avgSentenceLength > 15) difficulty = 'hard';
  else if (avgSentenceLength > 10) difficulty = 'medium';

  // Calculate XP based on response complexity and length
  const xpValue = Math.min(Math.max(content.length / 50 + topics.length * 2, 5), 25);

  // Generate contextual follow-up questions
  const followUpQuestions = generateFollowUpQuestions(topics, content);

  const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

  return {
    message: content,
    topics: topics.length > 0 ? topics : ['general'],
    difficulty,
    xpValue: Math.round(xpValue),
    followUpQuestions,
    isAppropriate,
    tokensUsed
  };
}

function generateFollowUpQuestions(topics: string[], content: string): string[] {
  const baseQuestions = [
    "Can you tell me more about that?",
    "What else do you know about this topic?",
    "How does this work in real life?",
    "Can you give me an example?"
  ];

  const topicSpecificQuestions: { [key: string]: string[] } = {
    'math': [
      "Can you show me how to solve a similar problem?",
      "What other ways can I think about this?",
      "How is this math used in everyday life?"
    ],
    'science': [
      "What experiment could I try to test this?",
      "What other things work the same way?",
      "How do scientists study this?"
    ],
    'reading': [
      "Can you help me write a story about this?",
      "What other stories are like this one?",
      "How do authors create interesting characters?"
    ],
    'social': [
      "What other countries have similar things?",
      "How has this changed over time?",
      "What can we learn from this?"
    ]
  };

  const specificQuestions = topics.flatMap(topic => 
    topicSpecificQuestions[topic] || []
  );

  return [...baseQuestions, ...specificQuestions].slice(0, 4);
}
