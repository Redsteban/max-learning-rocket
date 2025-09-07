import { getClaudeTutor, TutorResponse, ConversationMessage } from './claude-tutor';
import { prisma } from '@/lib/database';
import { getModuleTheme, getModulePrompts } from './tutor-prompts';

// Types and Interfaces
export interface SessionState {
  sessionId: string;
  studentId: string;
  module: string;
  startTime: Date;
  lastInteraction: Date;
  energyLevel: 'high' | 'medium' | 'low';
  performanceLevel: 'struggling' | 'progressing' | 'excelling';
  topicsDiscussed: string[];
  conceptsMastered: string[];
  areasNeedingReview: string[];
  currentMissionProgress: number;
  messageCount: number;
  breakSuggested: boolean;
  contextSummary?: string;
}

export interface LearningContext {
  previousSessions: SessionSummary[];
  interests: string[];
  struggles: string[];
  preferredLearningStyle: 'visual' | 'hands-on' | 'story-based' | 'mixed';
  currentStreak: number;
  totalXP: number;
  recentAchievements: string[];
}

export interface SessionSummary {
  sessionId: string;
  date: Date;
  module: string;
  duration: number;
  topicsLearned: string[];
  keyInsights: string[];
  energyLevel: string;
  performance: string;
}

export interface AdaptiveResponse {
  message: string;
  difficulty: 'easy' | 'medium' | 'hard';
  encouragementType?: 'celebration' | 'motivation' | 'gentle-nudge' | 'break-suggestion';
  suggestedNextStep?: string;
}

// Encouragement templates for different situations
const ENCOURAGEMENT_TEMPLATES = {
  celebration: [
    "🎉 Wow Max! You're absolutely crushing it today! That was amazing!",
    "⭐ Incredible work! You're becoming a real {module} master!",
    "🚀 You're on fire today! Keep up this fantastic momentum!",
    "🌟 That's exactly right! You're thinking like a true scientist/mathematician/writer!",
  ],
  motivation: [
    "💪 I can see you're working hard on this, Max! Let's break it down together.",
    "🌈 Every great explorer faces challenges - you're doing great by not giving up!",
    "🎯 You're so close! Let's try looking at it from a different angle.",
    "⚡ Remember, the best adventures have a few tricky parts - you've got this!",
  ],
  'gentle-nudge': [
    "🤔 Hmm, let's think about this differently. What if we tried...",
    "💡 Good try! Here's a hint that might help...",
    "🔍 You're on the right track! Let's zoom in on one part...",
    "🎨 Let's paint a picture to help us understand this better...",
  ],
  'break-suggestion': [
    "🏃 Hey Max! You've been learning so much - how about a quick stretch break?",
    "☀️ Your brain has been working hard! Time for a 5-minute adventure break?",
    "🎮 Great work today! Let's pause here and come back with fresh energy!",
    "🌊 Like the tides in Victoria, learning has waves - let's ride the next one after a break!",
  ],
};

// Module-specific greetings
const MODULE_GREETINGS: Record<string, string[]> = {
  science: [
    "🔬 Hey Max! Ready to discover something amazing in our science lab today?",
    "🌌 Welcome back, young scientist! What mysteries shall we explore?",
    "⚗️ Hi Max! Our laboratory awaits - what experiment catches your eye today?",
  ],
  math: [
    "🧮 Hey Max! Ready to solve some math mysteries today?",
    "🎲 Welcome back, math detective! Numbers are waiting to tell their stories!",
    "📐 Hi Max! Let's turn math into an adventure game today!",
  ],
  stories: [
    "📚 Hey Max! What incredible story shall we create today?",
    "✨ Welcome back, storyteller! Your imagination is the only limit!",
    "🎭 Hi Max! Ready to bring some characters to life?",
  ],
  world: [
    "🌍 Hey Max! Where in the world shall we explore today?",
    "🗺️ Welcome back, explorer! Pick a destination for our journey!",
    "🏔️ Hi Max! From Victoria to the world - where shall we adventure?",
  ],
  entrepreneur: [
    "💡 Hey Max! What problems shall we solve today?",
    "🚀 Welcome back, young entrepreneur! Got any big ideas brewing?",
    "🏗️ Hi Max! Ready to build something that helps others?",
  ],
};

class ClaudeSessionManager {
  private activeSessions: Map<string, SessionState>;
  private learningContextCache: Map<string, LearningContext>;
  private tutor: ReturnType<typeof getClaudeTutor>;

  constructor() {
    this.activeSessions = new Map();
    this.learningContextCache = new Map();
    this.tutor = getClaudeTutor();
  }

  // Start a new tutoring session
  async startTutorSession(
    studentId: string, 
    module: string
  ): Promise<{ sessionId: string; greeting: string }> {
    // Get student's learning context
    const context = await this.getStudentContext(studentId);
    
    // Create new session
    const sessionId = `${studentId}-${module}-${Date.now()}`;
    const session: SessionState = {
      sessionId,
      studentId,
      module,
      startTime: new Date(),
      lastInteraction: new Date(),
      energyLevel: 'high',
      performanceLevel: 'progressing',
      topicsDiscussed: [],
      conceptsMastered: [],
      areasNeedingReview: [],
      currentMissionProgress: 0,
      messageCount: 0,
      breakSuggested: false,
    };

    this.activeSessions.set(sessionId, session);

    // Generate personalized greeting
    const greeting = await this.generatePersonalizedGreeting(module, context);

    // Determine time of day
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    // Create tutor session with context
    await this.tutor.createSession(studentId, module, {
      timeOfDay,
      previousTopics: context.previousSessions[0]?.topicsLearned || [],
      currentStreak: context.currentStreak,
      energyLevel: 'high', // Starting energy
      recentAchievements: context.recentAchievements,
    });

    // Store session start in database
    try {
      await prisma.learningSession.create({
        data: {
          id: sessionId,
          userId: studentId,
          module,
          startTime: new Date(),
          activities: [],
        }
      });
    } catch (error) {
      console.error('Failed to store session start:', error);
    }

    return { sessionId, greeting };
  }

  // Continue learning with context from previous sessions
  async continueLearning(
    sessionId: string,
    userMessage: string
  ): Promise<AdaptiveResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found. Please start a new session.');
    }

    // Update interaction timestamp
    session.lastInteraction = new Date();
    session.messageCount++;

    // Check if break is needed (every 20 minutes or 15 messages)
    const sessionDuration = Date.now() - session.startTime.getTime();
    if ((sessionDuration > 20 * 60 * 1000 || session.messageCount > 15) && !session.breakSuggested) {
      session.breakSuggested = true;
      return {
        message: ENCOURAGEMENT_TEMPLATES['break-suggestion'][
          Math.floor(Math.random() * ENCOURAGEMENT_TEMPLATES['break-suggestion'].length)
        ],
        difficulty: 'easy',
        encouragementType: 'break-suggestion',
        suggestedNextStep: 'Take a 5-10 minute break, then come back refreshed!',
      };
    }

    // Analyze message for energy and performance indicators
    this.analyzeStudentState(session, userMessage);

    // Get learning context
    const context = await this.getStudentContext(session.studentId);

    // Prepare enhanced context for Claude
    const enhancedContext = {
      currentLevel: context.totalXP ? Math.floor(context.totalXP / 100) : 1,
      recentAchievements: context.recentAchievements,
      strugglingTopics: session.areasNeedingReview,
      energyLevel: session.energyLevel,
      performanceLevel: session.performanceLevel,
      sessionDuration: Math.floor(sessionDuration / 60000), // in minutes
      messageCount: session.messageCount,
    };

    // Get response from Claude tutor
    const tutorResponse = await this.tutor.processMessage(
      sessionId,
      userMessage,
      enhancedContext as any
    );

    // Update session state based on response
    this.updateSessionFromResponse(session, tutorResponse, userMessage);

    // Determine difficulty adjustment
    const difficulty = this.determineDifficulty(session);

    // Generate encouragement if needed
    const encouragement = this.generateEncouragement(session);

    // Create adaptive response
    const adaptiveResponse: AdaptiveResponse = {
      message: encouragement ? 
        `${encouragement}\n\n${tutorResponse.message}` : 
        tutorResponse.message,
      difficulty,
      encouragementType: this.getEncouragementType(session),
      suggestedNextStep: tutorResponse.followUpQuestions?.[0],
    };

    // Store interaction
    try {
      await this.storeInteraction(session, userMessage, adaptiveResponse);
    } catch (error) {
      console.error('Failed to store interaction:', error);
    }

    return adaptiveResponse;
  }

  // Adjust difficulty based on performance
  adjustDifficulty(performance: 'struggling' | 'progressing' | 'excelling'): string {
    const adjustments = {
      struggling: "Let's make this simpler and take it step by step.",
      progressing: "You're doing great! Let's keep this pace.",
      excelling: "You're ready for a challenge! Let's level up!",
    };
    return adjustments[performance];
  }

  // Generate contextual encouragement
  generateEncouragement(situation: SessionState): string | null {
    // Don't overwhelm with too much encouragement
    if (Math.random() > 0.3) return null;

    const type = this.getEncouragementType(situation);
    if (!type) return null;

    const templates = ENCOURAGEMENT_TEMPLATES[type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders
    return template.replace('{module}', situation.module);
  }

  // End session and generate summary
  async endSessionSummary(sessionId: string): Promise<SessionSummary> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const duration = Date.now() - session.startTime.getTime();

    const summary: SessionSummary = {
      sessionId,
      date: session.startTime,
      module: session.module,
      duration: Math.floor(duration / 60000), // in minutes
      topicsLearned: session.conceptsMastered,
      keyInsights: await this.extractKeyInsights(session),
      energyLevel: session.energyLevel,
      performance: session.performanceLevel,
    };

    // Store session summary in database
    try {
      await prisma.learningSession.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          duration: summary.duration,
          activities: session.topicsDiscussed,
        }
      });
    } catch (error) {
      console.error('Failed to store session summary:', error);
    }

    // Clean up
    this.activeSessions.delete(sessionId);

    return summary;
  }

  // Private helper methods

  private async getStudentContext(studentId: string): Promise<LearningContext> {
    // Check cache first
    if (this.learningContextCache.has(studentId)) {
      return this.learningContextCache.get(studentId)!;
    }

    try {
      // Fetch from database
      const [progress, recentSessions, conversations] = await Promise.all([
        prisma.progress.findUnique({
          where: { userId: studentId },
          include: {
            achievements: {
              take: 5,
              orderBy: { unlockedAt: 'desc' }
            }
          }
        }),
        prisma.learningSession.findMany({
          where: { userId: studentId },
          orderBy: { startTime: 'desc' },
          take: 5,
        }),
        prisma.conversation.findMany({
          where: { userId: studentId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
      ]);

      // Analyze conversations for interests and struggles
      const interests = this.extractInterests(conversations);
      const struggles = this.extractStruggles(conversations);

      const context: LearningContext = {
        previousSessions: recentSessions.map(s => ({
          sessionId: s.id,
          date: s.startTime,
          module: s.module,
          duration: s.duration || 0,
          topicsLearned: s.activities as string[],
          keyInsights: [],
          energyLevel: 'medium',
          performance: 'progressing',
        })),
        interests,
        struggles,
        preferredLearningStyle: 'mixed', // Could be determined by analysis
        currentStreak: progress?.currentStreak || 0,
        totalXP: progress?.totalXP || 0,
        recentAchievements: progress?.achievements.map(a => a.name) || [],
      };

      // Cache for 5 minutes
      this.learningContextCache.set(studentId, context);
      setTimeout(() => this.learningContextCache.delete(studentId), 5 * 60 * 1000);

      return context;
    } catch (error) {
      console.error('Failed to get student context:', error);
      return {
        previousSessions: [],
        interests: [],
        struggles: [],
        preferredLearningStyle: 'mixed',
        currentStreak: 0,
        totalXP: 0,
        recentAchievements: [],
      };
    }
  }

  private async generatePersonalizedGreeting(
    module: string, 
    context: LearningContext
  ): Promise<string> {
    const greetings = MODULE_GREETINGS[module] || MODULE_GREETINGS['science'];
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Add personalization based on context
    if (context.currentStreak > 3) {
      greeting += ` 🔥 Amazing ${context.currentStreak}-day streak!`;
    }

    if (context.recentAchievements.length > 0) {
      greeting += ` I see you earned "${context.recentAchievements[0]}" - fantastic!`;
    }

    if (context.previousSessions.length > 0) {
      const lastSession = context.previousSessions[0];
      if (lastSession.module === module && lastSession.topicsLearned.length > 0) {
        greeting += ` Last time we explored ${lastSession.topicsLearned[0]}. Ready to continue?`;
      }
    }

    return greeting;
  }

  private analyzeStudentState(session: SessionState, message: string): void {
    // Analyze message length and content for energy level
    if (message.length < 10) {
      session.energyLevel = 'low';
    } else if (message.includes('!') || message.includes('?')) {
      session.energyLevel = 'high';
    }

    // Look for confusion indicators
    const confusionIndicators = [
      "i don't understand",
      "confused",
      "hard",
      "difficult",
      "help",
      "stuck",
    ];

    const excellenceIndicators = [
      "easy",
      "i know",
      "got it",
      "understand",
      "makes sense",
    ];

    const messageLower = message.toLowerCase();

    if (confusionIndicators.some(indicator => messageLower.includes(indicator))) {
      session.performanceLevel = 'struggling';
      session.energyLevel = 'low';
    } else if (excellenceIndicators.some(indicator => messageLower.includes(indicator))) {
      session.performanceLevel = 'excelling';
    }
  }

  private updateSessionFromResponse(
    session: SessionState,
    response: TutorResponse,
    userMessage: string
  ): void {
    // Update topics discussed
    if (response.topicMastery) {
      session.topicsDiscussed.push(response.topicMastery.topic);
      
      if (response.topicMastery.level > 70) {
        session.conceptsMastered.push(response.topicMastery.topic);
      } else if (response.topicMastery.level < 40) {
        session.areasNeedingReview.push(response.topicMastery.topic);
      }
    }

    // Update mission progress based on XP awarded
    if (response.xpToAward > 10) {
      session.currentMissionProgress = Math.min(100, session.currentMissionProgress + 10);
    }
  }

  private determineDifficulty(session: SessionState): 'easy' | 'medium' | 'hard' {
    if (session.performanceLevel === 'struggling' || session.energyLevel === 'low') {
      return 'easy';
    } else if (session.performanceLevel === 'excelling' && session.energyLevel === 'high') {
      return 'hard';
    }
    return 'medium';
  }

  private getEncouragementType(
    session: SessionState
  ): 'celebration' | 'motivation' | 'gentle-nudge' | 'break-suggestion' | undefined {
    if (session.breakSuggested) return 'break-suggestion';
    if (session.performanceLevel === 'excelling') return 'celebration';
    if (session.performanceLevel === 'struggling') return 'motivation';
    if (session.energyLevel === 'low') return 'gentle-nudge';
    return undefined;
  }

  private extractInterests(conversations: any[]): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const interests: string[] = [];
    const keywords = ['love', 'like', 'favorite', 'cool', 'awesome', 'fun'];
    
    conversations.forEach(conv => {
      if (conv.role === 'user') {
        const lower = conv.content.toLowerCase();
        keywords.forEach(keyword => {
          if (lower.includes(keyword)) {
            // Extract the subject after the keyword
            const words = lower.split(' ');
            const index = words.indexOf(keyword);
            if (index !== -1 && index < words.length - 1) {
              interests.push(words[index + 1]);
            }
          }
        });
      }
    });

    return [...new Set(interests)].slice(0, 5);
  }

  private extractStruggles(conversations: any[]): string[] {
    // Simple struggle detection
    const struggles: string[] = [];
    const keywords = ['hard', 'difficult', 'confusing', "don't understand", 'stuck'];
    
    conversations.forEach(conv => {
      if (conv.role === 'user') {
        const lower = conv.content.toLowerCase();
        keywords.forEach(keyword => {
          if (lower.includes(keyword)) {
            struggles.push(conv.module || 'general');
          }
        });
      }
    });

    return [...new Set(struggles)].slice(0, 3);
  }

  private async extractKeyInsights(session: SessionState): Promise<string[]> {
    const insights: string[] = [];

    if (session.conceptsMastered.length > 0) {
      insights.push(`Mastered: ${session.conceptsMastered.join(', ')}`);
    }

    if (session.areasNeedingReview.length > 0) {
      insights.push(`Needs practice: ${session.areasNeedingReview.join(', ')}`);
    }

    insights.push(`Energy level: ${session.energyLevel}`);
    insights.push(`Performance: ${session.performanceLevel}`);

    if (session.currentMissionProgress > 50) {
      insights.push('Great progress on daily mission!');
    }

    return insights;
  }

  private async storeInteraction(
    session: SessionState,
    userMessage: string,
    response: AdaptiveResponse
  ): Promise<void> {
    // Store in database for parent review and analytics
    try {
      await prisma.conversation.create({
        data: {
          userId: session.studentId,
          sessionId: session.sessionId,
          role: 'user',
          content: userMessage,
          module: session.module,
        }
      });

      await prisma.conversation.create({
        data: {
          userId: session.studentId,
          sessionId: session.sessionId,
          role: 'assistant',
          content: response.message,
          module: session.module,
          metadata: {
            difficulty: response.difficulty,
            encouragementType: response.encouragementType,
            energyLevel: session.energyLevel,
            performanceLevel: session.performanceLevel,
          } as any,
        }
      });
    } catch (error) {
      console.error('Failed to store interaction:', error);
    }
  }

  // Cleanup old sessions
  cleanupInactiveSessions(maxAge: number = 2 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastInteraction.getTime() > maxAge) {
        this.endSessionSummary(sessionId).catch(console.error);
      }
    }
  }

  // Get active session for a student
  getActiveSession(studentId: string): SessionState | undefined {
    for (const session of this.activeSessions.values()) {
      if (session.studentId === studentId) {
        return session;
      }
    }
    return undefined;
  }

  // Smart context summarization for token management
  async summarizeContext(messages: ConversationMessage[]): Promise<string> {
    if (messages.length < 10) {
      return ''; // No need to summarize yet
    }

    // Take older messages (keep last 5 intact)
    const toSummarize = messages.slice(0, -5);
    
    const topics = new Set<string>();
    const concepts = new Set<string>();
    let questionsAsked = 0;

    toSummarize.forEach(msg => {
      if (msg.role === 'user') {
        questionsAsked++;
        // Simple topic extraction (could be enhanced)
        if (msg.content.length > 20) {
          const words = msg.content.split(' ').slice(0, 3).join(' ');
          topics.add(words);
        }
      }
    });

    const summary = `Previous discussion: Max asked ${questionsAsked} questions about ${Array.from(topics).join(', ')}. `;
    return summary;
  }
}

// Singleton instance
let sessionManagerInstance: ClaudeSessionManager | null = null;

export function getSessionManager(): ClaudeSessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new ClaudeSessionManager();
    
    // Set up cleanup interval (every hour)
    setInterval(() => {
      sessionManagerInstance?.cleanupInactiveSessions();
    }, 60 * 60 * 1000);
  }
  return sessionManagerInstance;
}

export default ClaudeSessionManager;