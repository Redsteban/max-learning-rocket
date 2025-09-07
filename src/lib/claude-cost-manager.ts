/**
 * Claude API Cost Optimization Manager
 * Smart cost management while maintaining quality tutoring
 */

import { encode } from 'gpt-tokenizer';

// Cost configuration (prices in USD per 1M tokens)
const PRICING = {
  'claude-3-opus': {
    input: 15.00,  // $15 per 1M input tokens
    output: 75.00  // $75 per 1M output tokens
  },
  'claude-3-sonnet': {
    input: 3.00,   // $3 per 1M input tokens
    output: 15.00  // $15 per 1M output tokens
  },
  'claude-3-haiku': {
    input: 0.25,   // $0.25 per 1M input tokens
    output: 1.25   // $1.25 per 1M output tokens
  }
};

// Usage limits and thresholds
interface CostLimits {
  daily_token_limit: number;
  weekly_token_limit: number;
  monthly_token_limit: number;
  cost_alert_threshold: number; // in dollars
  fallback_mode_threshold: number; // percentage
  cache_hit_target: number; // percentage
  average_response_tokens: number;
  max_context_tokens: number;
}

// Token usage tracking
interface TokenUsage {
  sessionId: string;
  timestamp: Date;
  inputTokens: number;
  outputTokens: number;
  model: string;
  module: string;
  cached: boolean;
  cost: number;
}

// Conversation compression
interface CompressedMessage {
  role: string;
  content: string;
  timestamp: Date;
  tokens: number;
  importance: 'high' | 'medium' | 'low';
}

export class ClaudeCostManager {
  private tokenUsage: TokenUsage[] = [];
  private responseCache: Map<string, CachedResponse> = new Map();
  private dailyUsage: Map<string, number> = new Map();
  private limits: CostLimits;
  private currentModel: keyof typeof PRICING = 'claude-3-haiku';

  constructor() {
    this.limits = {
      daily_token_limit: 100000,
      weekly_token_limit: 500000,
      monthly_token_limit: 2000000,
      cost_alert_threshold: 2.00, // $2 per day
      fallback_mode_threshold: 0.8, // 80%
      cache_hit_target: 0.3, // 30%
      average_response_tokens: 500,
      max_context_tokens: 50000
    };

    this.loadUsageHistory();
    this.startCleanupSchedule();
  }

  /**
   * Optimize prompt before sending to Claude
   */
  optimizePrompt(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    module: string
  ): {
    optimizedMessages: Array<{ role: string; content: string }>;
    optimizedSystemPrompt: string;
    estimatedTokens: number;
    compressionRatio: number;
  } {
    // Count original tokens
    const originalTokens = this.countTokens(
      systemPrompt + messages.map(m => m.content).join(' ')
    );

    // Compress conversation history
    const compressedMessages = this.compressConversationHistory(messages);

    // Optimize system prompt
    const optimizedSystemPrompt = this.optimizeSystemPrompt(systemPrompt, module);

    // Remove redundant information
    const deduplicatedMessages = this.deduplicateMessages(compressedMessages);

    // Final token count
    const optimizedTokens = this.countTokens(
      optimizedSystemPrompt + deduplicatedMessages.map(m => m.content).join(' ')
    );

    return {
      optimizedMessages: deduplicatedMessages,
      optimizedSystemPrompt,
      estimatedTokens: optimizedTokens,
      compressionRatio: originalTokens / optimizedTokens
    };
  }

  /**
   * Compress conversation history intelligently
   */
  private compressConversationHistory(
    messages: Array<{ role: string; content: string }>
  ): Array<{ role: string; content: string }> {
    if (messages.length <= 10) {
      return messages; // Keep recent messages intact
    }

    const compressed: Array<{ role: string; content: string }> = [];
    
    // Keep first message (usually important context)
    if (messages.length > 0) {
      compressed.push(messages[0]);
    }

    // Summarize middle messages
    const middleMessages = messages.slice(1, -10);
    if (middleMessages.length > 0) {
      const summary = this.summarizeMessages(middleMessages);
      compressed.push({
        role: 'system',
        content: `[Previous conversation summary: ${summary}]`
      });
    }

    // Keep last 10 messages in full
    compressed.push(...messages.slice(-10));

    return compressed;
  }

  /**
   * Summarize multiple messages into concise context
   */
  private summarizeMessages(messages: Array<{ role: string; content: string }>): string {
    const topics = new Set<string>();
    const keyPoints: string[] = [];

    messages.forEach(msg => {
      // Extract key topics (simplified - would use NLP in production)
      if (msg.content.includes('math')) topics.add('math problems');
      if (msg.content.includes('science')) topics.add('science questions');
      if (msg.content.includes('story')) topics.add('creative writing');
      if (msg.content.includes('help')) keyPoints.push('needed help');
      if (msg.content.includes('understand')) keyPoints.push('working on understanding');
    });

    const topicList = Array.from(topics).join(', ');
    const summary = `Discussed: ${topicList || 'various topics'}. ${keyPoints.join('. ')}`;
    
    return summary;
  }

  /**
   * Optimize system prompt for efficiency
   */
  private optimizeSystemPrompt(prompt: string, module: string): string {
    // Use module-specific compact prompts
    const compactPrompts: Record<string, string> = {
      science: "Grade 4 science tutor for Max (9yo, Victoria BC). Be encouraging, use simple language, local examples.",
      math: "Grade 4 math tutor for Max (9yo). Make it fun, visual, step-by-step. Celebrate progress.",
      stories: "Creative writing guide for Max (9yo). Encourage imagination, help with structure, age-appropriate.",
      world: "Geography/culture teacher for Max (9yo, Victoria BC). Use local connections, make it engaging.",
      entrepreneur: "Young entrepreneur coach for Max (9yo). Simple business concepts, creativity, problem-solving."
    };

    // Use compact version if available
    if (compactPrompts[module]) {
      return compactPrompts[module] + "\nRespond concisely but warmly. Max likes: science, Pokemon, Minecraft.";
    }

    // Otherwise, compress the original prompt
    return prompt
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .replace(/\n+/g, ' ') // Remove unnecessary newlines
      .trim();
  }

  /**
   * Remove duplicate or redundant information
   */
  private deduplicateMessages(
    messages: Array<{ role: string; content: string }>
  ): Array<{ role: string; content: string }> {
    const seen = new Set<string>();
    const deduplicated: Array<{ role: string; content: string }> = [];

    messages.forEach(msg => {
      // Create a simplified hash of the message
      const hash = this.simpleHash(msg.content.toLowerCase().trim());
      
      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicated.push(msg);
      }
    });

    return deduplicated;
  }

  /**
   * Check cache for response
   */
  getCachedResponse(
    prompt: string,
    module: string
  ): CachedResponse | null {
    const cacheKey = this.generateCacheKey(prompt, module);
    const cached = this.responseCache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      // Update cache hit statistics
      this.recordCacheHit();
      return cached;
    }

    return null;
  }

  /**
   * Cache a response
   */
  cacheResponse(
    prompt: string,
    module: string,
    response: string,
    metadata?: any
  ): void {
    const cacheKey = this.generateCacheKey(prompt, module);
    
    this.responseCache.set(cacheKey, {
      response,
      timestamp: new Date(),
      module,
      metadata,
      hitCount: 0
    });

    // Limit cache size
    if (this.responseCache.size > 1000) {
      this.pruneCache();
    }
  }

  /**
   * Track token usage and cost
   */
  trackUsage(
    sessionId: string,
    inputTokens: number,
    outputTokens: number,
    model: keyof typeof PRICING,
    module: string,
    cached: boolean = false
  ): {
    cost: number;
    dailyUsagePercent: number;
    shouldFallback: boolean;
    costAlert: boolean;
  } {
    // Calculate cost
    const inputCost = (inputTokens / 1000000) * PRICING[model].input;
    const outputCost = (outputTokens / 1000000) * PRICING[model].output;
    const totalCost = cached ? 0 : (inputCost + outputCost);

    // Record usage
    const usage: TokenUsage = {
      sessionId,
      timestamp: new Date(),
      inputTokens: cached ? 0 : inputTokens,
      outputTokens: cached ? 0 : outputTokens,
      model,
      module,
      cached,
      cost: totalCost
    };

    this.tokenUsage.push(usage);

    // Update daily usage
    const today = new Date().toDateString();
    const dailyTotal = (this.dailyUsage.get(today) || 0) + inputTokens + outputTokens;
    this.dailyUsage.set(today, dailyTotal);

    // Calculate thresholds
    const dailyUsagePercent = dailyTotal / this.limits.daily_token_limit;
    const dailyCost = this.getDailyCost();

    return {
      cost: totalCost,
      dailyUsagePercent,
      shouldFallback: dailyUsagePercent >= this.limits.fallback_mode_threshold,
      costAlert: dailyCost >= this.limits.cost_alert_threshold
    };
  }

  /**
   * Get usage analytics
   */
  getUsageAnalytics(): {
    today: {
      tokens: number;
      cost: number;
      sessions: number;
      cacheHitRate: number;
    };
    week: {
      tokens: number;
      cost: number;
      averageDaily: number;
    };
    month: {
      tokens: number;
      cost: number;
      projection: number;
    };
    byModule: Record<string, {
      tokens: number;
      cost: number;
      sessions: number;
    }>;
  } {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today's stats
    const todayUsage = this.tokenUsage.filter(
      u => u.timestamp.toDateString() === today
    );
    const todayTokens = todayUsage.reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0);
    const todayCost = todayUsage.reduce((sum, u) => sum + u.cost, 0);
    const todayCacheHits = todayUsage.filter(u => u.cached).length;
    const todayCacheRate = todayUsage.length > 0 ? todayCacheHits / todayUsage.length : 0;

    // Week stats
    const weekUsage = this.tokenUsage.filter(u => u.timestamp >= weekAgo);
    const weekTokens = weekUsage.reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0);
    const weekCost = weekUsage.reduce((sum, u) => sum + u.cost, 0);

    // Month stats
    const monthUsage = this.tokenUsage.filter(u => u.timestamp >= monthAgo);
    const monthTokens = monthUsage.reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0);
    const monthCost = monthUsage.reduce((sum, u) => sum + u.cost, 0);
    const daysInMonth = 30;
    const daysElapsed = Math.ceil((now.getTime() - monthAgo.getTime()) / (24 * 60 * 60 * 1000));
    const monthProjection = (monthCost / daysElapsed) * daysInMonth;

    // By module
    const byModule: Record<string, any> = {};
    this.tokenUsage.forEach(u => {
      if (!byModule[u.module]) {
        byModule[u.module] = { tokens: 0, cost: 0, sessions: new Set() };
      }
      byModule[u.module].tokens += u.inputTokens + u.outputTokens;
      byModule[u.module].cost += u.cost;
      byModule[u.module].sessions.add(u.sessionId);
    });

    // Convert session Sets to counts
    Object.keys(byModule).forEach(module => {
      byModule[module].sessions = byModule[module].sessions.size;
    });

    return {
      today: {
        tokens: todayTokens,
        cost: todayCost,
        sessions: new Set(todayUsage.map(u => u.sessionId)).size,
        cacheHitRate: todayCacheRate
      },
      week: {
        tokens: weekTokens,
        cost: weekCost,
        averageDaily: weekCost / 7
      },
      month: {
        tokens: monthTokens,
        cost: monthCost,
        projection: monthProjection
      },
      byModule
    };
  }

  /**
   * Switch to economy mode when approaching limits
   */
  selectOptimalModel(priority: 'quality' | 'economy' | 'balanced'): keyof typeof PRICING {
    const dailyUsage = this.getDailyUsage();
    const usagePercent = dailyUsage / this.limits.daily_token_limit;

    if (priority === 'quality' && usagePercent < 0.5) {
      return 'claude-3-opus';
    } else if (priority === 'economy' || usagePercent > 0.8) {
      return 'claude-3-haiku';
    } else {
      return 'claude-3-sonnet';
    }
  }

  /**
   * Batch generate content for efficiency
   */
  async batchGenerate(requests: Array<{
    type: 'mission' | 'quiz' | 'activity' | 'summary';
    module: string;
    count: number;
  }>): Promise<Map<string, any[]>> {
    const results = new Map<string, any[]>();

    // Combine similar requests into single prompts
    const batchedPrompts = this.createBatchPrompts(requests);

    // Process each batch
    for (const [key, prompt] of batchedPrompts) {
      // This would call Claude API with batched prompt
      // For now, return placeholder
      results.set(key, []);
    }

    return results;
  }

  /**
   * Create efficient batch prompts
   */
  private createBatchPrompts(
    requests: Array<any>
  ): Map<string, string> {
    const prompts = new Map<string, string>();

    // Group by type and module
    const grouped = requests.reduce((acc, req) => {
      const key = `${req.type}_${req.module}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(req);
      return acc;
    }, {} as Record<string, any[]>);

    // Create combined prompts
    Object.entries(grouped).forEach(([key, reqs]) => {
      const totalCount = reqs.reduce((sum, r) => sum + r.count, 0);
      const [type, module] = key.split('_');
      
      let prompt = `Generate ${totalCount} ${type}s for ${module} module (Grade 4, age 9):\n`;
      prompt += `Format as JSON array. Make them fun and educational.\n`;
      
      prompts.set(key, prompt);
    });

    return prompts;
  }

  /**
   * Utility functions
   */
  private countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch {
      // Fallback estimation: ~4 characters per token
      return Math.ceil(text.length / 4);
    }
  }

  private generateCacheKey(prompt: string, module: string): string {
    return `${module}_${this.simpleHash(prompt)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private isCacheValid(cached: CachedResponse): boolean {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return cached.timestamp > hourAgo;
  }

  private recordCacheHit(): void {
    // Update cache hit statistics
    const today = new Date().toDateString();
    // Implementation would track cache hits
  }

  private pruneCache(): void {
    // Remove least recently used entries
    const entries = Array.from(this.responseCache.entries());
    entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
    
    // Keep most recent 500 entries
    const toKeep = entries.slice(-500);
    this.responseCache.clear();
    toKeep.forEach(([key, value]) => this.responseCache.set(key, value));
  }

  private getDailyUsage(): number {
    const today = new Date().toDateString();
    return this.dailyUsage.get(today) || 0;
  }

  private getDailyCost(): number {
    const today = new Date().toDateString();
    return this.tokenUsage
      .filter(u => u.timestamp.toDateString() === today)
      .reduce((sum, u) => sum + u.cost, 0);
  }

  private loadUsageHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('claude_usage_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.tokenUsage = data.map((u: any) => ({
          ...u,
          timestamp: new Date(u.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load usage history:', error);
    }
  }

  private saveUsageHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentUsage = this.tokenUsage.filter(u => u.timestamp > thirtyDaysAgo);
      
      localStorage.setItem('claude_usage_history', JSON.stringify(recentUsage));
    } catch (error) {
      console.error('Failed to save usage history:', error);
    }
  }

  private startCleanupSchedule(): void {
    // Save usage history every 5 minutes
    setInterval(() => {
      this.saveUsageHistory();
    }, 5 * 60 * 1000);

    // Clean up old data daily
    setInterval(() => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      this.tokenUsage = this.tokenUsage.filter(u => u.timestamp > thirtyDaysAgo);
    }, 24 * 60 * 60 * 1000);
  }
}

// Response cache interface
interface CachedResponse {
  response: string;
  timestamp: Date;
  module: string;
  metadata?: any;
  hitCount: number;
}

// Singleton instance
export const costManager = new ClaudeCostManager();