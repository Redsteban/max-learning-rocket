/**
 * Smart Response Caching System
 * Caches common Claude responses to reduce API costs
 */

interface CacheEntry {
  key: string;
  response: string;
  module: string;
  timestamp: Date;
  hitCount: number;
  tokens: number;
  metadata: {
    questionType: string;
    difficulty: string;
    tags: string[];
  };
}

interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  tokensSaved: number;
  costSaved: number;
}

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private commonQuestions: Map<string, string> = new Map();
  private explanationTemplates: Map<string, string> = new Map();
  private encouragementPhrases: string[] = [];
  private stats: CacheStats;
  private maxCacheSize: number = 2000;
  private cacheExpiry: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      tokensSaved: 0,
      costSaved: 0
    };

    this.initializeCommonResponses();
    this.loadCacheFromStorage();
    this.startMaintenanceSchedule();
  }

  /**
   * Initialize common questions and responses
   */
  private initializeCommonResponses(): void {
    // Common math questions
    this.commonQuestions.set(
      'what_is_multiplication',
      `Multiplication is like super-fast adding! 🚀

When you multiply, you're adding the same number multiple times. For example:
• 3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12
• It's like having 3 groups of 4 things!

Think of it like this: If you have 3 bags with 4 candies each, you have 3 × 4 = 12 candies total! 🍬

Want to try a multiplication problem together?`
    );

    this.commonQuestions.set(
      'how_photosynthesis_works',
      `Photosynthesis is how plants make their own food! 🌱

Here's the amazing process:
1. **Sunlight** ☀️ - Plants catch sunlight with their green leaves
2. **Water** 💧 - Roots drink water from the soil
3. **Carbon Dioxide** 💨 - Leaves breathe in CO2 from the air
4. **Magic Time!** ✨ - The plant combines these to make sugar (food) and oxygen!

Fun fact: The oxygen we breathe comes from plants! They're like Earth's air cleaners! 🌍

Want to do a photosynthesis experiment?`
    );

    // Common encouragement phrases
    this.encouragementPhrases = [
      "You're doing amazing! 🌟",
      "Great thinking! 🧠",
      "I love how you're trying! 💪",
      "You're getting so good at this! 🚀",
      "Wow, you're learning fast! ⚡",
      "Keep up the awesome work! 🎉",
      "You're a natural problem solver! 🦸",
      "That's the spirit! 🌈",
      "You're on fire today! 🔥",
      "I'm so proud of your effort! 🏆"
    ];

    // Explanation templates by topic
    this.explanationTemplates.set('math_steps', `Let me break this down step by step:
Step 1: [STEP_1]
Step 2: [STEP_2]
Step 3: [STEP_3]
Answer: [ANSWER]

Does each step make sense? 🤔`);

    this.explanationTemplates.set('science_concept', `Here's how [CONCEPT] works:

What it is: [DEFINITION]
Why it matters: [IMPORTANCE]
Real-world example: [EXAMPLE]

Cool fact: [FUN_FACT] 🌟

Want to explore more about this?`);

    this.explanationTemplates.set('story_feedback', `I love your story! Here's what makes it special:

✨ Great parts:
• [STRENGTH_1]
• [STRENGTH_2]

💡 Ideas to make it even better:
• [SUGGESTION_1]
• [SUGGESTION_2]

Keep writing - you have amazing imagination! 📚`);
  }

  /**
   * Check if response is cached
   */
  get(prompt: string, module: string): CacheEntry | null {
    const key = this.generateKey(prompt, module);
    const entry = this.cache.get(key);

    if (entry && this.isValid(entry)) {
      // Update statistics
      entry.hitCount++;
      this.stats.totalHits++;
      this.stats.tokensSaved += entry.tokens;
      this.updateHitRate();
      
      return entry;
    }

    // Check for similar questions
    const similar = this.findSimilarQuestion(prompt, module);
    if (similar) {
      this.stats.totalHits++;
      return similar;
    }

    this.stats.totalMisses++;
    this.updateHitRate();
    return null;
  }

  /**
   * Cache a response
   */
  set(
    prompt: string,
    response: string,
    module: string,
    tokens: number,
    metadata?: any
  ): void {
    const key = this.generateKey(prompt, module);

    const entry: CacheEntry = {
      key,
      response,
      module,
      timestamp: new Date(),
      hitCount: 0,
      tokens,
      metadata: metadata || {
        questionType: this.classifyQuestion(prompt),
        difficulty: 'medium',
        tags: this.extractTags(prompt)
      }
    };

    this.cache.set(key, entry);

    // Manage cache size
    if (this.cache.size > this.maxCacheSize) {
      this.evictLRU();
    }

    // Persist to storage
    this.saveToStorage();
  }

  /**
   * Get a random encouragement phrase
   */
  getEncouragement(): string {
    return this.encouragementPhrases[
      Math.floor(Math.random() * this.encouragementPhrases.length)
    ];
  }

  /**
   * Get template for response type
   */
  getTemplate(type: string): string | null {
    return this.explanationTemplates.get(type) || null;
  }

  /**
   * Find similar cached question
   */
  private findSimilarQuestion(prompt: string, module: string): CacheEntry | null {
    const normalized = this.normalizePrompt(prompt);
    
    // Check common questions first
    for (const [key, response] of this.commonQuestions) {
      if (normalized.includes(key.replace(/_/g, ' '))) {
        return {
          key,
          response,
          module,
          timestamp: new Date(),
          hitCount: 1,
          tokens: Math.ceil(response.length / 4),
          metadata: {
            questionType: 'common',
            difficulty: 'easy',
            tags: [module]
          }
        };
      }
    }

    // Check for similar cached questions
    for (const entry of this.cache.values()) {
      if (entry.module === module && this.calculateSimilarity(normalized, entry.key) > 0.8) {
        return entry;
      }
    }

    return null;
  }

  /**
   * Calculate similarity between two prompts
   */
  private calculateSimilarity(prompt1: string, prompt2: string): number {
    const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
    const words2 = new Set(prompt2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Normalize prompt for comparison
   */
  private normalizePrompt(prompt: string): string {
    return prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }

  /**
   * Classify question type
   */
  private classifyQuestion(prompt: string): string {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('how') || lower.includes('why')) return 'explanation';
    if (lower.includes('what is') || lower.includes('define')) return 'definition';
    if (lower.includes('calculate') || lower.includes('solve')) return 'calculation';
    if (lower.includes('help') || lower.includes('stuck')) return 'assistance';
    if (lower.includes('example')) return 'example';
    
    return 'general';
  }

  /**
   * Extract tags from prompt
   */
  private extractTags(prompt: string): string[] {
    const tags: string[] = [];
    const lower = prompt.toLowerCase();
    
    // Subject tags
    if (lower.includes('math')) tags.push('math');
    if (lower.includes('science')) tags.push('science');
    if (lower.includes('story') || lower.includes('write')) tags.push('writing');
    if (lower.includes('geography') || lower.includes('world')) tags.push('geography');
    
    // Concept tags
    if (lower.includes('addition') || lower.includes('add')) tags.push('addition');
    if (lower.includes('multiplication') || lower.includes('multiply')) tags.push('multiplication');
    if (lower.includes('division') || lower.includes('divide')) tags.push('division');
    if (lower.includes('fraction')) tags.push('fractions');
    
    return tags;
  }

  /**
   * Generate cache key
   */
  private generateKey(prompt: string, module: string): string {
    const normalized = this.normalizePrompt(prompt);
    return `${module}:${this.hash(normalized)}`;
  }

  /**
   * Simple hash function
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cache entry is valid
   */
  private isValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp.getTime();
    return age < this.cacheExpiry;
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.values());
    entries.sort((a, b) => {
      const scoreA = a.hitCount * (Date.now() - a.timestamp.getTime());
      const scoreB = b.hitCount * (Date.now() - b.timestamp.getTime());
      return scoreA - scoreB;
    });

    // Remove bottom 20%
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i].key);
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0;
    
    // Estimate cost saved (assuming $0.01 per 1000 tokens)
    this.stats.costSaved = (this.stats.tokensSaved / 1000) * 0.01;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & {
    cacheSize: number;
    topQuestions: Array<{ question: string; hits: number }>;
  } {
    const topQuestions = Array.from(this.cache.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10)
      .map(entry => ({
        question: entry.key,
        hits: entry.hitCount
      }));

    return {
      ...this.stats,
      cacheSize: this.cache.size,
      topQuestions
    };
  }

  /**
   * Preload common responses for module
   */
  preloadModule(module: string): void {
    // Module-specific common questions
    const moduleQuestions: Record<string, string[]> = {
      math: [
        'how to multiply',
        'what is division',
        'help with fractions',
        'explain place value'
      ],
      science: [
        'how plants grow',
        'what is gravity',
        'why is sky blue',
        'how weather works'
      ],
      stories: [
        'story starter ideas',
        'character creation help',
        'plot development',
        'descriptive words'
      ]
    };

    // Would fetch and cache common responses for these questions
    const questions = moduleQuestions[module] || [];
    console.log(`Preloading ${questions.length} common questions for ${module}`);
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        entry: {
          ...entry,
          timestamp: entry.timestamp.toISOString()
        }
      }));

      localStorage.setItem('claude_response_cache', JSON.stringify(cacheData));
      localStorage.setItem('claude_cache_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = localStorage.getItem('claude_response_cache');
      const statsData = localStorage.getItem('claude_cache_stats');

      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        parsed.forEach((item: any) => {
          this.cache.set(item.key, {
            ...item.entry,
            timestamp: new Date(item.entry.timestamp)
          });
        });
      }

      if (statsData) {
        this.stats = JSON.parse(statsData);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  /**
   * Start maintenance schedule
   */
  private startMaintenanceSchedule(): void {
    // Clean expired entries every hour
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 60 * 60 * 1000);

    // Save to storage every 5 minutes
    setInterval(() => {
      this.saveToStorage();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const responseCache = new ResponseCache();