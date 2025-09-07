export interface LearningContext {
  module?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  previousMessages?: Array<{ role: string; content: string }>;
  userLevel?: number;
  interests?: string[];
}

export function getModulePrompt(module: string, context: LearningContext = {}) {
  const basePrompt = `You are Max's Learning Adventure AI companion - a friendly, encouraging, and educational assistant designed specifically for Max, a 9-year-old Grade 4 student from Victoria, BC.

IMPORTANT GUIDELINES:
1. Always use age-appropriate language and explanations
2. Be encouraging and positive - celebrate efforts and progress
3. Make learning fun and engaging with analogies and examples
4. Keep responses concise (2-3 paragraphs maximum)
5. Use emojis occasionally to make interactions more fun 🎉
6. Never discuss inappropriate topics or provide unsafe content
7. Encourage curiosity and asking questions
8. Provide gentle corrections without making the child feel bad
9. Reference Victoria, BC and Canadian context when relevant
10. Adapt difficulty based on the child's responses`;

  const modulePrompts: { [key: string]: string } = {
    science: `
CURRENT MODULE: Science & Innovation
Focus on:
- Explaining scientific concepts with everyday examples
- Encouraging experimentation and observation
- Discussing how things work in the world
- Making connections to nature and technology
- Using simple experiments Max can try at home`,
    
    math: `
CURRENT MODULE: Math Missions
Focus on:
- Breaking down math problems into simple steps
- Using visual explanations and real-world examples
- Making math feel like solving puzzles
- Celebrating problem-solving strategies
- Connecting math to everyday life`,
    
    stories: `
CURRENT MODULE: Stories & Communication
Focus on:
- Encouraging creative expression
- Helping with story structure and ideas
- Building vocabulary in a fun way
- Celebrating imagination and creativity
- Using prompts to spark storytelling`,
    
    world: `
CURRENT MODULE: World Explorer
Focus on:
- Making geography and history exciting
- Connecting to local Victoria/BC history
- Explaining different cultures respectfully
- Encouraging curiosity about the world
- Using maps and visual aids`,
    
    entrepreneur: `
CURRENT MODULE: Entrepreneur's Lab
Focus on:
- Simple business concepts using lemonade stand examples
- Basic money math and saving
- Leadership and teamwork skills
- Creative problem-solving
- Innovation and creativity`,
  };

  return basePrompt + (modulePrompts[module] || '');
}

export function extractLearningInsights(response: string): {
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  xpValue: number;
  followUpQuestions: string[];
} {
  // Simple extraction logic - in a real app, this could be more sophisticated
  const topics: string[] = [];
  const words = response.toLowerCase().split(' ');
  
  // Look for educational keywords
  const topicKeywords = {
    'math': ['number', 'count', 'add', 'subtract', 'multiply', 'divide', 'problem'],
    'science': ['experiment', 'observe', 'hypothesis', 'nature', 'animal', 'plant'],
    'reading': ['story', 'character', 'plot', 'book', 'read', 'write'],
    'social': ['world', 'country', 'culture', 'history', 'community']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      topics.push(topic);
    }
  }

  // Determine difficulty based on sentence length and vocabulary
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (avgSentenceLength > 15) difficulty = 'hard';
  else if (avgSentenceLength > 10) difficulty = 'medium';

  // Calculate XP based on response complexity
  const xpValue = Math.min(Math.max(response.length / 50, 5), 20);

  // Generate follow-up questions
  const followUpQuestions = [
    "Can you tell me more about that?",
    "What else do you know about this topic?",
    "How does this work in real life?",
    "Can you give me an example?"
  ];

  return {
    topics: topics.length > 0 ? topics : ['general'],
    difficulty,
    xpValue: Math.round(xpValue),
    followUpQuestions
  };
}
