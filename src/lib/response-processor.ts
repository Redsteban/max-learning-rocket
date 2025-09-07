// Intelligent Response Processor for Max's Claude Tutor
// Enhances, gamifies, and ensures safe learning for 9-year-old Max

import { calculateXP } from './tutor-prompts';

// Types and Interfaces
export interface ProcessedResponse {
  originalContent: string;
  enhancedContent: string;
  segments: ResponseSegment[];
  xpAwarded: number;
  achievements: Achievement[];
  learningPoints: string[];
  parentReport: ParentReport;
  interactiveElements: InteractiveElement[];
  safetyFlags: string[];
  readingLevel: number;
  celebrationTrigger?: CelebrationEvent;
}

export interface ResponseSegment {
  type: 'text' | 'didYouKnow' | 'tryThis' | 'definition' | 'visual' | 'celebration';
  content: string;
  emoji?: string;
  highlight?: boolean;
  voiceEnabled?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpValue: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ParentReport {
  sessionDate: Date;
  topicsDiscussed: string[];
  keyLearningPoints: string[];
  strengthsShown: string[];
  areasForSupport: string[];
  engagementLevel: 'high' | 'medium' | 'low';
  recommendedFollowUp: string[];
  notableQuotes: string[];
}

export interface InteractiveElement {
  type: 'button' | 'quiz' | 'drawing' | 'voice' | 'upload';
  label: string;
  action: string;
  icon?: string;
  data?: any;
}

export interface CelebrationEvent {
  type: 'achievement' | 'milestone' | 'streak' | 'mastery';
  message: string;
  animation: string;
  sound?: string;
  duration: number;
}

// Grade 4 vocabulary and simplifications
const COMPLEX_TERMS: Record<string, string> = {
  'photosynthesis': 'how plants make food from sunlight',
  'ecosystem': 'community of living things',
  'hypothesis': 'educated guess',
  'perpendicular': 'meeting at right angles (like a plus sign +)',
  'denominator': 'bottom number in a fraction',
  'numerator': 'top number in a fraction',
  'civilization': 'group of people living together with rules',
  'entrepreneur': 'person who starts a business',
  'algorithm': 'step-by-step instructions',
  'variable': 'letter that stands for a number',
};

// Educational enhancement patterns
const LEARNING_MOMENTS = [
  { pattern: /because/gi, enhancement: '🔍 Here\'s why:' },
  { pattern: /for example/gi, enhancement: '📝 Example:' },
  { pattern: /remember/gi, enhancement: '💡 Remember:' },
  { pattern: /important/gi, enhancement: '⭐ Important:' },
  { pattern: /let's try/gi, enhancement: '🎯 Let\'s try:' },
  { pattern: /think about/gi, enhancement: '🤔 Think about:' },
];

// Achievement triggers
const ACHIEVEMENT_PATTERNS = [
  { 
    pattern: /great job|excellent|fantastic|amazing/gi,
    achievement: {
      id: 'great_work',
      name: 'Star Student',
      description: 'Showed excellent understanding!',
      xpValue: 20,
      icon: '⭐',
      rarity: 'common' as const
    }
  },
  {
    pattern: /perfect|exactly right|nailed it/gi,
    achievement: {
      id: 'perfect_answer',
      name: 'Perfection!',
      description: 'Got it exactly right!',
      xpValue: 30,
      icon: '🎯',
      rarity: 'rare' as const
    }
  },
  {
    pattern: /creative|innovative|unique idea/gi,
    achievement: {
      id: 'creative_thinker',
      name: 'Creative Genius',
      description: 'Showed amazing creativity!',
      xpValue: 40,
      icon: '🎨',
      rarity: 'epic' as const
    }
  }
];

// Main Response Processor Class
export class ResponseProcessor {
  private module: string;
  private userAge: number = 9;
  private gradeLevel: number = 4;

  constructor(module: string = 'general') {
    this.module = module;
  }

  // Main processing pipeline
  async processResponse(
    rawResponse: string,
    context?: {
      userMessage?: string;
      sessionDuration?: number;
      messagesCount?: number;
      currentStreak?: number;
    }
  ): Promise<ProcessedResponse> {
    // Step 1: Safety check and filtering
    const safeContent = this.ensureSafety(rawResponse);
    
    // Step 2: Simplify language for Grade 4
    const simplifiedContent = this.simplifyLanguage(safeContent);
    
    // Step 3: Break into segments
    const segments = this.segmentContent(simplifiedContent);
    
    // Step 4: Enhance educational content
    const enhancedSegments = this.enhanceEducation(segments);
    
    // Step 5: Add gamification elements
    const { segments: gamifiedSegments, achievements, xp, celebration } = 
      this.addGamification(enhancedSegments, context);
    
    // Step 6: Extract learning points for parent report
    const learningPoints = this.extractLearningPoints(simplifiedContent);
    
    // Step 7: Generate parent report
    const parentReport = this.generateParentReport(
      simplifiedContent,
      learningPoints,
      context
    );
    
    // Step 8: Create interactive elements
    const interactiveElements = this.createInteractiveElements(simplifiedContent);
    
    // Step 9: Check reading level
    const readingLevel = this.assessReadingLevel(simplifiedContent);
    
    // Step 10: Compile enhanced content
    const enhancedContent = this.compileContent(gamifiedSegments);
    
    return {
      originalContent: rawResponse,
      enhancedContent,
      segments: gamifiedSegments,
      xpAwarded: xp,
      achievements,
      learningPoints,
      parentReport,
      interactiveElements,
      safetyFlags: [],
      readingLevel,
      celebrationTrigger: celebration,
    };
  }

  // Safety check and content filtering
  private ensureSafety(content: string): string {
    // Remove URLs
    let safe = content.replace(/https?:\/\/[^\s]+/g, '[link removed]');
    
    // Remove potentially inappropriate words (simplified list)
    const inappropriateWords = ['violence', 'death', 'kill', 'blood', 'war'];
    inappropriateWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      safe = safe.replace(regex, '[filtered]');
    });
    
    // Ensure positive tone
    safe = safe.replace(/you can't|you cannot/gi, "let's find another way to");
    safe = safe.replace(/wrong|incorrect/gi, "let's try again");
    safe = safe.replace(/failed|failure/gi, "needs more practice");
    
    return safe;
  }

  // Simplify language for Grade 4 reading level
  private simplifyLanguage(content: string): string {
    let simplified = content;
    
    // Replace complex terms with simple explanations
    Object.entries(COMPLEX_TERMS).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, `${complex} (${simple})`);
    });
    
    // Break long sentences (more than 20 words)
    const sentences = simplified.split(/(?<=[.!?])\s+/);
    const shortSentences = sentences.map(sentence => {
      const words = sentence.split(' ');
      if (words.length > 20) {
        // Find a good breaking point
        const midPoint = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, midPoint).join(' ');
        const secondHalf = words.slice(midPoint).join(' ');
        return `${firstHalf}. ${secondHalf}`;
      }
      return sentence;
    });
    
    return shortSentences.join(' ');
  }

  // Segment content into digestible chunks
  private segmentContent(content: string): ResponseSegment[] {
    const segments: ResponseSegment[] = [];
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      // Check for special content types
      if (paragraph.toLowerCase().includes('did you know')) {
        segments.push({
          type: 'didYouKnow',
          content: paragraph,
          emoji: '💡',
          highlight: true,
        });
      } else if (paragraph.toLowerCase().includes('try this')) {
        segments.push({
          type: 'tryThis',
          content: paragraph,
          emoji: '🎯',
          highlight: true,
        });
      } else if (paragraph.includes('(') && paragraph.includes(')')) {
        // Likely contains a definition
        const matches = paragraph.match(/([^(]+)\(([^)]+)\)/);
        if (matches) {
          segments.push({
            type: 'definition',
            content: paragraph,
            emoji: '📖',
          });
        } else {
          segments.push({
            type: 'text',
            content: paragraph,
          });
        }
      } else {
        segments.push({
          type: 'text',
          content: paragraph,
          voiceEnabled: true,
        });
      }
    });
    
    return segments;
  }

  // Enhance educational content
  private enhanceEducation(segments: ResponseSegment[]): ResponseSegment[] {
    return segments.map(segment => {
      let enhanced = { ...segment };
      
      // Add visual cues to important points
      LEARNING_MOMENTS.forEach(({ pattern, enhancement }) => {
        if (pattern.test(segment.content)) {
          enhanced.content = segment.content.replace(pattern, enhancement);
          enhanced.highlight = true;
        }
      });
      
      // Add emojis to make content more engaging
      enhanced.content = this.addEducationalEmojis(enhanced.content);
      
      return enhanced;
    });
  }

  // Add educational emojis
  private addEducationalEmojis(content: string): string {
    const emojiMap: Record<string, string> = {
      'science': '🔬',
      'math': '🧮',
      'story': '📚',
      'world': '🌍',
      'business': '💼',
      'experiment': '⚗️',
      'calculate': '🔢',
      'write': '✏️',
      'explore': '🗺️',
      'create': '🎨',
      'question': '❓',
      'answer': '💡',
      'correct': '✅',
      'practice': '🎯',
      'challenge': '🏆',
    };
    
    let enhanced = content;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `${word} ${emoji}`);
    });
    
    return enhanced;
  }

  // Add gamification elements
  private addGamification(
    segments: ResponseSegment[],
    context?: any
  ): {
    segments: ResponseSegment[];
    achievements: Achievement[];
    xp: number;
    celebration?: CelebrationEvent;
  } {
    const achievements: Achievement[] = [];
    let totalXP = 10; // Base XP for interaction
    let celebration: CelebrationEvent | undefined;
    
    // Check for achievement triggers
    const fullContent = segments.map(s => s.content).join(' ');
    
    ACHIEVEMENT_PATTERNS.forEach(({ pattern, achievement }) => {
      if (pattern.test(fullContent)) {
        achievements.push(achievement);
        totalXP += achievement.xpValue;
      }
    });
    
    // Award XP based on interaction quality
    if (context?.userMessage) {
      const messageLength = context.userMessage.length;
      if (messageLength > 100) {
        totalXP += 15; // Thoughtful question bonus
      }
      if (context.userMessage.includes('?')) {
        totalXP += 5; // Curiosity bonus
      }
    }
    
    // Check for milestone celebrations
    if (context?.messagesCount && context.messagesCount % 10 === 0) {
      celebration = {
        type: 'milestone',
        message: `🎊 ${context.messagesCount} messages! You're on fire!`,
        animation: 'confetti',
        sound: 'achievement.mp3',
        duration: 3000,
      };
      totalXP += 25;
    }
    
    // Streak bonus
    if (context?.currentStreak && context.currentStreak > 0) {
      if (context.currentStreak % 5 === 0) {
        celebration = {
          type: 'streak',
          message: `🔥 ${context.currentStreak} day streak! Incredible dedication!`,
          animation: 'fire',
          sound: 'streak.mp3',
          duration: 4000,
        };
        totalXP += context.currentStreak * 5;
      }
    }
    
    // Add celebration segment if triggered
    if (celebration) {
      segments.push({
        type: 'celebration',
        content: celebration.message,
        emoji: '🎉',
        highlight: true,
      });
    }
    
    return {
      segments,
      achievements,
      xp: totalXP,
      celebration,
    };
  }

  // Extract key learning points
  private extractLearningPoints(content: string): string[] {
    const points: string[] = [];
    
    // Look for key learning indicators
    const patterns = [
      /learn(?:ed|ing)?\s+(?:about\s+)?([^.!?]+)/gi,
      /understand(?:ing)?\s+([^.!?]+)/gi,
      /discover(?:ed|ing)?\s+([^.!?]+)/gi,
      /explore(?:d|ing)?\s+([^.!?]+)/gi,
      /practice(?:d|ing)?\s+([^.!?]+)/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          points.push(match[1].trim());
        }
      }
    });
    
    // Also extract topics from headers or emphasized text
    const emphasizedPattern = /\*\*([^*]+)\*\*/g;
    const emphasized = content.matchAll(emphasizedPattern);
    for (const match of emphasized) {
      points.push(match[1].trim());
    }
    
    return [...new Set(points)].slice(0, 5); // Return unique points, max 5
  }

  // Generate parent report
  private generateParentReport(
    content: string,
    learningPoints: string[],
    context?: any
  ): ParentReport {
    const topics = this.extractTopics(content);
    const strengths = this.identifyStrengths(content, context);
    const areasForSupport = this.identifyAreasForSupport(content);
    const notableQuotes = this.extractNotableQuotes(content);
    
    const engagementLevel = this.assessEngagement(context);
    
    return {
      sessionDate: new Date(),
      topicsDiscussed: topics,
      keyLearningPoints: learningPoints,
      strengthsShown: strengths,
      areasForSupport,
      engagementLevel,
      recommendedFollowUp: this.generateFollowUpRecommendations(topics, areasForSupport),
      notableQuotes,
    };
  }

  // Extract topics discussed
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    
    // Module-specific topic patterns
    const topicPatterns: Record<string, RegExp[]> = {
      science: [
        /\b(experiment|hypothesis|observation|data|conclusion)\b/gi,
        /\b(plant|animal|ecosystem|habitat|environment)\b/gi,
        /\b(energy|force|motion|light|sound)\b/gi,
      ],
      math: [
        /\b(multiplication|division|fraction|decimal|geometry)\b/gi,
        /\b(problem|equation|calculate|measure|estimate)\b/gi,
        /\b(pattern|sequence|graph|data|chart)\b/gi,
      ],
      stories: [
        /\b(character|plot|setting|dialogue|narrative)\b/gi,
        /\b(beginning|middle|end|conflict|resolution)\b/gi,
        /\b(describe|imagine|create|write|tell)\b/gi,
      ],
      world: [
        /\b(country|continent|ocean|culture|tradition)\b/gi,
        /\b(map|geography|climate|population|resource)\b/gi,
        /\b(history|explorer|discovery|civilization|landmark)\b/gi,
      ],
      entrepreneur: [
        /\b(business|product|service|customer|market)\b/gi,
        /\b(profit|cost|price|budget|investment)\b/gi,
        /\b(idea|solution|problem|innovation|plan)\b/gi,
      ],
    };
    
    const patterns = topicPatterns[this.module] || topicPatterns.science;
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        topics.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    return [...new Set(topics)].slice(0, 5);
  }

  // Identify strengths shown
  private identifyStrengths(content: string, context?: any): string[] {
    const strengths: string[] = [];
    
    // Check for positive indicators in content
    if (/great|excellent|wonderful|fantastic/i.test(content)) {
      strengths.push('Strong understanding demonstrated');
    }
    
    if (/creative|unique|innovative/i.test(content)) {
      strengths.push('Creative thinking');
    }
    
    if (/correct|right|exactly/i.test(content)) {
      strengths.push('Accurate problem-solving');
    }
    
    // Check context for engagement indicators
    if (context?.userMessage) {
      if (context.userMessage.includes('?')) {
        strengths.push('Asking thoughtful questions');
      }
      if (context.userMessage.length > 100) {
        strengths.push('Detailed responses');
      }
    }
    
    if (context?.messagesCount > 10) {
      strengths.push('Sustained engagement');
    }
    
    return strengths;
  }

  // Identify areas needing support
  private identifyAreasForSupport(content: string): string[] {
    const areas: string[] = [];
    
    // Look for struggle indicators
    if (/let's try again|another way|different approach/i.test(content)) {
      areas.push('May need additional practice with current concept');
    }
    
    if (/remember to|don't forget|important to/i.test(content)) {
      areas.push('Key concepts to reinforce');
    }
    
    if (/break.*down|step.*by.*step|slowly/i.test(content)) {
      areas.push('Complex topics requiring gradual approach');
    }
    
    return areas;
  }

  // Extract notable quotes
  private extractNotableQuotes(content: string): string[] {
    const quotes: string[] = [];
    
    // Look for questions or interesting statements
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (sentence.includes('?') || 
          sentence.includes('!') || 
          /amazing|wonderful|creative|excellent/i.test(sentence)) {
        if (sentence.length > 20 && sentence.length < 150) {
          quotes.push(sentence.trim());
        }
      }
    });
    
    return quotes.slice(0, 3);
  }

  // Assess engagement level
  private assessEngagement(context?: any): 'high' | 'medium' | 'low' {
    if (!context) return 'medium';
    
    const factors = {
      messageLength: context.userMessage?.length || 0,
      sessionDuration: context.sessionDuration || 0,
      messagesCount: context.messagesCount || 0,
    };
    
    let score = 0;
    
    if (factors.messageLength > 50) score++;
    if (factors.messageLength > 100) score++;
    if (factors.sessionDuration > 10) score++;
    if (factors.messagesCount > 5) score++;
    if (factors.messagesCount > 10) score++;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // Generate follow-up recommendations
  private generateFollowUpRecommendations(
    topics: string[],
    areasForSupport: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Topic-based recommendations
    topics.forEach(topic => {
      recommendations.push(`Continue exploring ${topic} with hands-on activities`);
    });
    
    // Support-based recommendations
    if (areasForSupport.length > 0) {
      recommendations.push('Review concepts with additional practice problems');
      recommendations.push('Use visual aids and manipulatives for complex topics');
    }
    
    // Module-specific recommendations
    const moduleRecs: Record<string, string[]> = {
      science: ['Try a home experiment related to today\'s topic', 'Watch educational videos about the concept'],
      math: ['Practice with real-world math problems', 'Use math games for reinforcement'],
      stories: ['Encourage creative writing exercises', 'Read related stories together'],
      world: ['Explore maps and globes together', 'Research countries discussed'],
      entrepreneur: ['Create a simple business plan', 'Practice pitch presentations'],
    };
    
    recommendations.push(...(moduleRecs[this.module] || []));
    
    return recommendations.slice(0, 3);
  }

  // Create interactive elements
  private createInteractiveElements(content: string): InteractiveElement[] {
    const elements: InteractiveElement[] = [];
    
    // Add follow-up question buttons
    if (content.includes('?')) {
      const questions = content.match(/[^.!?]*\?/g) || [];
      questions.slice(0, 3).forEach(question => {
        elements.push({
          type: 'button',
          label: question.trim(),
          action: 'ask_question',
          icon: '❓',
          data: { question: question.trim() },
        });
      });
    }
    
    // Add "Try this" activities
    if (/try this|let's try|experiment|activity/i.test(content)) {
      elements.push({
        type: 'button',
        label: 'Start Activity',
        action: 'start_activity',
        icon: '🎯',
      });
    }
    
    // Add drawing prompt if relevant
    if (/draw|sketch|design|create/i.test(content)) {
      elements.push({
        type: 'drawing',
        label: 'Draw Your Answer',
        action: 'open_drawing',
        icon: '🎨',
      });
    }
    
    // Add voice reading option
    elements.push({
      type: 'voice',
      label: 'Read Aloud',
      action: 'read_aloud',
      icon: '🔊',
    });
    
    // Add "Show me more" option
    elements.push({
      type: 'button',
      label: 'Tell me more!',
      action: 'expand_topic',
      icon: '➕',
    });
    
    return elements;
  }

  // Assess reading level
  private assessReadingLevel(content: string): number {
    // Simple Flesch-Kincaid approximation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);
    
    if (sentences.length === 0 || words.length === 0) return 4;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Simplified grade level calculation
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    // Clamp to reasonable range for Max
    return Math.max(1, Math.min(8, Math.round(gradeLevel)));
  }

  // Count syllables in a word (simplified)
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) {
      count--;
    }
    
    // Ensure at least 1 syllable
    return Math.max(1, count);
  }

  // Compile segments back into enhanced content
  private compileContent(segments: ResponseSegment[]): string {
    return segments.map(segment => {
      let compiled = segment.content;
      
      // Add formatting based on segment type
      switch (segment.type) {
        case 'didYouKnow':
          compiled = `\n💡 **Did You Know?**\n${compiled}\n`;
          break;
        case 'tryThis':
          compiled = `\n🎯 **Try This!**\n${compiled}\n`;
          break;
        case 'definition':
          compiled = `📖 ${compiled}`;
          break;
        case 'celebration':
          compiled = `\n🎉 **${compiled}** 🎉\n`;
          break;
        default:
          if (segment.highlight) {
            compiled = `**${compiled}**`;
          }
      }
      
      return compiled;
    }).join('\n\n');
  }
}

// Export singleton instance
let processorInstance: ResponseProcessor | null = null;

export function getResponseProcessor(module: string = 'general'): ResponseProcessor {
  if (!processorInstance || processorInstance['module'] !== module) {
    processorInstance = new ResponseProcessor(module);
  }
  return processorInstance;
}

// Helper function to format response for UI
export function formatForUI(processed: ProcessedResponse): {
  displayContent: string;
  badges: Array<{ icon: string; label: string; value: string | number }>;
  actions: InteractiveElement[];
} {
  const badges = [
    { icon: '⭐', label: 'XP Earned', value: processed.xpAwarded },
    { icon: '📚', label: 'Reading Level', value: `Grade ${processed.readingLevel}` },
    { icon: '🎯', label: 'Learning Points', value: processed.learningPoints.length },
  ];
  
  // Add achievement badges
  processed.achievements.forEach(achievement => {
    badges.push({
      icon: achievement.icon,
      label: achievement.name,
      value: `+${achievement.xpValue} XP`,
    });
  });
  
  return {
    displayContent: processed.enhancedContent,
    badges,
    actions: processed.interactiveElements,
  };
}

export default ResponseProcessor;