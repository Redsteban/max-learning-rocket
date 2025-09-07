// Claude Conversation Memory System for Max's Continuous Learning
// Maintains short-term and long-term memory across sessions

import { prisma } from '@/lib/database';

// Types and Interfaces
export interface ShortTermMemory {
  sessionId: string;
  userId: string;
  date: Date;
  module: string;
  topicsDiscussed: string[];
  problemsSolved: string[];
  energyLevel: 'high' | 'medium' | 'low';
  mistakesNoted: string[];
  missionProgress: number;
  notableInteractions: string[];
  vocabularyUsed: string[];
}

export interface LongTermMemory {
  userId: string;
  interests: Interest[];
  learningStyle: LearningStyle;
  favoriteTopics: Topic[];
  challengingAreas: Challenge[];
  achievements: MemoryAchievement[];
  recurringQuestions: Question[];
  personalityTraits: string[];
  localConnections: string[]; // Victoria BC specific
}

export interface Interest {
  topic: string;
  strength: number; // 1-10
  discoveredDate: Date;
  mentionCount: number;
  lastMentioned: Date;
  relatedActivities: string[];
}

export interface LearningStyle {
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  secondary?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredActivities: string[];
  bestTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  attentionSpan: number; // minutes
  pacingPreference: 'fast' | 'moderate' | 'slow';
}

export interface Topic {
  name: string;
  module: string;
  enjoymentLevel: number; // 1-10
  masteryLevel: number; // 1-10
  lastExplored: Date;
  totalTimeSpent: number; // minutes
}

export interface Challenge {
  concept: string;
  module: string;
  difficultyLevel: number; // 1-10
  attemptsCount: number;
  lastAttempt: Date;
  improvementRate: number; // percentage
  supportStrategies: string[];
}

export interface MemoryAchievement {
  id: string;
  title: string;
  earnedDate: Date;
  context: string;
  proudMoment: boolean;
}

export interface Question {
  question: string;
  frequency: number;
  lastAsked: Date;
  answers: string[];
  relatedConcepts: string[];
}

export interface ConceptMastery {
  concept: string;
  module: string;
  level: number; // 0-100
  confidence: number; // 0-100
  lastPracticed: Date;
  practiceCount: number;
  mistakes: string[];
  breakthroughs: string[];
}

export interface VocabularyItem {
  word: string;
  definition: string;
  context: string;
  usageCount: number;
  firstSeen: Date;
  lastUsed: Date;
  masteryLevel: number; // 0-100
}

export interface MemoryContext {
  studentProfile: {
    name: string;
    age: number;
    grade: number;
    location: string;
  };
  recentLearning: SessionSummary[];
  currentInterests: string[];
  currentMastery: Record<string, number>;
  todaysGoal: string;
  personalizedGreeting: string;
  suggestedTopics: string[];
  avoidTopics: string[]; // Topics recently covered extensively
}

export interface SessionSummary {
  date: Date;
  module: string;
  keyLearning: string[];
  achievements: string[];
  challenges: string[];
  duration: number;
  engagement: 'high' | 'medium' | 'low';
}

// Memory Manager Class
export class ClaudeMemorySystem {
  private userId: string;
  private shortTermMemory: Map<string, ShortTermMemory>;
  private longTermMemory: LongTermMemory | null = null;
  private conceptMastery: Map<string, ConceptMastery>;
  private vocabulary: Map<string, VocabularyItem>;
  private readonly MAX_SHORT_TERM_SESSIONS = 10;
  private readonly MEMORY_DECAY_DAYS = 30;

  constructor(userId: string) {
    this.userId = userId;
    this.shortTermMemory = new Map();
    this.conceptMastery = new Map();
    this.vocabulary = new Map();
  }

  // Initialize memory system for user
  async initialize(): Promise<void> {
    await this.loadLongTermMemory();
    await this.loadRecentSessions();
    await this.loadConceptMastery();
    await this.loadVocabulary();
  }

  // Load long-term memory from database
  private async loadLongTermMemory(): Promise<void> {
    try {
      // Load user profile and learning history
      const profile = await prisma.user.findUnique({
        where: { id: this.userId },
        include: {
          progress: true,
          achievements: true,
          learningsessions: {
            take: 20,
            orderBy: { startTime: 'desc' }
          },
          conversations: {
            take: 100,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!profile) return;

      // Analyze conversations for interests and patterns
      const interests = this.extractInterests(profile.conversations);
      const favoriteTopics = this.identifyFavoriteTopics(profile.learningsessions);
      const challenges = this.identifyChallenges(profile.conversations);
      const recurringQuestions = this.findRecurringQuestions(profile.conversations);

      this.longTermMemory = {
        userId: this.userId,
        interests,
        learningStyle: this.determineLearningStyle(profile.conversations),
        favoriteTopics,
        challengingAreas: challenges,
        achievements: this.formatAchievements(profile.achievements),
        recurringQuestions,
        personalityTraits: this.extractPersonalityTraits(profile.conversations),
        localConnections: this.extractLocalConnections(profile.conversations),
      };
    } catch (error) {
      console.error('Failed to load long-term memory:', error);
      this.initializeEmptyLongTermMemory();
    }
  }

  // Extract interests from conversations
  private extractInterests(conversations: any[]): Interest[] {
    const interestMap = new Map<string, Interest>();
    
    const interestKeywords = [
      'love', 'like', 'favorite', 'cool', 'awesome', 'interesting',
      'fun', 'enjoy', 'excited', 'curious'
    ];
    
    conversations.forEach(conv => {
      if (conv.role === 'user') {
        const content = conv.content.toLowerCase();
        
        interestKeywords.forEach(keyword => {
          if (content.includes(keyword)) {
            // Extract the subject after the keyword
            const pattern = new RegExp(`${keyword}\\s+(\\w+(?:\\s+\\w+)?)`, 'gi');
            const matches = content.matchAll(pattern);
            
            for (const match of matches) {
              const topic = match[1];
              if (topic && topic.length > 2) {
                const existing = interestMap.get(topic) || {
                  topic,
                  strength: 0,
                  discoveredDate: conv.createdAt,
                  mentionCount: 0,
                  lastMentioned: conv.createdAt,
                  relatedActivities: []
                };
                
                existing.mentionCount++;
                existing.strength = Math.min(10, existing.mentionCount * 2);
                existing.lastMentioned = conv.createdAt;
                
                interestMap.set(topic, existing);
              }
            }
          }
        });
      }
    });
    
    return Array.from(interestMap.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
  }

  // Determine learning style from patterns
  private determineLearningStyle(conversations: any[]): LearningStyle {
    const indicators = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0
    };
    
    conversations.forEach(conv => {
      if (conv.role === 'user') {
        const content = conv.content.toLowerCase();
        
        // Visual indicators
        if (/show|see|look|picture|draw|diagram|chart|color/i.test(content)) {
          indicators.visual++;
        }
        
        // Auditory indicators
        if (/hear|listen|sound|tell|explain|talk|say|speak/i.test(content)) {
          indicators.auditory++;
        }
        
        // Kinesthetic indicators
        if (/do|try|make|build|touch|move|play|hands/i.test(content)) {
          indicators.kinesthetic++;
        }
        
        // Reading indicators
        if (/read|write|text|book|story|word|spell/i.test(content)) {
          indicators.reading++;
        }
      }
    });
    
    // Determine primary and secondary styles
    const sorted = Object.entries(indicators)
      .sort(([, a], [, b]) => b - a);
    
    return {
      primary: sorted[0][0] as any,
      secondary: sorted[1][0] as any,
      preferredActivities: this.getPreferredActivities(sorted[0][0]),
      attentionSpan: 20, // Default for 9-year-old
      pacingPreference: 'moderate'
    };
  }

  // Get preferred activities based on learning style
  private getPreferredActivities(style: string): string[] {
    const activities: Record<string, string[]> = {
      visual: ['drawing', 'diagrams', 'videos', 'color-coding', 'mind maps'],
      auditory: ['discussions', 'explanations', 'songs', 'rhymes', 'storytelling'],
      kinesthetic: ['experiments', 'building', 'games', 'role-play', 'hands-on projects'],
      reading: ['stories', 'writing', 'journaling', 'research', 'note-taking']
    };
    
    return activities[style] || activities.visual;
  }

  // Identify favorite topics from sessions
  private identifyFavoriteTopics(sessions: any[]): Topic[] {
    const topicMap = new Map<string, Topic>();
    
    sessions.forEach(session => {
      const topic = session.module;
      const existing = topicMap.get(topic) || {
        name: topic,
        module: topic,
        enjoymentLevel: 5,
        masteryLevel: 5,
        lastExplored: session.startTime,
        totalTimeSpent: 0
      };
      
      existing.totalTimeSpent += session.duration || 0;
      existing.lastExplored = session.startTime;
      
      // Estimate enjoyment based on session duration and frequency
      if (session.duration > 20) existing.enjoymentLevel = Math.min(10, existing.enjoymentLevel + 1);
      
      topicMap.set(topic, existing);
    });
    
    return Array.from(topicMap.values())
      .sort((a, b) => b.enjoymentLevel - a.enjoymentLevel)
      .slice(0, 5);
  }

  // Identify challenging areas
  private identifyChallenges(conversations: any[]): Challenge[] {
    const challenges: Challenge[] = [];
    const challengeIndicators = [
      'difficult', 'hard', 'confused', 'don\'t understand',
      'stuck', 'help', 'struggle', 'tricky'
    ];
    
    const challengeMap = new Map<string, Challenge>();
    
    conversations.forEach(conv => {
      if (conv.role === 'user') {
        const content = conv.content.toLowerCase();
        
        challengeIndicators.forEach(indicator => {
          if (content.includes(indicator)) {
            // Try to extract the concept
            const words = content.split(' ');
            const index = words.findIndex(w => w.includes(indicator));
            
            if (index !== -1) {
              const concept = words.slice(Math.max(0, index - 2), index + 3).join(' ');
              
              const existing = challengeMap.get(concept) || {
                concept,
                module: conv.module || 'general',
                difficultyLevel: 5,
                attemptsCount: 0,
                lastAttempt: conv.createdAt,
                improvementRate: 0,
                supportStrategies: []
              };
              
              existing.attemptsCount++;
              existing.lastAttempt = conv.createdAt;
              
              challengeMap.set(concept, existing);
            }
          }
        });
      }
    });
    
    return Array.from(challengeMap.values()).slice(0, 5);
  }

  // Find recurring questions
  private findRecurringQuestions(conversations: any[]): Question[] {
    const questionMap = new Map<string, Question>();
    
    conversations.forEach(conv => {
      if (conv.role === 'user' && conv.content.includes('?')) {
        const questions = conv.content.match(/[^.!]*\?/g) || [];
        
        questions.forEach(q => {
          const normalized = q.toLowerCase().trim();
          const existing = questionMap.get(normalized) || {
            question: q.trim(),
            frequency: 0,
            lastAsked: conv.createdAt,
            answers: [],
            relatedConcepts: []
          };
          
          existing.frequency++;
          existing.lastAsked = conv.createdAt;
          
          questionMap.set(normalized, existing);
        });
      }
    });
    
    return Array.from(questionMap.values())
      .filter(q => q.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  // Extract personality traits
  private extractPersonalityTraits(conversations: any[]): string[] {
    const traits: string[] = [];
    
    // Look for personality indicators
    const traitPatterns = {
      curious: /why|how|what if|wonder|curious/i,
      creative: /imagine|create|invent|design|story/i,
      persistent: /try again|keep going|don't give up|practice/i,
      enthusiastic: /excited|awesome|cool|love|amazing/i,
      thoughtful: /think|consider|maybe|perhaps|could/i,
    };
    
    Object.entries(traitPatterns).forEach(([trait, pattern]) => {
      const matches = conversations.filter(c => 
        c.role === 'user' && pattern.test(c.content)
      );
      
      if (matches.length > 3) {
        traits.push(trait);
      }
    });
    
    return traits;
  }

  // Extract Victoria BC local connections
  private extractLocalConnections(conversations: any[]): string[] {
    const localKeywords = [
      'victoria', 'bc', 'british columbia', 'inner harbour',
      'beacon hill', 'ocean', 'whale', 'ferry', 'island',
      'pacific', 'salish sea', 'butchart gardens'
    ];
    
    const connections = new Set<string>();
    
    conversations.forEach(conv => {
      const content = conv.content.toLowerCase();
      localKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          connections.add(keyword);
        }
      });
    });
    
    return Array.from(connections);
  }

  // Format achievements for memory
  private formatAchievements(achievements: any[]): MemoryAchievement[] {
    return achievements.map(a => ({
      id: a.id,
      title: a.name,
      earnedDate: a.unlockedAt,
      context: a.description || '',
      proudMoment: a.rarity === 'epic' || a.rarity === 'legendary'
    }));
  }

  // Initialize empty long-term memory
  private initializeEmptyLongTermMemory(): void {
    this.longTermMemory = {
      userId: this.userId,
      interests: [],
      learningStyle: {
        primary: 'visual',
        preferredActivities: ['drawing', 'diagrams', 'videos'],
        attentionSpan: 20,
        pacingPreference: 'moderate'
      },
      favoriteTopics: [],
      challengingAreas: [],
      achievements: [],
      recurringQuestions: [],
      personalityTraits: [],
      localConnections: ['victoria', 'bc', 'ocean']
    };
  }

  // Load recent sessions into short-term memory
  private async loadRecentSessions(): Promise<void> {
    try {
      const sessions = await prisma.learningSession.findMany({
        where: { userId: this.userId },
        orderBy: { startTime: 'desc' },
        take: this.MAX_SHORT_TERM_SESSIONS
      });

      sessions.forEach(session => {
        const memory: ShortTermMemory = {
          sessionId: session.id,
          userId: this.userId,
          date: session.startTime,
          module: session.module,
          topicsDiscussed: session.activities as string[] || [],
          problemsSolved: [],
          energyLevel: 'medium',
          mistakesNoted: [],
          missionProgress: 0,
          notableInteractions: [],
          vocabularyUsed: []
        };
        
        this.shortTermMemory.set(session.id, memory);
      });
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    }
  }

  // Load concept mastery data
  private async loadConceptMastery(): Promise<void> {
    try {
      // This would load from a concept_mastery table
      // For now, we'll analyze from progress data
      const progress = await prisma.progress.findUnique({
        where: { userId: this.userId },
        include: { moduleProgress: true }
      });

      if (progress?.moduleProgress) {
        progress.moduleProgress.forEach(mp => {
          const mastery: ConceptMastery = {
            concept: mp.module,
            module: mp.module,
            level: mp.mastery,
            confidence: mp.mastery * 0.8, // Estimate confidence
            lastPracticed: mp.lastActivity,
            practiceCount: mp.sessionsCount,
            mistakes: [],
            breakthroughs: []
          };
          
          this.conceptMastery.set(mp.module, mastery);
        });
      }
    } catch (error) {
      console.error('Failed to load concept mastery:', error);
    }
  }

  // Load vocabulary bank
  private async loadVocabulary(): Promise<void> {
    // This would load from a vocabulary table
    // For now, we'll use a default set for Grade 4
    const defaultVocab = [
      { word: 'hypothesis', definition: 'an educated guess', mastery: 50 },
      { word: 'ecosystem', definition: 'community of living things', mastery: 60 },
      { word: 'fraction', definition: 'part of a whole', mastery: 70 },
      { word: 'continent', definition: 'large land mass', mastery: 80 },
      { word: 'entrepreneur', definition: 'person who starts a business', mastery: 40 }
    ];

    defaultVocab.forEach(item => {
      this.vocabulary.set(item.word, {
        word: item.word,
        definition: item.definition,
        context: '',
        usageCount: 0,
        firstSeen: new Date(),
        lastUsed: new Date(),
        masteryLevel: item.mastery
      });
    });
  }

  // Update short-term memory during session
  updateShortTermMemory(
    sessionId: string,
    update: Partial<ShortTermMemory>
  ): void {
    const existing = this.shortTermMemory.get(sessionId) || {
      sessionId,
      userId: this.userId,
      date: new Date(),
      module: 'general',
      topicsDiscussed: [],
      problemsSolved: [],
      energyLevel: 'medium',
      mistakesNoted: [],
      missionProgress: 0,
      notableInteractions: [],
      vocabularyUsed: []
    };

    const updated = { ...existing, ...update };
    this.shortTermMemory.set(sessionId, updated);

    // Limit short-term memory size
    if (this.shortTermMemory.size > this.MAX_SHORT_TERM_SESSIONS) {
      const oldestKey = Array.from(this.shortTermMemory.keys())[0];
      this.shortTermMemory.delete(oldestKey);
    }
  }

  // Update long-term memory with new discoveries
  updateLongTermMemory(updates: Partial<LongTermMemory>): void {
    if (!this.longTermMemory) {
      this.initializeEmptyLongTermMemory();
    }

    this.longTermMemory = {
      ...this.longTermMemory!,
      ...updates
    };

    // Persist to database asynchronously
    this.persistLongTermMemory();
  }

  // Build context for new session
  async buildSessionContext(): Promise<MemoryContext> {
    const recentSessions = await this.getRecentSessionSummaries();
    const interests = this.getCurrentInterests();
    const mastery = this.getCurrentMastery();
    const greeting = this.generatePersonalizedGreeting();
    const goal = this.generateTodaysGoal();
    const suggestions = this.generateTopicSuggestions();
    const avoidTopics = this.getRecentlyExploredTopics();

    return {
      studentProfile: {
        name: 'Max',
        age: 9,
        grade: 4,
        location: 'Victoria, BC'
      },
      recentLearning: recentSessions,
      currentInterests: interests,
      currentMastery: mastery,
      todaysGoal: goal,
      personalizedGreeting: greeting,
      suggestedTopics: suggestions,
      avoidTopics
    };
  }

  // Get recent session summaries
  private async getRecentSessionSummaries(): Promise<SessionSummary[]> {
    const summaries: SessionSummary[] = [];
    
    for (const [, memory] of this.shortTermMemory) {
      summaries.push({
        date: memory.date,
        module: memory.module,
        keyLearning: memory.topicsDiscussed.slice(0, 3),
        achievements: [],
        challenges: memory.mistakesNoted,
        duration: 20, // Default
        engagement: memory.energyLevel === 'high' ? 'high' : 
                   memory.energyLevel === 'low' ? 'low' : 'medium'
      });
    }
    
    return summaries.slice(0, 3);
  }

  // Get current interests
  private getCurrentInterests(): string[] {
    if (!this.longTermMemory) return [];
    
    return this.longTermMemory.interests
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
      .map(i => i.topic);
  }

  // Get current mastery levels
  private getCurrentMastery(): Record<string, number> {
    const mastery: Record<string, number> = {};
    
    for (const [concept, data] of this.conceptMastery) {
      mastery[concept] = data.level;
    }
    
    return mastery;
  }

  // Generate personalized greeting
  private generatePersonalizedGreeting(): string {
    const greetings = [
      "Hey Max! Ready for another awesome learning adventure?",
      "Welcome back, Max! I've been thinking about our last session!",
      "Hi Max! I'm excited to explore new things with you today!"
    ];
    
    // Add personalization based on memory
    if (this.longTermMemory?.interests.length > 0) {
      const topInterest = this.longTermMemory.interests[0].topic;
      greetings.push(`Hey Max! Want to explore more about ${topInterest} today?`);
    }
    
    if (this.longTermMemory?.achievements.length > 0) {
      const recent = this.longTermMemory.achievements[0];
      greetings.push(`Hi Max! Still proud of your "${recent.title}" achievement!`);
    }
    
    // Reference recent learning
    const recentSession = Array.from(this.shortTermMemory.values())[0];
    if (recentSession && recentSession.topicsDiscussed.length > 0) {
      greetings.push(`Hey Max! Remember when we talked about ${recentSession.topicsDiscussed[0]}? Let's build on that!`);
    }
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Generate today's goal
  private generateTodaysGoal(): string {
    const day = new Date().getDay();
    const moduleGoals: Record<number, string> = {
      1: "Discover something amazing in science!",
      2: "Master new math skills!",
      3: "Create incredible stories!",
      4: "Explore the world!",
      5: "Think like an entrepreneur!",
      6: "Review and celebrate the week!",
      0: "Free exploration day!"
    };
    
    return moduleGoals[day] || "Learn something new and have fun!";
  }

  // Generate topic suggestions
  private generateTopicSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // Based on interests
    if (this.longTermMemory?.interests.length > 0) {
      suggestions.push(`More about ${this.longTermMemory.interests[0].topic}`);
    }
    
    // Based on challenges (offer support)
    if (this.longTermMemory?.challengingAreas.length > 0) {
      suggestions.push(`Practice ${this.longTermMemory.challengingAreas[0].concept} with fun activities`);
    }
    
    // Based on favorite topics
    if (this.longTermMemory?.favoriteTopics.length > 0) {
      suggestions.push(`Deeper dive into ${this.longTermMemory.favoriteTopics[0].name}`);
    }
    
    // Add some variety
    suggestions.push("Try something completely new!");
    
    return suggestions.slice(0, 3);
  }

  // Get recently explored topics to avoid repetition
  private getRecentlyExploredTopics(): string[] {
    const recent: string[] = [];
    
    for (const [, memory] of this.shortTermMemory) {
      recent.push(...memory.topicsDiscussed);
    }
    
    return [...new Set(recent)].slice(0, 5);
  }

  // Update concept mastery
  updateConceptMastery(concept: string, module: string, performance: number): void {
    const existing = this.conceptMastery.get(concept) || {
      concept,
      module,
      level: 0,
      confidence: 0,
      lastPracticed: new Date(),
      practiceCount: 0,
      mistakes: [],
      breakthroughs: []
    };
    
    // Update mastery level (weighted average)
    existing.level = Math.round((existing.level * 0.7 + performance * 0.3));
    existing.confidence = Math.min(100, existing.confidence + 5);
    existing.lastPracticed = new Date();
    existing.practiceCount++;
    
    this.conceptMastery.set(concept, existing);
  }

  // Add vocabulary word
  addVocabularyWord(word: string, definition: string, context: string): void {
    const existing = this.vocabulary.get(word.toLowerCase()) || {
      word: word.toLowerCase(),
      definition,
      context,
      usageCount: 0,
      firstSeen: new Date(),
      lastUsed: new Date(),
      masteryLevel: 0
    };
    
    existing.usageCount++;
    existing.lastUsed = new Date();
    existing.masteryLevel = Math.min(100, existing.masteryLevel + 10);
    
    this.vocabulary.set(word.toLowerCase(), existing);
  }

  // Persist long-term memory to database
  private async persistLongTermMemory(): Promise<void> {
    // This would save to database tables
    // For now, just log
    console.log('Persisting long-term memory for user:', this.userId);
  }

  // Generate memory injection for Claude
  generateMemoryInjection(): string {
    const context = this.buildSessionContext();
    
    return `STUDENT MEMORY PROFILE:
===========================
Student: Max, Age 9, Grade 4, Victoria BC

LEARNING STYLE:
${this.longTermMemory?.learningStyle.primary || 'visual'} learner who prefers ${this.longTermMemory?.learningStyle.preferredActivities.join(', ') || 'varied activities'}

CURRENT INTERESTS:
${this.getCurrentInterests().join(', ') || 'Exploring various topics'}

RECENT LEARNING (Last 3 Sessions):
${this.formatRecentLearning()}

STRENGTHS:
${this.formatStrengths()}

AREAS FOR GROWTH:
${this.formatChallenges()}

PERSONALITY TRAITS:
${this.longTermMemory?.personalityTraits.join(', ') || 'Curious and eager to learn'}

LOCAL CONNECTIONS:
Often relates learning to ${this.longTermMemory?.localConnections.join(', ') || 'Victoria BC area'}

TODAY'S FOCUS:
${this.generateTodaysGoal()}

AVOID REPETITION OF:
${this.getRecentlyExploredTopics().join(', ') || 'No recent topics'}

REMEMBER TO:
- Reference past successes when relevant
- Build on previous knowledge
- Use interests to explain new concepts
- Adapt to ${this.longTermMemory?.learningStyle.primary || 'visual'} learning style
- Keep energy ${this.getAverageEnergyLevel()} appropriate
===========================`;
  }

  // Format recent learning for injection
  private formatRecentLearning(): string {
    const recent = Array.from(this.shortTermMemory.values()).slice(0, 3);
    
    if (recent.length === 0) return 'Starting fresh today!';
    
    return recent.map(session => 
      `- ${session.module}: ${session.topicsDiscussed.slice(0, 2).join(', ')}`
    ).join('\n');
  }

  // Format strengths for injection
  private formatStrengths(): string {
    const strengths = [];
    
    // Check concept mastery
    for (const [concept, mastery] of this.conceptMastery) {
      if (mastery.level > 70) {
        strengths.push(`Strong in ${concept}`);
      }
    }
    
    // Check achievements
    if (this.longTermMemory?.achievements.length > 0) {
      strengths.push('Achievement-oriented learner');
    }
    
    return strengths.join(', ') || 'Building confidence across subjects';
  }

  // Format challenges for injection
  private formatChallenges(): string {
    if (!this.longTermMemory?.challengingAreas.length) {
      return 'No specific challenges identified';
    }
    
    return this.longTermMemory.challengingAreas
      .slice(0, 2)
      .map(c => c.concept)
      .join(', ');
  }

  // Get average energy level
  private getAverageEnergyLevel(): string {
    const levels = Array.from(this.shortTermMemory.values())
      .map(m => m.energyLevel);
    
    if (levels.length === 0) return 'medium';
    
    const counts = {
      high: levels.filter(l => l === 'high').length,
      medium: levels.filter(l => l === 'medium').length,
      low: levels.filter(l => l === 'low').length
    };
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  // Get memory summary for parent dashboard
  getMemorySummary(): {
    interests: string[];
    strengths: string[];
    challenges: string[];
    learningStyle: string;
    vocabulary: number;
    conceptsMastered: number;
    recentTopics: string[];
  } {
    return {
      interests: this.getCurrentInterests(),
      strengths: this.formatStrengths().split(', '),
      challenges: this.formatChallenges().split(', '),
      learningStyle: this.longTermMemory?.learningStyle.primary || 'visual',
      vocabulary: this.vocabulary.size,
      conceptsMastered: Array.from(this.conceptMastery.values())
        .filter(c => c.level > 70).length,
      recentTopics: this.getRecentlyExploredTopics()
    };
  }
}

// Export singleton factory
let memorySystemInstance: ClaudeMemorySystem | null = null;

export async function getMemorySystem(userId: string): Promise<ClaudeMemorySystem> {
  if (!memorySystemInstance || memorySystemInstance['userId'] !== userId) {
    memorySystemInstance = new ClaudeMemorySystem(userId);
    await memorySystemInstance.initialize();
  }
  return memorySystemInstance;
}

export default ClaudeMemorySystem;