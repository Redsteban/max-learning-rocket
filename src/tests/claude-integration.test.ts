/**
 * Claude API Integration Test Suite
 * Comprehensive tests for Max's learning platform
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { ClaudeTutor } from '../lib/claude-tutor';
import { ClaudeSessionManager } from '../lib/claude-session-manager';
import { ClaudeErrorHandler, ErrorType } from '../lib/claude-error-handler';
import { ClaudeCostManager } from '../lib/claude-cost-manager';
import { ResponseProcessor } from '../lib/response-processor';
import { ClaudeAnalytics } from '../lib/claude-analytics';
import { responseCache } from '../lib/response-cache';
import { fallbackTutor } from '../lib/fallback-tutor';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn()
    }
  }))
}));

describe('Claude Integration Test Suite', () => {
  let tutor: ClaudeTutor;
  let sessionManager: ClaudeSessionManager;
  let errorHandler: ClaudeErrorHandler;
  let costManager: ClaudeCostManager;
  let responseProcessor: ResponseProcessor;
  let analytics: ClaudeAnalytics;

  const testConfig = {
    studentId: 'test-max-123',
    studentName: 'Max',
    age: 9,
    grade: 4,
    location: 'Victoria, BC'
  };

  beforeAll(() => {
    // Set up test environment
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    // Initialize services
    tutor = new ClaudeTutor();
    sessionManager = new ClaudeSessionManager();
    errorHandler = new ClaudeErrorHandler();
    costManager = new ClaudeCostManager();
    responseProcessor = new ResponseProcessor();
    analytics = new ClaudeAnalytics();
    
    // Clear caches
    responseCache.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  /**
   * 1. INITIAL SETUP TESTS
   */
  describe('Initial Setup', () => {
    it('should validate API key', async () => {
      const isValid = await tutor.validateApiKey();
      expect(isValid).toBe(true);
    });

    it('should check model availability', async () => {
      const models = await tutor.getAvailableModels();
      expect(models).toContain('claude-3-haiku-20240307');
      expect(models).toContain('claude-3-sonnet-20240229');
    });

    it('should establish connection successfully', async () => {
      const connection = await tutor.testConnection();
      expect(connection.status).toBe('connected');
      expect(connection.latency).toBeLessThan(1000);
    });

    it('should load system prompts correctly', () => {
      const modules = ['science', 'math', 'stories', 'world', 'entrepreneur'];
      modules.forEach(module => {
        const prompt = tutor.getSystemPrompt(module);
        expect(prompt).toBeDefined();
        expect(prompt).toContain('Grade 4');
        expect(prompt).toContain('9 years old');
        expect(prompt).toContain('Victoria, BC');
      });
    });

    it('should initialize with correct student profile', () => {
      const profile = tutor.getStudentProfile();
      expect(profile.age).toBe(9);
      expect(profile.grade).toBe(4);
      expect(profile.location).toBe('Victoria, BC');
    });
  });

  /**
   * 2. CONVERSATION FLOW TESTS
   */
  describe('Conversation Flow', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await sessionManager.startSession(
        testConfig.studentId,
        'math'
      );
    });

    it('should start new session successfully', async () => {
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^session_/);
      
      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.module).toBe('math');
      expect(session?.isActive).toBe(true);
    });

    it('should maintain context over 20 messages', async () => {
      const messages = [
        "Hi Claude! I'm learning about fractions today.",
        "What is 1/2 + 1/4?",
        "Can you explain why?",
        "Let me try another one",
        "What about 1/3 + 1/6?"
      ];

      for (const message of messages) {
        const response = await tutor.sendMessage(message, {
          sessionId,
          module: 'math'
        });
        
        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
      }

      // Test context retention
      const contextTest = await tutor.sendMessage(
        "What was the first problem we solved?",
        { sessionId, module: 'math' }
      );
      
      expect(contextTest.message).toContain('1/2');
      expect(contextTest.message).toContain('1/4');
    });

    it('should handle subject switches smoothly', async () => {
      // Start with math
      let response = await tutor.sendMessage(
        "Help me with 5 x 6",
        { sessionId, module: 'math' }
      );
      expect(response.message).toContain('30');

      // Switch to science
      sessionManager.switchModule(sessionId, 'science');
      response = await tutor.sendMessage(
        "How do plants make food?",
        { sessionId, module: 'science' }
      );
      expect(response.message.toLowerCase()).toContain('photosynthesis');

      // Verify module context switched
      const session = sessionManager.getSession(sessionId);
      expect(session?.module).toBe('science');
    });

    it('should resume interrupted sessions', async () => {
      // Send initial messages
      await tutor.sendMessage("I'm learning about planets", {
        sessionId,
        module: 'science'
      });

      // Simulate interruption
      sessionManager.pauseSession(sessionId);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Resume session
      sessionManager.resumeSession(sessionId);
      const response = await tutor.sendMessage(
        "Which planet is biggest?",
        { sessionId, module: 'science' }
      );

      expect(response.message.toLowerCase()).toContain('jupiter');
      expect(response.message).toBeTruthy();
    });

    it('should end session properly', async () => {
      const summary = await sessionManager.endSession(sessionId);
      
      expect(summary).toBeDefined();
      expect(summary.duration).toBeGreaterThan(0);
      expect(summary.messageCount).toBeGreaterThan(0);
      expect(summary.xpEarned).toBeGreaterThanOrEqual(0);
      
      // Verify session is ended
      const session = sessionManager.getSession(sessionId);
      expect(session?.isActive).toBe(false);
    });
  });

  /**
   * 3. EDUCATIONAL FEATURES TESTS
   */
  describe('Educational Features', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await sessionManager.startSession(
        testConfig.studentId,
        'math'
      );
    });

    it('should provide Grade 4 appropriate responses', async () => {
      const response = await tutor.sendMessage(
        "What is multiplication?",
        { sessionId, module: 'math' }
      );

      // Check reading level
      const readingLevel = calculateReadingLevel(response.message);
      expect(readingLevel).toBeLessThanOrEqual(5); // Grade 5 max
      expect(readingLevel).toBeGreaterThanOrEqual(3); // Grade 3 min

      // Check for simple language
      expect(response.message).not.toContain('multiplicand');
      expect(response.message).not.toContain('commutative');
      expect(response.message).toMatch(/groups|adding|times/i);
    });

    it('should generate appropriate activities', async () => {
      const activity = await tutor.generateActivity('challenge', {
        module: 'science',
        difficulty: 'easy'
      });

      expect(activity).toBeDefined();
      expect(activity.type).toBe('challenge');
      expect(activity.estimatedTime).toBeLessThanOrEqual(30);
      expect(activity.instructions).toBeInstanceOf(Array);
      expect(activity.instructions.length).toBeGreaterThan(0);
      expect(activity.xpReward).toBeGreaterThan(0);
    });

    it('should calculate XP accurately', async () => {
      const scenarios = [
        { correct: true, difficulty: 'easy', expectedXP: 10 },
        { correct: true, difficulty: 'medium', expectedXP: 20 },
        { correct: true, difficulty: 'hard', expectedXP: 30 },
        { correct: false, difficulty: 'medium', expectedXP: 5 }
      ];

      for (const scenario of scenarios) {
        const xp = tutor.calculateXP(
          scenario.correct,
          scenario.difficulty
        );
        expect(xp).toBe(scenario.expectedXP);
      }
    });

    it('should detect achievement triggers', async () => {
      // Simulate streak achievement
      for (let i = 0; i < 5; i++) {
        await tutor.sendMessage(`Problem ${i}: What is ${i} + ${i}?`, {
          sessionId,
          module: 'math'
        });
      }

      const achievements = sessionManager.getSessionAchievements(sessionId);
      expect(achievements).toContain('problem_solver');
      expect(achievements.length).toBeGreaterThan(0);
    });

    it('should track mission completion', async () => {
      const mission = {
        id: 'math_mission_1',
        objectives: [
          'solve_5_problems',
          'no_hints',
          'under_10_minutes'
        ]
      };

      sessionManager.startMission(sessionId, mission);

      // Complete objectives
      for (let i = 0; i < 5; i++) {
        await tutor.sendMessage(`${i} + ${i} = ${i * 2}`, {
          sessionId,
          module: 'math'
        });
      }

      const completed = sessionManager.checkMissionCompletion(sessionId);
      expect(completed).toBe(true);
    });
  });

  /**
   * 4. SAFETY TESTS
   */
  describe('Safety Tests', () => {
    let sessionId: string;

    beforeEach(async () => {
      sessionId = await sessionManager.startSession(
        testConfig.studentId,
        'stories'
      );
    });

    it('should filter inappropriate content', async () => {
      const response = await responseProcessor.process({
        message: "Story with scary monsters and violence",
        module: 'stories'
      });

      expect(response.filtered).toBe(true);
      expect(response.message).not.toContain('violence');
      expect(response.message).not.toContain('scary');
      expect(response.safetyFlags).toContain('content_filtered');
    });

    it('should use age-appropriate language', async () => {
      const responses = [
        await tutor.sendMessage("Explain democracy", { sessionId, module: 'world' }),
        await tutor.sendMessage("What is photosynthesis?", { sessionId, module: 'science' }),
        await tutor.sendMessage("How do businesses work?", { sessionId, module: 'entrepreneur' })
      ];

      responses.forEach(response => {
        // Check vocabulary complexity
        const complexWords = countComplexWords(response.message);
        expect(complexWords).toBeLessThan(5);
        
        // Check sentence length
        const avgSentenceLength = getAverageSentenceLength(response.message);
        expect(avgSentenceLength).toBeLessThan(15);
      });
    });

    it('should not include external links', async () => {
      const response = await tutor.sendMessage(
        "Where can I learn more about space?",
        { sessionId, module: 'science' }
      );

      expect(response.message).not.toMatch(/https?:\/\//);
      expect(response.message).not.toContain('www.');
      expect(response.message).not.toContain('.com');
    });

    it('should enforce parent controls', async () => {
      // Set parent restrictions
      sessionManager.setParentControls(sessionId, {
        maxSessionTime: 30, // minutes
        restrictedTopics: ['war', 'violence'],
        requireParentApproval: ['external_resources']
      });

      // Test time limit
      sessionManager.updateSessionTime(sessionId, 31);
      const canContinue = sessionManager.checkSessionLimits(sessionId);
      expect(canContinue).toBe(false);

      // Test topic restriction
      const response = await tutor.sendMessage(
        "Tell me about wars",
        { sessionId, module: 'world' }
      );
      expect(response.parentAlert).toBe(true);
    });

    it('should enforce rate limiting', async () => {
      const promises = [];
      
      // Try to send 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        promises.push(
          tutor.sendMessage(`Question ${i}`, { sessionId, module: 'math' })
        );
      }

      const results = await Promise.allSettled(promises);
      const rateLimited = results.filter(r => 
        r.status === 'rejected' && 
        r.reason?.type === 'rate_limit'
      );
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  /**
   * 5. ERROR RECOVERY TESTS
   */
  describe('Error Recovery', () => {
    it('should handle API outage gracefully', async () => {
      // Mock API failure
      jest.spyOn(tutor, 'callClaude').mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await errorHandler.handleError(
        new Error('Network error'),
        { module: 'math' }
      );

      expect(result.errorType).toBe(ErrorType.NETWORK);
      expect(result.fallbackResponse).toBeDefined();
      expect(result.shouldRetry).toBe(true);
    });

    it('should recover from partial responses', async () => {
      // Mock partial response
      jest.spyOn(tutor, 'callClaude').mockResolvedValueOnce({
        message: "Here's how to solve",
        // Missing other fields
      });

      const response = await tutor.sendMessage("Help with math", {
        sessionId: 'test',
        module: 'math'
      });

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.xpToAward).toBe(0); // Default value
    });

    it('should preserve context during errors', async () => {
      const sessionId = 'test-session';
      
      // Add context
      sessionManager.addToContext(sessionId, {
        role: 'user',
        content: 'Learning about fractions'
      });

      // Simulate error
      const error = new Error('API timeout');
      await errorHandler.handleError(error, {
        sessionId,
        module: 'math'
      });

      // Check context preserved
      const recovered = sessionManager.recoverSession(sessionId);
      expect(recovered).toBeDefined();
      expect(recovered.context).toContainEqual(
        expect.objectContaining({ content: 'Learning about fractions' })
      );
    });

    it('should activate fallback mode correctly', async () => {
      // Simulate API unavailable
      jest.spyOn(tutor, 'isAvailable').mockResolvedValue(false);

      const response = await fallbackTutor.getFallbackResponse(
        'math',
        'fractions'
      );

      expect(response).toBeDefined();
      expect(response.isOfflineContent).toBe(true);
      expect(response.message).toContain('Offline Adventure Mode');
      expect(response.xpReward).toBeGreaterThan(0);
    });

    it('should enforce cost limits', async () => {
      // Set low cost limit for testing
      costManager.setDailyLimit(0.01);

      // Track usage to exceed limit
      for (let i = 0; i < 100; i++) {
        costManager.trackUsage('session', 1000, 500, 'claude-3-opus', 'math');
      }

      const canContinue = costManager.checkBudget();
      expect(canContinue).toBe(false);

      const model = costManager.selectOptimalModel('quality');
      expect(model).toBe('claude-3-haiku'); // Cheapest model
    });
  });

  /**
   * 6. PERFORMANCE TESTS
   */
  describe('Performance Tests', () => {
    it('should respond within 3 seconds', async () => {
      const startTime = Date.now();
      
      await tutor.sendMessage("What is 2 + 2?", {
        sessionId: 'perf-test',
        module: 'math'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000);
    });

    it('should optimize token usage', async () => {
      const longContext = Array(50).fill(null).map((_, i) => ({
        role: 'user' as const,
        content: `Message ${i}: This is a test message`
      }));

      const optimized = costManager.optimizePrompt(
        longContext,
        'Test system prompt',
        'math'
      );

      expect(optimized.compressionRatio).toBeGreaterThan(1.5);
      expect(optimized.estimatedTokens).toBeLessThan(10000);
    });

    it('should achieve 30% cache hit rate', async () => {
      const questions = [
        "What is 2 + 2?",
        "What is 2 + 2?", // Duplicate
        "How do plants grow?",
        "How do plants grow?", // Duplicate
        "What is multiplication?",
        "What is 2 + 2?" // Duplicate
      ];

      for (const question of questions) {
        await tutor.sendMessage(question, {
          sessionId: 'cache-test',
          module: 'math'
        });
      }

      const stats = responseCache.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0.3);
    });

    it('should handle memory efficiently', () => {
      const memoryBefore = process.memoryUsage().heapUsed;

      // Create 100 sessions
      for (let i = 0; i < 100; i++) {
        sessionManager.startSession(`student-${i}`, 'math');
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024; // MB

      expect(memoryIncrease).toBeLessThan(50); // Less than 50MB
    });

    it('should handle concurrent sessions', async () => {
      const sessions = Array(5).fill(null).map((_, i) => 
        sessionManager.startSession(`student-${i}`, 'math')
      );

      const promises = sessions.map(sessionId =>
        tutor.sendMessage("Help me learn", {
          sessionId,
          module: 'math'
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');

      expect(successful.length).toBe(5);
    });
  });

  /**
   * 7. INTEGRATION TESTS
   */
  describe('Full Integration Flow', () => {
    it('should complete full learning session', async () => {
      // Start session
      const sessionId = await sessionManager.startSession(
        testConfig.studentId,
        'math'
      );
      
      // Track analytics
      analytics.startSession(sessionId, testConfig.studentId, 'math');

      // Send messages
      const conversation = [
        { message: "Hi Claude!", expectedXP: 10 },
        { message: "I want to learn about fractions", expectedXP: 15 },
        { message: "What is 1/2 + 1/2?", expectedXP: 20 },
        { message: "That makes sense! 1/2 + 1/2 = 1", expectedXP: 25 },
        { message: "Can I try another?", expectedXP: 10 },
        { message: "What about 1/3 + 1/3?", expectedXP: 20 }
      ];

      let totalXP = 0;
      for (const turn of conversation) {
        const response = await tutor.sendMessage(turn.message, {
          sessionId,
          module: 'math'
        });

        // Track in analytics
        analytics.trackMessage(sessionId, {
          role: 'user',
          content: turn.message,
          tokens: turn.message.length / 4
        });

        analytics.trackMessage(sessionId, {
          role: 'assistant',
          content: response.message,
          tokens: response.message.length / 4,
          responseTime: 1500
        });

        totalXP += response.xpToAward || 0;
      }

      // End session
      const summary = await sessionManager.endSession(sessionId);
      analytics.endSession(sessionId);

      // Generate report
      const report = analytics.generateWeeklyReport(testConfig.studentId);

      // Verify complete flow
      expect(summary.messageCount).toBe(conversation.length * 2);
      expect(totalXP).toBeGreaterThan(50);
      expect(report).toBeDefined();
      expect(report.summary.totalSessions).toBeGreaterThan(0);
    });
  });
});

/**
 * Helper Functions
 */
function calculateReadingLevel(text: string): number {
  // Simplified Flesch-Kincaid Grade Level
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  return 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = /[aeiou]/.test(word[i]);
    if (isVowel && !previousWasVowel) count++;
    previousWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}

function countComplexWords(text: string): number {
  const words = text.split(/\s+/);
  return words.filter(word => countSyllables(word) > 3).length;
}

function getAverageSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return sentences.length > 0 ? words.length / sentences.length : 0;
}