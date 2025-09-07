/**
 * Batch Processing System
 * Efficiently generates content in bulk to reduce API calls
 */

import { Activity } from './claude-activities';

interface BatchRequest {
  id: string;
  type: 'missions' | 'quizzes' | 'activities' | 'summaries' | 'feedback';
  module: string;
  count: number;
  parameters?: any;
  priority: 'high' | 'medium' | 'low';
}

interface BatchResult {
  requestId: string;
  type: string;
  module: string;
  content: any[];
  tokens: number;
  cost: number;
  generatedAt: Date;
}

export class BatchProcessor {
  private queue: BatchRequest[] = [];
  private processing: boolean = false;
  private results: Map<string, BatchResult> = new Map();
  private weeklyContent: Map<string, any> = new Map();

  constructor() {
    this.loadWeeklyContent();
    this.startBatchSchedule();
  }

  /**
   * Add request to batch queue
   */
  addToBatch(request: Omit<BatchRequest, 'id'>): string {
    const id = this.generateRequestId();
    const fullRequest: BatchRequest = { id, ...request };
    
    this.queue.push(fullRequest);
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process immediately if high priority
    if (request.priority === 'high' && !this.processing) {
      this.processBatch();
    }

    return id;
  }

  /**
   * Process batch queue
   */
  async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    try {
      // Group requests by type and module for efficiency
      const grouped = this.groupRequests(this.queue);

      for (const group of grouped) {
        const result = await this.processGroup(group);
        
        // Store results
        group.requests.forEach(req => {
          this.results.set(req.id, {
            requestId: req.id,
            type: req.type,
            module: req.module,
            content: result.content.slice(0, req.count),
            tokens: result.tokens,
            cost: result.cost,
            generatedAt: new Date()
          });
        });

        // Remove processed requests from queue
        this.queue = this.queue.filter(
          req => !group.requests.find(r => r.id === req.id)
        );
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get batch result
   */
  getResult(requestId: string): BatchResult | null {
    return this.results.get(requestId) || null;
  }

  /**
   * Generate week's content in advance
   */
  async generateWeeklyContent(studentId: string, modules: string[]): Promise<{
    missions: Map<string, any[]>;
    activities: Map<string, Activity[]>;
    quizzes: Map<string, any[]>;
    totalTokens: number;
    estimatedCost: number;
  }> {
    const missions = new Map<string, any[]>();
    const activities = new Map<string, Activity[]>();
    const quizzes = new Map<string, any[]>();
    let totalTokens = 0;

    for (const module of modules) {
      // Generate week's missions (7 days)
      const missionPrompt = this.createWeeklyMissionPrompt(module);
      const missionResult = await this.callClaudeAPI(missionPrompt);
      missions.set(module, missionResult.content);
      totalTokens += missionResult.tokens;

      // Generate activities (14 total - 2 per day)
      const activityPrompt = this.createWeeklyActivityPrompt(module);
      const activityResult = await this.callClaudeAPI(activityPrompt);
      activities.set(module, activityResult.content);
      totalTokens += activityResult.tokens;

      // Generate quizzes (7 total - 1 per day)
      const quizPrompt = this.createWeeklyQuizPrompt(module);
      const quizResult = await this.callClaudeAPI(quizPrompt);
      quizzes.set(module, quizResult.content);
      totalTokens += quizResult.tokens;
    }

    // Cache weekly content
    this.weeklyContent.set('missions', missions);
    this.weeklyContent.set('activities', activities);
    this.weeklyContent.set('quizzes', quizzes);
    this.saveWeeklyContent();

    // Estimate cost (using Haiku pricing for batch)
    const estimatedCost = (totalTokens / 1000000) * 0.25; // Input tokens

    return {
      missions,
      activities,
      quizzes,
      totalTokens,
      estimatedCost
    };
  }

  /**
   * Create weekly mission prompt
   */
  private createWeeklyMissionPrompt(module: string): string {
    return `Generate 7 daily missions for ${module} module (Grade 4, age 9, Victoria BC).
    
Format each as JSON:
{
  "day": 1-7,
  "title": "Mission title",
  "description": "What to do",
  "objectives": ["objective 1", "objective 2"],
  "xpReward": 50-100,
  "difficulty": "easy|medium|hard",
  "estimatedTime": 15-30,
  "materials": ["optional materials"],
  "parentNote": "Optional note for parents"
}

Make them progressively challenging through the week.
Monday: Introduction/review
Tuesday-Thursday: Build skills
Friday: Challenge
Weekend: Fun projects

Theme ideas:
- Science: Local wildlife, weather, experiments
- Math: Real-world problems, games, puzzles  
- Stories: Creative writing, reading adventures
- World: Explore Victoria, BC geography, cultures
- Entrepreneur: Kid business ideas, problem-solving

Return as JSON array of 7 missions.`;
  }

  /**
   * Create weekly activity prompt
   */
  private createWeeklyActivityPrompt(module: string): string {
    return `Generate 14 activities for ${module} module (Grade 4, age 9, Victoria BC).

Mix of types:
- 3 challenges (quick 5-minute tasks)
- 3 projects (20-30 minute creative work)
- 3 explorations (investigation/research)
- 3 quizzes (test knowledge)
- 2 games (educational fun)

Format each as JSON:
{
  "id": "unique_id",
  "type": "challenge|project|exploration|quiz|game",
  "title": "Activity title",
  "description": "Brief description",
  "instructions": ["step 1", "step 2", ...],
  "module": "${module}",
  "difficulty": "easy|medium|hard",
  "estimatedTime": 5-30,
  "xpReward": 10-50,
  "materials": ["optional"],
  "hints": ["hint 1", "hint 2"],
  "successCriteria": "How to know they succeeded"
}

Make them fun, engaging, and educational!
Return as JSON array of 14 activities.`;
  }

  /**
   * Create weekly quiz prompt
   */
  private createWeeklyQuizPrompt(module: string): string {
    return `Generate 7 quizzes for ${module} module (Grade 4, age 9).

Each quiz should have 5 questions of varying difficulty.

Format as JSON:
{
  "day": 1-7,
  "title": "Quiz title",
  "theme": "Topic focus",
  "questions": [
    {
      "question": "Question text",
      "type": "multiple_choice|true_false|short_answer",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Why this is correct",
      "xpReward": 5-10,
      "hint": "Optional hint"
    }
  ],
  "totalXP": 25-50,
  "timeLimit": 10,
  "encouragement": "Message after completion"
}

Topics should align with Grade 4 curriculum.
Make questions progressively harder within each quiz.
Return as JSON array of 7 quizzes.`;
  }

  /**
   * Group requests for efficient processing
   */
  private groupRequests(requests: BatchRequest[]): Array<{
    type: string;
    module: string;
    requests: BatchRequest[];
    totalCount: number;
  }> {
    const groups = new Map<string, BatchRequest[]>();

    requests.forEach(req => {
      const key = `${req.type}_${req.module}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(req);
    });

    return Array.from(groups.entries()).map(([key, reqs]) => {
      const [type, module] = key.split('_');
      return {
        type,
        module,
        requests: reqs,
        totalCount: reqs.reduce((sum, r) => sum + r.count, 0)
      };
    });
  }

  /**
   * Process a group of similar requests
   */
  private async processGroup(group: {
    type: string;
    module: string;
    requests: BatchRequest[];
    totalCount: number;
  }): Promise<{
    content: any[];
    tokens: number;
    cost: number;
  }> {
    // Create combined prompt
    const prompt = this.createCombinedPrompt(group);

    // Call Claude API (simulated)
    const result = await this.callClaudeAPI(prompt);

    return result;
  }

  /**
   * Create combined prompt for group
   */
  private createCombinedPrompt(group: any): string {
    const { type, module, totalCount } = group;

    let prompt = `Generate ${totalCount} ${type} for ${module} module.\n`;
    prompt += `Target: Grade 4 student (age 9) in Victoria, BC.\n`;
    prompt += `Make them fun, educational, and age-appropriate.\n`;

    switch (type) {
      case 'missions':
        prompt += `Each mission should be a daily learning goal with clear objectives.\n`;
        break;
      case 'quizzes':
        prompt += `Each quiz should test understanding with 5 varied questions.\n`;
        break;
      case 'activities':
        prompt += `Mix of challenges, projects, and games. Include instructions.\n`;
        break;
      case 'summaries':
        prompt += `Summarize learning progress and achievements.\n`;
        break;
      case 'feedback':
        prompt += `Provide encouraging, constructive feedback.\n`;
        break;
    }

    prompt += `Format as JSON array. Be creative and engaging!`;

    return prompt;
  }

  /**
   * Simulate Claude API call
   */
  private async callClaudeAPI(prompt: string): Promise<{
    content: any[];
    tokens: number;
    cost: number;
  }> {
    // This would actually call Claude API
    // For now, return mock data
    const tokens = prompt.length / 4; // Rough estimate
    const cost = (tokens / 1000000) * 0.25; // Haiku pricing

    return {
      content: [],
      tokens,
      cost
    };
  }

  /**
   * Pre-generate content for common scenarios
   */
  async pregenerateCommonContent(): Promise<void> {
    const commonScenarios = [
      { type: 'feedback', variants: ['correct', 'incorrect', 'partial', 'effort'] },
      { type: 'hints', variants: ['math', 'science', 'writing', 'general'] },
      { type: 'encouragement', variants: ['struggling', 'improving', 'excelling'] },
      { type: 'explanations', variants: ['math_concepts', 'science_facts', 'grammar'] }
    ];

    for (const scenario of commonScenarios) {
      for (const variant of scenario.variants) {
        const prompt = this.createScenarioPrompt(scenario.type, variant);
        const result = await this.callClaudeAPI(prompt);
        
        // Cache the results
        const key = `${scenario.type}_${variant}`;
        this.results.set(key, {
          requestId: key,
          type: scenario.type,
          module: 'general',
          content: result.content,
          tokens: result.tokens,
          cost: result.cost,
          generatedAt: new Date()
        });
      }
    }
  }

  /**
   * Create scenario-specific prompt
   */
  private createScenarioPrompt(type: string, variant: string): string {
    const prompts: Record<string, string> = {
      'feedback_correct': 'Generate 20 encouraging messages for correct answers (age 9)',
      'feedback_incorrect': 'Generate 20 supportive messages for incorrect answers (age 9)',
      'feedback_partial': 'Generate 20 messages for partially correct answers (age 9)',
      'feedback_effort': 'Generate 20 messages praising effort regardless of result (age 9)',
      'hints_math': 'Generate 30 helpful math hints for Grade 4 problems',
      'hints_science': 'Generate 30 science exploration hints for Grade 4',
      'hints_writing': 'Generate 30 creative writing prompts and tips for age 9',
      'hints_general': 'Generate 30 general learning hints for Grade 4 student',
      'encouragement_struggling': 'Generate 25 messages for student having difficulty',
      'encouragement_improving': 'Generate 25 messages for student showing improvement',
      'encouragement_excelling': 'Generate 25 messages for student doing excellent work',
      'explanations_math_concepts': 'Generate simple explanations for 20 Grade 4 math concepts',
      'explanations_science_facts': 'Generate fun explanations for 20 Grade 4 science topics',
      'explanations_grammar': 'Generate simple explanations for 20 Grade 4 grammar rules'
    };

    return prompts[`${type}_${variant}`] || 'Generate educational content for Grade 4 student';
  }

  /**
   * Utilities
   */
  private generateRequestId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveWeeklyContent(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        content: Array.from(this.weeklyContent.entries()),
        generatedAt: new Date().toISOString()
      };
      localStorage.setItem('weekly_content_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save weekly content:', error);
    }
  }

  private loadWeeklyContent(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('weekly_content_cache');
      if (stored) {
        const data = JSON.parse(stored);
        const generatedAt = new Date(data.generatedAt);
        
        // Use cache if less than 7 days old
        if (Date.now() - generatedAt.getTime() < 7 * 24 * 60 * 60 * 1000) {
          data.content.forEach(([key, value]: [string, any]) => {
            this.weeklyContent.set(key, value);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load weekly content:', error);
    }
  }

  private startBatchSchedule(): void {
    // Process batch queue every 5 minutes
    setInterval(() => {
      if (this.queue.length > 0 && !this.processing) {
        this.processBatch();
      }
    }, 5 * 60 * 1000);

    // Generate weekly content every Sunday at midnight
    if (typeof window !== 'undefined') {
      const now = new Date();
      const sunday = new Date(now);
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
      sunday.setHours(0, 0, 0, 0);

      const timeUntilSunday = sunday.getTime() - now.getTime();
      setTimeout(() => {
        this.generateWeeklyContent('default', ['science', 'math', 'stories', 'world', 'entrepreneur']);
        
        // Then repeat weekly
        setInterval(() => {
          this.generateWeeklyContent('default', ['science', 'math', 'stories', 'world', 'entrepreneur']);
        }, 7 * 24 * 60 * 60 * 1000);
      }, timeUntilSunday);
    }
  }

  /**
   * Get cached weekly content
   */
  getWeeklyContent(type: string, module: string): any[] | null {
    const content = this.weeklyContent.get(type);
    if (content && content.has(module)) {
      return content.get(module);
    }
    return null;
  }
}

// Singleton instance
export const batchProcessor = new BatchProcessor();