/**
 * Test Utilities and Mock Data
 * Helper functions and data for Claude integration tests
 */

// Mock conversation data for different scenarios
export const mockConversations = {
  math: [
    { user: "What is 5 + 3?", expectedResponse: /8|eight/i },
    { user: "Can you help me with fractions?", expectedResponse: /fraction|part|whole/i },
    { user: "1/2 + 1/4 = ?", expectedResponse: /3\/4|three.?quarters/i }
  ],
  science: [
    { user: "How do plants make food?", expectedResponse: /photosynth|sun|light/i },
    { user: "Why is the sky blue?", expectedResponse: /scatter|light|wavelength/i },
    { user: "What are clouds made of?", expectedResponse: /water|droplet|vapor/i }
  ],
  stories: [
    { user: "Help me start a story", expectedResponse: /once|character|adventure/i },
    { user: "I need a character idea", expectedResponse: /hero|name|special/i },
    { user: "How do I end my story?", expectedResponse: /conclusion|resolve|happy/i }
  ],
  world: [
    { user: "Tell me about Victoria BC", expectedResponse: /capital|island|British Columbia/i },
    { user: "What countries are near Canada?", expectedResponse: /United States|USA|Mexico/i },
    { user: "Where do penguins live?", expectedResponse: /Antarctica|south|cold/i }
  ],
  entrepreneur: [
    { user: "I have a lemonade stand idea", expectedResponse: /business|customer|profit/i },
    { user: "How do I save money?", expectedResponse: /piggy|bank|save/i },
    { user: "What makes a good business?", expectedResponse: /solve|problem|help/i }
  ]
};

// Edge cases for testing
export const edgeCases = {
  longMessage: "I need help with my homework. " + "It's really hard. ".repeat(50),
  emptyMessage: "",
  specialCharacters: "What's 2+2? 🤔 Can you help??? !!!",
  mixedLanguage: "Help me with math por favor",
  inappropriateContent: "Tell me about scary monsters",
  externalLinkRequest: "Give me a website to learn more"
};

// Different learning scenarios
export const learningScenarios = {
  struggling: {
    messages: [
      "I don't understand",
      "This is too hard",
      "Can you make it easier?",
      "I'm confused"
    ],
    expectedBehavior: "simplified_explanation"
  },
  advanced: {
    messages: [
      "That was easy!",
      "Give me something harder",
      "I already know this",
      "Challenge me!"
    ],
    expectedBehavior: "increased_difficulty"
  },
  engaged: {
    messages: [
      "Cool! Tell me more",
      "Why does that happen?",
      "Can I try another?",
      "This is fun!"
    ],
    expectedBehavior: "maintain_engagement"
  },
  tired: {
    messages: [
      "I'm getting tired",
      "Can we take a break?",
      "My brain hurts",
      "Almost done?"
    ],
    expectedBehavior: "suggest_break"
  }
};

// Energy and mood states for testing
export const studentStates = {
  highEnergy: {
    timeOfDay: "3:30 PM",
    previousActivity: "PE class",
    suggestedActivity: "challenge"
  },
  lowEnergy: {
    timeOfDay: "4:20 PM",
    previousActivity: "math test",
    suggestedActivity: "creative"
  },
  frustrated: {
    recentStruggle: true,
    hintsUsed: 3,
    suggestedApproach: "encouraging"
  },
  excited: {
    recentSuccess: true,
    streakDays: 5,
    suggestedApproach: "challenging"
  }
};

// Performance benchmarks
export const performanceBenchmarks = {
  responseTime: {
    excellent: 1000,  // < 1 second
    good: 2000,       // < 2 seconds
    acceptable: 3000, // < 3 seconds
    max: 5000        // absolute max
  },
  tokenUsage: {
    averageInput: 100,
    averageOutput: 500,
    maxContext: 50000
  },
  cacheTargets: {
    hitRate: 0.30,    // 30% minimum
    optimal: 0.50     // 50% optimal
  },
  costLimits: {
    perSession: 0.10,  // $0.10
    daily: 2.00,       // $2.00
    monthly: 50.00     // $50.00
  }
};

// Mock Claude API responses
export class MockClaudeAPI {
  private delay: number;
  private errorRate: number;

  constructor(delay = 100, errorRate = 0) {
    this.delay = delay;
    this.errorRate = errorRate;
  }

  async sendMessage(message: string, context: any): Promise<any> {
    // Simulate network delay
    await this.simulateDelay();

    // Simulate errors
    if (Math.random() < this.errorRate) {
      throw new Error('Simulated API error');
    }

    // Generate appropriate response based on message
    return this.generateResponse(message, context);
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => 
      setTimeout(resolve, this.delay + Math.random() * 100)
    );
  }

  private generateResponse(message: string, context: any): any {
    const lower = message.toLowerCase();

    // Math responses
    if (lower.includes('add') || lower.includes('+')) {
      return {
        message: "Great question! Let's add those numbers together step by step.",
        xpToAward: 10,
        suggestedActivities: ['practice_addition']
      };
    }

    // Science responses
    if (lower.includes('plant') || lower.includes('photosynth')) {
      return {
        message: "Plants are amazing! They use sunlight to make their own food through photosynthesis.",
        xpToAward: 15,
        suggestedActivities: ['plant_experiment']
      };
    }

    // Default response
    return {
      message: "That's a great question! Let me help you understand.",
      xpToAward: 5,
      suggestedActivities: []
    };
  }
}

// Test data generator
export class TestDataGenerator {
  static generateStudent(overrides = {}) {
    return {
      id: `student-${Date.now()}`,
      name: 'Max',
      age: 9,
      grade: 4,
      location: 'Victoria, BC',
      ...overrides
    };
  }

  static generateSession(module = 'math', overrides = {}) {
    return {
      sessionId: `session-${Date.now()}`,
      studentId: 'test-student',
      module,
      startTime: new Date(),
      messages: [],
      ...overrides
    };
  }

  static generateMessages(count: number, module = 'math'): any[] {
    const messages = [];
    const templates = mockConversations[module as keyof typeof mockConversations] || [];
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      messages.push({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: i % 2 === 0 ? template.user : 'Here is my helpful response!',
        timestamp: new Date(Date.now() + i * 1000)
      });
    }
    
    return messages;
  }

  static generateActivityData() {
    return {
      type: 'challenge',
      title: 'Math Challenge',
      instructions: ['Step 1', 'Step 2', 'Step 3'],
      estimatedTime: 10,
      xpReward: 20
    };
  }
}

// Assertion helpers
export const assertGrade4Appropriate = (text: string): void => {
  const complexWords = text.split(' ').filter(word => word.length > 10);
  expect(complexWords.length).toBeLessThan(3);
  
  const sentences = text.split(/[.!?]/).filter(s => s.trim());
  sentences.forEach(sentence => {
    const words = sentence.split(' ').length;
    expect(words).toBeLessThan(20); // Grade 4 sentences should be < 20 words
  });
};

export const assertSafeContent = (text: string): void => {
  const unsafeWords = ['scary', 'violent', 'death', 'kill', 'blood'];
  const lower = text.toLowerCase();
  
  unsafeWords.forEach(word => {
    expect(lower).not.toContain(word);
  });
  
  // Check for URLs
  expect(text).not.toMatch(/https?:\/\//);
  expect(text).not.toMatch(/www\./);
};

export const assertEducationalValue = (response: any): void => {
  expect(response.message).toBeDefined();
  expect(response.message.length).toBeGreaterThan(20);
  expect(response.xpToAward).toBeGreaterThanOrEqual(0);
  
  // Should have some educational element
  const hasEducationalContent = 
    response.message.includes('learn') ||
    response.message.includes('understand') ||
    response.message.includes('try') ||
    response.message.includes('practice') ||
    response.message.includes('explore');
    
  expect(hasEducationalContent).toBe(true);
};

// Metrics collectors
export class MetricsCollector {
  private metrics: any[] = [];

  record(metric: any): void {
    this.metrics.push({
      ...metric,
      timestamp: new Date()
    });
  }

  getAverageResponseTime(): number {
    const times = this.metrics
      .filter(m => m.responseTime)
      .map(m => m.responseTime);
    
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  getCacheHitRate(): number {
    const total = this.metrics.filter(m => m.type === 'cache_check').length;
    const hits = this.metrics.filter(m => m.type === 'cache_hit').length;
    
    return total > 0 ? hits / total : 0;
  }

  getTotalCost(): number {
    return this.metrics
      .filter(m => m.cost)
      .reduce((sum, m) => sum + m.cost, 0);
  }

  reset(): void {
    this.metrics = [];
  }
}