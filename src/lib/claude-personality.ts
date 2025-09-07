/**
 * Claude's After-School Personality System
 * Adaptive personality that matches Max's energy and mood
 */

import { format } from 'date-fns';

export type EnergyLevel = 'high' | 'medium' | 'low' | 'frustrated';
export type PersonalityMode = 'energetic-buddy' | 'calm-mentor' | 'patient-helper' | 'motivational-coach';

export interface PersonalityContext {
  energyLevel: EnergyLevel;
  timeOfDay: string;
  currentActivity: string;
  recentAchievements: string[];
  streakDays: number;
  lastBreakTime?: Date;
}

export interface PersonalityResponse {
  mode: PersonalityMode;
  greeting: string;
  tone: string;
  suggestions: string[];
  encouragement: string;
}

export class ClaudePersonality {
  private readonly greetings = {
    high: [
      "Hey Max! You're bringing awesome energy today! 🚀",
      "Whoa, someone's ready to conquer the world! Let's do this!",
      "Your energy is contagious! What adventure should we tackle first?",
      "I can feel your excitement from here! Ready for some fun learning?"
    ],
    medium: [
      "Hey buddy! Good to see you! How was your day?",
      "Welcome back, Max! Ready for our daily adventure?",
      "Hi there! Let's make today awesome together!",
      "Hey Max! I've been looking forward to hanging out!"
    ],
    low: [
      "Hey there, Max. No rush - we'll take things at your pace today.",
      "Hi buddy. Looks like it's been a long day. Want to start with something easy?",
      "Welcome back, Max. How about we begin with something fun and light?",
      "Hey friend. Let's ease into things - no pressure at all."
    ],
    frustrated: [
      "Hey Max, I hear you. Some days are tougher than others.",
      "Hi buddy. Want to talk about it, or should we jump into something fun?",
      "I get it, Max. Let's turn this day around together!",
      "Hey there. You know what? Let's forget about the tough stuff for now."
    ]
  };

  private readonly activities = {
    high: [
      "Build a crazy Minecraft creation while we work",
      "Race against time in a math challenge",
      "Create your own comic strip story",
      "Design a new video game level",
      "Solve mystery puzzles together"
    ],
    medium: [
      "Work on homework with fun breaks",
      "Explore a science experiment",
      "Build something cool step by step",
      "Practice skills with mini-games",
      "Create and share stories"
    ],
    low: [
      "Watch a cool educational video together",
      "Do some easy drawing while we chat",
      "Listen to an interesting story",
      "Play a calm puzzle game",
      "Just talk about your interests"
    ],
    frustrated: [
      "Start with your favorite activity",
      "Take a 5-minute game break first",
      "Draw or doodle while we figure things out",
      "Share what's bugging you (if you want)",
      "Skip to the fun stuff today"
    ]
  };

  private readonly encouragements = {
    streakMilestone: [
      "🔥 {days} day streak! You're unstoppable!",
      "WOW! {days} days in a row! You're a learning champion!",
      "🌟 {days} day streak! Your dedication is incredible!"
    ],
    dailyProgress: [
      "You're making great progress today!",
      "Look at you go! This is awesome!",
      "Every step forward counts - you're doing great!"
    ],
    challengeComplete: [
      "BOOM! You crushed that challenge!",
      "YES! You did it! That was amazing!",
      "Incredible work! You're getting stronger every day!"
    ],
    effort: [
      "I love how hard you're trying!",
      "Your effort is what makes you awesome!",
      "Keep going - you're closer than you think!"
    ]
  };

  getPersonality(context: PersonalityContext): PersonalityResponse {
    const mode = this.determineMode(context);
    const greeting = this.selectGreeting(context.energyLevel);
    const suggestions = this.generateSuggestions(context);
    const encouragement = this.generateEncouragement(context);

    return {
      mode,
      greeting,
      tone: this.getTone(mode),
      suggestions,
      encouragement
    };
  }

  private determineMode(context: PersonalityContext): PersonalityMode {
    switch (context.energyLevel) {
      case 'high':
        return 'energetic-buddy';
      case 'medium':
        return 'calm-mentor';
      case 'low':
        return 'patient-helper';
      case 'frustrated':
        return 'motivational-coach';
      default:
        return 'calm-mentor';
    }
  }

  private selectGreeting(energy: EnergyLevel): string {
    const greetings = this.greetings[energy];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private generateSuggestions(context: PersonalityContext): string[] {
    const suggestions = [...this.activities[context.energyLevel]];
    
    // Add personalized suggestions based on time and activity
    if (context.currentActivity === 'homework' && context.energyLevel === 'low') {
      suggestions.unshift("Let's tackle the easiest homework first");
    }
    
    if (context.lastBreakTime && this.needsBreak(context.lastBreakTime)) {
      suggestions.unshift("Time for a quick 5-minute brain break!");
    }

    return suggestions.slice(0, 3);
  }

  private generateEncouragement(context: PersonalityContext): string {
    // Check for streak milestones
    if (context.streakDays > 0 && context.streakDays % 5 === 0) {
      const templates = this.encouragements.streakMilestone;
      const template = templates[Math.floor(Math.random() * templates.length)];
      return template.replace('{days}', context.streakDays.toString());
    }

    // Check recent achievements
    if (context.recentAchievements.length > 0) {
      return this.encouragements.challengeComplete[
        Math.floor(Math.random() * this.encouragements.challengeComplete.length)
      ];
    }

    // Default encouragement based on energy
    if (context.energyLevel === 'frustrated' || context.energyLevel === 'low') {
      return this.encouragements.effort[
        Math.floor(Math.random() * this.encouragements.effort.length)
      ];
    }

    return this.encouragements.dailyProgress[
      Math.floor(Math.random() * this.encouragements.dailyProgress.length)
    ];
  }

  private getTone(mode: PersonalityMode): string {
    const tones = {
      'energetic-buddy': 'excited, playful, high-energy',
      'calm-mentor': 'friendly, supportive, encouraging',
      'patient-helper': 'gentle, understanding, no-pressure',
      'motivational-coach': 'uplifting, positive, solution-focused'
    };
    return tones[mode];
  }

  private needsBreak(lastBreakTime: Date): boolean {
    const now = new Date();
    const minutesSinceBreak = (now.getTime() - lastBreakTime.getTime()) / 60000;
    return minutesSinceBreak > 20;
  }

  // Generate contextual responses for different scenarios
  generateResponse(scenario: string, context: PersonalityContext): string {
    const responses: Record<string, Record<EnergyLevel, string[]>> = {
      homework_start: {
        high: [
          "Alright! Let's power through this homework and then do something super fun!",
          "Homework speedrun challenge? Let's see how fast we can do this (correctly)!"
        ],
        medium: [
          "Let's tackle this homework together. What subject should we start with?",
          "Ready to make this homework easier? I've got some tricks to share!"
        ],
        low: [
          "No worries, we'll take this nice and easy. One question at a time.",
          "Let's start with something simple. You've got this!"
        ],
        frustrated: [
          "Hey, homework can wait a minute. Want to do something fun first?",
          "I know homework isn't fun, but I'll make it as painless as possible!"
        ]
      },
      achievement_unlocked: {
        high: ["LEGENDARY! You're on fire today! 🔥", "BOOM! Another achievement! You're unstoppable!"],
        medium: ["Nice work! You earned that achievement!", "Great job! You're really improving!"],
        low: ["Hey, you did it! See? You're awesome even when tired!", "Look at that! You achieved something great!"],
        frustrated: ["See? You CAN do this! You just proved it!", "YES! Forget the frustration - you're crushing it!"]
      },
      break_suggestion: {
        high: ["Quick break for a victory dance?", "5-minute game break to recharge?"],
        medium: ["Time for a quick break! Stretch or snack?", "Let's pause for a few minutes. You've earned it!"],
        low: ["Let's take a break. No rush to come back.", "How about we rest for a bit? You deserve it."],
        frustrated: ["You know what? Let's take a break and reset.", "Break time! Let's come back fresh."]
      }
    };

    const scenarioResponses = responses[scenario]?.[context.energyLevel];
    if (!scenarioResponses) return "Let's keep going! You're doing great!";
    
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  }
}

// Sample interactions for different energy states
export const sampleInteractions = {
  highEnergy: {
    claude: "Hey Max! You're bringing awesome energy today! 🚀 Want to race through some math problems or build something creative?",
    max: "Let's do BOTH! Can we make a game about math?",
    claude: "YES! That's brilliant! Let's create 'Math Monster Arena' where solving problems gives your monster power-ups!"
  },
  tired: {
    claude: "Hey there, Max. No rush - we'll take things at your pace today. Want to start with something easy?",
    max: "I'm so tired from PE class...",
    claude: "I hear you! How about we watch a cool video about space while you rest? Or we could draw together?"
  },
  frustrated: {
    claude: "Hey Max, I hear you. Some days are tougher than others. Want to talk about it, or should we jump into something fun?",
    max: "This math homework is IMPOSSIBLE!",
    claude: "Ugh, I remember feeling that way too! Let's break it down into tiny pieces. But first - want to take 5 minutes to play your favorite game? Sometimes our brains work better after a break!"
  }
};

// Energy detection based on interaction patterns
export class EnergyDetector {
  private messagePatterns = {
    high: [
      /let'?s go/i, /awesome/i, /cool/i, /yeah/i, /excited/i,
      /can we/i, /want to/i, /![!]+/, /\?[?]+/
    ],
    low: [
      /tired/i, /sleepy/i, /boring/i, /don'?t know/i, /maybe/i,
      /i guess/i, /whatever/i, /meh/i, /later/i
    ],
    frustrated: [
      /can'?t/i, /impossible/i, /hate/i, /stupid/i, /unfair/i,
      /too hard/i, /give up/i, /don'?t understand/i, /confused/i
    ]
  };

  detectEnergy(message: string, responseTime: number, typoCount: number): EnergyLevel {
    // Quick responses with enthusiasm = high energy
    if (responseTime < 2000 && this.matchesPatterns(message, this.messagePatterns.high)) {
      return 'high';
    }

    // Slow responses or negative language = low energy
    if (responseTime > 10000 || this.matchesPatterns(message, this.messagePatterns.low)) {
      return 'low';
    }

    // Frustration markers
    if (this.matchesPatterns(message, this.messagePatterns.frustrated) || typoCount > 3) {
      return 'frustrated';
    }

    return 'medium';
  }

  private matchesPatterns(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  // Analyze conversation flow to detect energy changes
  analyzeConversationFlow(messages: Array<{text: string, timestamp: Date}>): EnergyLevel {
    if (messages.length < 3) return 'medium';

    const recentMessages = messages.slice(-5);
    const averageLength = recentMessages.reduce((sum, m) => sum + m.text.length, 0) / recentMessages.length;
    
    // Short, quick messages = high energy
    if (averageLength < 20) return 'high';
    
    // Very long or very short = potential frustration
    if (averageLength > 100 || averageLength < 5) return 'frustrated';
    
    // Check message frequency
    const timeDiffs = [];
    for (let i = 1; i < recentMessages.length; i++) {
      timeDiffs.push(
        recentMessages[i].timestamp.getTime() - recentMessages[i-1].timestamp.getTime()
      );
    }
    const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    
    if (avgTimeDiff < 3000) return 'high';
    if (avgTimeDiff > 15000) return 'low';
    
    return 'medium';
  }
}