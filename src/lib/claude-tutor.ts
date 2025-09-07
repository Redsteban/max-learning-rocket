import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@anthropic-ai/sdk/resources';
import { MODULE_TUTORS, generateDynamicPrompt, calculateXP } from './tutor-prompts';
import { 
  getActivityGenerator, 
  parseActivityCommand, 
  generateActivityPrompt,
  Activity 
} from './claude-activities';

// Types and Interfaces
export interface TutorResponse {
  message: string;
  suggestedActivities?: string[];
  xpToAward: number;
  achievementTriggers?: string[];
  followUpQuestions?: string[];
  topicMastery?: {
    topic: string;
    level: number; // 0-100
    improvement: number;
  };
  safetyFlags?: string[];
  activity?: Activity; // New: structured activity if command detected
  activityMode?: boolean; // New: indicates if in activity mode
}

export interface TutorSession {
  sessionId: string;
  userId: string;
  module: string;
  messages: ConversationMessage[];
  startTime: Date;
  totalTokens: number;
  messageCount: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    xpAwarded?: number;
    achievementsUnlocked?: string[];
    topicsCovered?: string[];
  };
}

export interface TutorConfig {
  maxTokensPerResponse: number;
  maxDailyMessages: number;
  temperature: number;
  model: string;
  contextWindowSize: number;
}

// Configuration
const DEFAULT_CONFIG: TutorConfig = {
  maxTokensPerResponse: parseInt(process.env.MAX_TOKENS_PER_RESPONSE || '2000'),
  maxDailyMessages: parseInt(process.env.MAX_DAILY_MESSAGES || '100'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
  model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
  contextWindowSize: 100000, // 100k tokens
};

// Core system prompt for Max's tutor
const CORE_TUTOR_PROMPT = `You are Max's personal learning tutor. Max is 9 years old in Grade 4, living in Victoria BC. Your role:

PERSONALITY & APPROACH:
- Be encouraging, patient, and enthusiastic
- Use a warm, friendly tone with age-appropriate language
- Celebrate small victories with emojis (⭐ 🎉 🚀 🌟 💪)
- Make learning feel like an adventure or game
- Reference Max's local environment (ocean, mountains, forests, whales, sea lions)

TEACHING METHODS:
- Adapt ALL explanations to Grade 4 level (age 9)
- Break complex topics into simple, digestible steps
- Use concrete examples Max can relate to
- Incorporate hands-on activities and experiments
- Ask follow-up questions to ensure understanding
- Use the Socratic method - guide Max to discover answers
- Provide visual descriptions when helpful

SAFETY & APPROPRIATENESS:
- Keep all content age-appropriate for a 9-year-old
- Avoid any scary, violent, or mature themes
- Don't share external links or references to websites
- Focus on educational content only
- Encourage breaks and physical activity

ENGAGEMENT STRATEGIES:
- Suggest real-world activities Max can do at home
- Connect learning to Max's interests
- Use storytelling to explain concepts
- Create mini-challenges and puzzles
- Recognize effort, not just correct answers
- Track progress and celebrate improvements

VICTORIA BC CONTEXT:
- Reference local landmarks: Inner Harbour, Beacon Hill Park, Royal BC Museum
- Use local examples: orcas, salmon, Douglas fir trees, Pacific Ocean
- Consider local weather and seasons
- Mention BC ferries, float planes, and local wildlife

Remember: Your goal is to make Max excited about learning while ensuring he truly understands concepts at his grade level.`;

// Get module-specific prompts from the comprehensive tutor configuration
const getModulePrompt = (module: string, context?: any): string => {
  const tutorConfig = MODULE_TUTORS[module];
  if (!tutorConfig) {
    return generateDynamicPrompt('science', context); // Default to science
  }
  return generateDynamicPrompt(module, context);
};

class ClaudeTutor {
  private anthropic: Anthropic;
  private sessions: Map<string, TutorSession>;
  private config: TutorConfig;
  private dailyMessageCount: Map<string, number>;
  private lastResetDate: Date;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is required');
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.sessions = new Map();
    this.config = DEFAULT_CONFIG;
    this.dailyMessageCount = new Map();
    this.lastResetDate = new Date();
  }

  // Create or get a learning session
  async createSession(userId: string, module: string, context?: any): Promise<TutorSession> {
    const sessionId = `${userId}-${module}-${Date.now()}`;
    
    // Get the appropriate module-specific prompt
    const modulePrompt = getModulePrompt(module, context);
    
    const session: TutorSession = {
      sessionId,
      userId,
      module,
      messages: [
        {
          role: 'system',
          content: modulePrompt,
          timestamp: new Date(),
        }
      ],
      startTime: new Date(),
      totalTokens: 0,
      messageCount: 0,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get or create session
  getSession(sessionId: string): TutorSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Check and update rate limits
  private checkRateLimit(userId: string): boolean {
    // Reset daily counts if it's a new day
    const now = new Date();
    if (now.getDate() !== this.lastResetDate.getDate()) {
      this.dailyMessageCount.clear();
      this.lastResetDate = now;
    }

    const count = this.dailyMessageCount.get(userId) || 0;
    if (count >= this.config.maxDailyMessages) {
      return false;
    }

    this.dailyMessageCount.set(userId, count + 1);
    return true;
  }

  // Process a message from Max
  async processMessage(
    sessionId: string,
    userMessage: string,
    contextData?: {
      currentLevel?: number;
      recentAchievements?: string[];
      strugglingTopics?: string[];
      currentActivity?: Activity;
    }
  ): Promise<TutorResponse> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check rate limit
    if (!this.checkRateLimit(session.userId)) {
      return {
        message: "🌟 Wow Max, you've been learning so much today! Let's take a break and come back tomorrow for more adventures! Remember, even the best explorers need to rest! 🏕️",
        xpToAward: 0,
        safetyFlags: ['rate_limit_reached'],
      };
    }

    // Check if this is an activity command
    const { isCommand, command, args } = parseActivityCommand(userMessage);
    if (isCommand && command) {
      const activityGenerator = getActivityGenerator();
      const activity = activityGenerator.generateActivity(
        `!${command} ${args?.join(' ') || ''}`,
        session.module,
        session.userId,
        contextData?.currentLevel || 1
      );

      if (activity) {
        // Generate activity introduction
        const activityPrompt = generateActivityPrompt(activity);
        session.messages.push({
          role: 'system',
          content: activityPrompt,
          timestamp: new Date(),
        });

        return {
          message: `🎮 **${activity.title}**\n\n${activity.description}\n\n**Instructions:**\n${activity.instructions[0]}\n\n⏱️ Estimated time: ${activity.estimatedTime} minutes\n💎 XP Reward: ${activity.xpReward}\n\nReady? Let's start! What's your first move?`,
          xpToAward: 5, // Small XP for starting activity
          activity,
          activityMode: true,
          suggestedActivities: activity.materialsNeeded ? 
            [`Materials needed: ${activity.materialsNeeded.join(', ')}`] : undefined,
        };
      }
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Manage context window (keep last 20 messages)
    if (session.messages.length > 22) { // 1 system + 20 conversation + new message
      const systemMessage = session.messages[0];
      session.messages = [systemMessage, ...session.messages.slice(-20)];
    }

    try {
      // Add context if provided
      let enhancedPrompt = userMessage;
      if (contextData) {
        const contextInfo = [];
        if (contextData.currentLevel) {
          contextInfo.push(`Max is currently at level ${contextData.currentLevel}`);
        }
        if (contextData.recentAchievements?.length) {
          contextInfo.push(`Recent achievements: ${contextData.recentAchievements.join(', ')}`);
        }
        if (contextData.strugglingTopics?.length) {
          contextInfo.push(`Topics to reinforce: ${contextData.strugglingTopics.join(', ')}`);
        }
        
        if (contextInfo.length > 0) {
          enhancedPrompt = `[Context: ${contextInfo.join('. ')}]\n\n${userMessage}`;
        }
      }

      // Call Claude API
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokensPerResponse,
        temperature: this.config.temperature,
        messages: session.messages.map(msg => ({
          role: msg.role === 'system' ? 'assistant' : msg.role,
          content: msg.content,
        })) as any,
      });

      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      });

      // Update session stats
      session.messageCount++;
      session.totalTokens += response.usage?.input_tokens || 0;
      session.totalTokens += response.usage?.output_tokens || 0;

      // Analyze response for learning indicators
      const tutorResponse = this.analyzeResponse(assistantMessage, userMessage, session.module);
      
      return tutorResponse;

    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Friendly error message for Max
      return {
        message: "🤔 Hmm, my thinking cap got a bit tangled! Can you try asking me that again in a different way?",
        xpToAward: 0,
        safetyFlags: ['api_error'],
      };
    }
  }

  // Analyze Claude's response for learning indicators
  private analyzeResponse(response: string, userMessage: string, module: string): TutorResponse {
    // Determine action type based on interaction
    let action = 'askingQuestion';
    const bonusConditions: string[] = [];
    
    // Analyze user message for action type
    if (userMessage.toLowerCase().includes('why') || userMessage.toLowerCase().includes('how')) {
      action = 'askingQuestion';
      if (userMessage.length > 100) bonusConditions.push('creativeQuestion');
    } else if (response.includes('correct') || response.includes('excellent')) {
      action = 'solvingCorrectly';
    } else if (userMessage.includes('I think') || userMessage.includes('maybe')) {
      action = 'makingHypothesis';
    }
    
    // Calculate XP using module-specific rewards
    const xpToAward = calculateXP(module, action, bonusConditions);
    
    const tutorResponse: TutorResponse = {
      message: response,
      xpToAward,
    };

    // Check for suggested activities (look for keywords)
    const activityKeywords = ['try this', 'experiment', 'activity', 'challenge', 'let\'s do'];
    if (activityKeywords.some(keyword => response.toLowerCase().includes(keyword))) {
      tutorResponse.suggestedActivities = this.extractActivities(response);
    }

    // Check for follow-up questions
    if (response.includes('?')) {
      tutorResponse.followUpQuestions = this.extractQuestions(response);
    }

    // Check for achievement triggers
    tutorResponse.achievementTriggers = this.checkAchievementTriggers(userMessage, response, module);

    // Estimate topic mastery improvement
    if (response.includes('great job') || response.includes('excellent') || response.includes('correct')) {
      tutorResponse.topicMastery = {
        topic: module,
        level: 75,
        improvement: 10,
      };
    }

    return tutorResponse;
  }

  // Extract activities from response
  private extractActivities(response: string): string[] {
    const activities: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.match(/^[-•*]|^\d+\.|try|experiment|challenge/i)) {
        const cleaned = line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          activities.push(cleaned);
        }
      }
    }

    return activities.slice(0, 3); // Max 3 activities
  }

  // Extract questions from response
  private extractQuestions(response: string): string[] {
    const questions = response
      .split(/[.!]/)
      .filter(sentence => sentence.includes('?'))
      .map(q => q.trim() + '?')
      .filter(q => q.length > 10);

    return questions.slice(0, 3); // Max 3 questions
  }

  // Check for achievement triggers
  private checkAchievementTriggers(userMessage: string, response: string, module: string): string[] {
    const triggers: string[] = [];

    // First question in a module
    if (this.sessions.get(module)?.messageCount === 1) {
      triggers.push('first_question');
    }

    // Long thoughtful question
    if (userMessage.length > 100) {
      triggers.push('deep_thinker');
    }

    // Module-specific achievements
    const moduleAchievements: Record<string, string[]> = {
      science: ['junior_scientist', 'experiment_master'],
      math: ['calculation_wizard', 'problem_solver'],
      stories: ['creative_writer', 'storyteller'],
      world: ['geography_explorer', 'culture_ambassador'],
      entrepreneur: ['business_thinker', 'innovation_spark'],
    };

    // Random chance for module achievement (10%)
    if (Math.random() < 0.1 && moduleAchievements[module]) {
      triggers.push(moduleAchievements[module][0]);
    }

    return triggers;
  }

  // Get session statistics
  getSessionStats(sessionId: string): {
    duration: number;
    messageCount: number;
    totalTokens: number;
    topicsCovered: string[];
  } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Date.now() - session.startTime.getTime();
    const topicsCovered = Array.from(new Set(
      session.messages
        .filter(m => m.metadata?.topicsCovered)
        .flatMap(m => m.metadata?.topicsCovered || [])
    ));

    return {
      duration,
      messageCount: session.messageCount,
      totalTokens: session.totalTokens,
      topicsCovered,
    };
  }

  // Clear old sessions (call periodically)
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Export session for parent review
  exportSession(sessionId: string): TutorSession | null {
    return this.getSession(sessionId) || null;
  }
}

// Singleton instance
let tutorInstance: ClaudeTutor | null = null;

export function getClaudeTutor(): ClaudeTutor {
  if (!tutorInstance) {
    tutorInstance = new ClaudeTutor();
  }
  return tutorInstance;
}

export default ClaudeTutor;