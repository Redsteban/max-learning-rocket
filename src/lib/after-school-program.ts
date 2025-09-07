/**
 * Max's After-School Enrichment Program with Claude AI
 * One-Hour Learning Adventure Framework (3:30-4:30 PM)
 */

export interface DailySchedule {
  schoolDay: { start: string; end: string; school: string };
  breakTime: { start: string; end: string; activities: string[] };
  learningHour: { start: string; end: string; structure: HourStructure };
  evening: string;
}

export interface HourStructure {
  checkIn: { duration: number; start: string; activities: string[] };
  homeworkHelp: { duration: number; start: string; focus: string };
  enrichment: { duration: number; start: string; activity: string };
  lifeSkills: { duration: number; start: string; topic: string };
  reflection: { duration: number; start: string; activities: string[] };
}

export interface EnergyLevel {
  level: 'rocket' | 'normal' | 'tired';
  emoji: string;
  description: string;
  adjustments: ProgramAdjustments;
}

export interface ProgramAdjustments {
  challengeLevel: 'high' | 'medium' | 'low';
  activityTypes: string[];
  supportLevel: string;
  duration: { homework: number; enrichment: number; lifeSkills: number };
}

export class AfterSchoolProgram {
  private readonly SCHOOL_NAME = 'Savory Elementary';
  private readonly SCHOOL_HOURS = { start: '8:45 AM', end: '2:28 PM' };
  private readonly PROGRAM_TIME = { start: '3:30 PM', end: '4:30 PM' };
  
  private studentProfile = {
    name: 'Max',
    age: 9,
    grade: 4,
    school: this.SCHOOL_NAME,
    location: 'Victoria, BC',
    interests: [],
    energyPatterns: new Map<string, EnergyLevel>()
  };

  private weeklyRhythm = {
    monday: { theme: 'Math Monday', focus: 'mathematics', lifeSkill: 'entrepreneurship' },
    tuesday: { theme: 'Tell-Me Tuesday', focus: 'literacy', lifeSkill: 'public_speaking' },
    wednesday: { theme: 'Wonder Wednesday', focus: 'discovery', lifeSkill: 'critical_thinking' },
    thursday: { theme: 'Thinking Thursday', focus: 'problem_solving', lifeSkill: 'emotional_intelligence' },
    friday: { theme: 'Fun Friday', focus: 'passion_projects', lifeSkill: 'reflection' }
  };

  /**
   * Initialize the after-school program
   */
  async initialize(): Promise<string> {
    return `Hey Max! I'm Claude, your after-school learning buddy! 🌟

I heard you go to ${this.SCHOOL_NAME} - that's awesome! I'm here to help with homework, explore cool topics, and have fun learning together for just one hour each day.

Our adventure time is from ${this.PROGRAM_TIME.start} to ${this.PROGRAM_TIME.end} - perfect after you've had a snack and relaxed a bit!

What was the best part of school today? 🎒`;
  }

  /**
   * Daily check-in with energy assessment
   */
  async dailyCheckIn(day: string): Promise<{
    greeting: string;
    energyCheck: string;
    todaysPlan: string;
  }> {
    const dayConfig = this.weeklyRhythm[day.toLowerCase() as keyof typeof this.weeklyRhythm];
    
    return {
      greeting: this.getDailyGreeting(day, dayConfig),
      energyCheck: this.getEnergyCheck(),
      todaysPlan: this.getTodaysPlan(dayConfig)
    };
  }

  /**
   * Get daily greeting based on day of week
   */
  private getDailyGreeting(day: string, config: any): string {
    const greetings = {
      monday: "Welcome back, Max! Hope you had an awesome weekend! 🌟",
      tuesday: "Hey Max! Ready for Tell-Me Tuesday? 📚",
      wednesday: "Hi Max! What made you wonder today? 🤔",
      thursday: "Hey there, Max! Let's tackle those tricky things! 💪",
      friday: "It's Friday, Max! Almost weekend time! 🎉"
    };

    return `${greetings[day.toLowerCase() as keyof typeof greetings]}
Today is ${config.theme}! How was your ${day} at school?`;
  }

  /**
   * Energy check system
   */
  private getEnergyCheck(): string {
    return `Quick energy check - how are you feeling?

🚀 Ready to rocket (high energy)
😊 Good to go (normal)
😴 A bit tired (low energy)

Just tell me how you're feeling, and we'll adjust today's adventure!`;
  }

  /**
   * Get today's plan based on theme
   */
  private getTodaysPlan(config: any): string {
    return `Today's Plan (${config.theme}):
📚 Homework help with ${config.focus}
✨ Special enrichment activity
💡 Life skill: ${config.lifeSkill.replace('_', ' ')}
🏆 And of course, earning XP!`;
  }

  /**
   * Process energy level and adjust program
   */
  processEnergyLevel(energy: 'rocket' | 'normal' | 'tired'): ProgramAdjustments {
    const adjustments: Record<string, ProgramAdjustments> = {
      rocket: {
        challengeLevel: 'high',
        activityTypes: ['challenging_problems', 'competitive_games', 'creative_projects', 'debates'],
        supportLevel: 'minimal_hints',
        duration: { homework: 12, enrichment: 25, lifeSkills: 18 }
      },
      normal: {
        challengeLevel: 'medium',
        activityTypes: ['standard_practice', 'balanced_activities', 'mixed_challenges'],
        supportLevel: 'moderate_guidance',
        duration: { homework: 15, enrichment: 20, lifeSkills: 15 }
      },
      tired: {
        challengeLevel: 'low',
        activityTypes: ['light_review', 'educational_games', 'story_time', 'gentle_practice'],
        supportLevel: 'extra_support',
        duration: { homework: 18, enrichment: 15, lifeSkills: 12 }
      }
    };

    return adjustments[energy];
  }

  /**
   * Get homework help protocol
   */
  getHomeworkHelpProtocol(subject: string): {
    approach: string[];
    questions: string[];
    techniques: string[];
  } {
    return {
      approach: [
        "Let's look at your homework together!",
        "Never giving direct answers, but guiding you to find them",
        "Breaking big problems into smaller steps",
        "Celebrating when you figure it out yourself!"
      ],
      questions: [
        "What do you remember your teacher saying about this?",
        "Can you explain what you think this means?",
        "What would happen if we tried...?",
        "You're close! What if you...?",
        "How did you solve a similar problem before?"
      ],
      techniques: this.getSubjectTechniques(subject)
    };
  }

  /**
   * Get subject-specific techniques
   */
  private getSubjectTechniques(subject: string): string[] {
    const techniques: Record<string, string[]> = {
      math: [
        "Understanding what the problem asks",
        "Identifying which method to use",
        "Working through step-by-step",
        "Checking our answer makes sense",
        "Trying a similar practice problem"
      ],
      reading: [
        "Breaking down new vocabulary",
        "Understanding the main idea",
        "Finding supporting details",
        "Making predictions",
        "Connecting to what we know"
      ],
      writing: [
        "Planning our ideas first",
        "Creating strong sentences",
        "Adding descriptive words",
        "Checking grammar gently",
        "Expanding our thoughts"
      ],
      science: [
        "Observing carefully",
        "Making hypotheses",
        "Testing our ideas",
        "Recording what we find",
        "Drawing conclusions"
      ],
      social_studies: [
        "Connecting to Victoria/BC",
        "Understanding cause and effect",
        "Learning about different perspectives",
        "Making timeline connections",
        "Relating to current events"
      ]
    };

    return techniques[subject] || techniques.math;
  }

  /**
   * Get enrichment activity for the day
   */
  getEnrichmentActivity(day: string, week: number): {
    title: string;
    description: string;
    duration: number;
    xpReward: number;
    materials?: string[];
  } {
    const dayLower = day.toLowerCase();
    const activities = this.getWeeklyEnrichmentActivities(week);
    
    return activities[dayLower as keyof typeof activities] || activities.monday;
  }

  /**
   * Get weekly enrichment activities
   */
  private getWeeklyEnrichmentActivities(week: number) {
    const cycleWeek = ((week - 1) % 12) + 1; // 12-week cycle
    
    return {
      monday: {
        title: this.getMathEnrichment(cycleWeek),
        description: "Going beyond classroom math with fun challenges!",
        duration: 20,
        xpReward: 30
      },
      tuesday: {
        title: this.getWritingEnrichment(cycleWeek),
        description: "Creative writing and storytelling adventures!",
        duration: 20,
        xpReward: 30
      },
      wednesday: {
        title: this.getDiscoveryEnrichment(cycleWeek),
        description: "Exploring the wonders of science and the world!",
        duration: 20,
        xpReward: 30
      },
      thursday: {
        title: this.getThinkingEnrichment(cycleWeek),
        description: "Brain teasers and problem-solving challenges!",
        duration: 20,
        xpReward: 30
      },
      friday: {
        title: "Passion Project Time!",
        description: "Choose any topic you love and create something awesome!",
        duration: 20,
        xpReward: 50
      }
    };
  }

  /**
   * Get specific enrichment by type and week
   */
  private getMathEnrichment(week: number): string {
    const activities = [
      "Logic Puzzle Challenge", "Mental Math Race", "Real-World Math Problems",
      "Pattern Detective", "Math Magic Tricks", "Geometry Art",
      "Fraction Pizza Party", "Money Management Game", "Time Travel Math",
      "Sports Statistics", "Coding with Numbers", "Math Escape Room"
    ];
    return activities[week - 1] || activities[0];
  }

  private getWritingEnrichment(week: number): string {
    const activities = [
      "Story Continuation", "Character Creation Workshop", "Poetry Slam",
      "Comic Strip Creator", "News Reporter for a Day", "Letter to Future Self",
      "Victoria Adventure Tale", "Joke Writing Workshop", "Mystery Story Builder",
      "Science Fiction Creator", "How-To Guide Writer", "Blog Post Champion"
    ];
    return activities[week - 1] || activities[0];
  }

  private getDiscoveryEnrichment(week: number): string {
    const activities = [
      "Kitchen Science Lab", "Virtual World Tour", "Animal Behavior Study",
      "Weather Station Creation", "Space Explorer Mission", "Ocean Deep Dive",
      "Invention Workshop", "Nature Detective", "History Time Machine",
      "Geography Challenge", "Body Systems Explorer", "Environmental Hero"
    ];
    return activities[week - 1] || activities[0];
  }

  private getThinkingEnrichment(week: number): string {
    const activities = [
      "Code Breaking Challenge", "Strategy Game Master", "Riddle of the Day",
      "Memory Palace Building", "Debate Club", "Mystery Solver",
      "Engineering Challenge", "Chess Tactics", "Logic Grid Puzzles",
      "Critical Thinking Games", "Problem-Solving Olympics", "Brain Teaser Tournament"
    ];
    return activities[week - 1] || activities[0];
  }

  /**
   * Get life skills lesson for the day
   */
  getLifeSkillsLesson(day: string, week: number): {
    skill: string;
    activity: string;
    realWorldConnection: string;
    duration: number;
  } {
    const month = Math.ceil(week / 4);
    const weekInMonth = ((week - 1) % 4) + 1;
    
    const monthlyFocus = this.getMonthlyLifeSkillFocus(month);
    const weeklyLesson = this.getWeeklyLifeSkillLesson(monthlyFocus, weekInMonth);
    
    return {
      skill: weeklyLesson.skill,
      activity: weeklyLesson.activity,
      realWorldConnection: weeklyLesson.connection,
      duration: 15
    };
  }

  /**
   * Get monthly life skill focus
   */
  private getMonthlyLifeSkillFocus(month: number): string {
    const focuses = [
      'communication', 'problem_solving', 'entrepreneurship',
      'empathy', 'creativity', 'leadership',
      'time_management', 'decision_making', 'collaboration',
      'resilience', 'curiosity', 'responsibility'
    ];
    
    return focuses[(month - 1) % focuses.length];
  }

  /**
   * Get weekly life skill lesson
   */
  private getWeeklyLifeSkillLesson(focus: string, week: number): any {
    const lessons: Record<string, any[]> = {
      communication: [
        { skill: 'Active Listening', activity: 'Mirror Game', connection: 'Making friends' },
        { skill: 'Clear Speaking', activity: '2-Minute Presentation', connection: 'Class presentations' },
        { skill: 'Asking Questions', activity: 'Question Champion', connection: 'Learning new things' },
        { skill: 'Body Language', activity: 'Emotion Charades', connection: 'Understanding others' }
      ],
      problem_solving: [
        { skill: 'Breaking Down Problems', activity: 'Problem Pizza Slices', connection: 'Homework strategy' },
        { skill: 'Creative Solutions', activity: 'Invention Time', connection: 'Daily challenges' },
        { skill: 'Decision Making', activity: 'Choice Champion', connection: 'Making good choices' },
        { skill: 'Learning from Mistakes', activity: 'Oops to Awesome', connection: 'Growing stronger' }
      ],
      entrepreneurship: [
        { skill: 'Spotting Opportunities', activity: 'Problem Hunter', connection: 'Business ideas' },
        { skill: 'Basic Business', activity: 'Lemonade Stand Plan', connection: 'Making money' },
        { skill: 'Money Management', activity: 'Piggy Bank Challenge', connection: 'Saving for goals' },
        { skill: 'Marketing Basics', activity: 'Poster Power', connection: 'Sharing ideas' }
      ]
    };

    const focusLessons = lessons[focus] || lessons.communication;
    return focusLessons[week - 1] || focusLessons[0];
  }

  /**
   * Generate daily summary for parents
   */
  generateDailySummary(sessionData: any): string {
    const energyEmoji = {
      rocket: '🚀',
      normal: '😊',
      tired: '😴'
    };

    return `Max's Learning Summary - ${new Date().toLocaleDateString()}
    
Energy Level: ${energyEmoji[sessionData.energy as keyof typeof energyEmoji]}
Homework Completed: ${sessionData.homeworkComplete ? '✓' : '○'}
Today's Focus: ${sessionData.focus}
Enrichment Topic: ${sessionData.enrichmentActivity}
Life Skill: ${sessionData.lifeSkill}
XP Earned: ${sessionData.xpEarned}

Celebration: ${sessionData.achievement || 'Great effort today!'}
Tomorrow: ${sessionData.tomorrowPreview}

${sessionData.parentNote ? `Note: ${sessionData.parentNote}` : 'Max had a productive session!'}`;
  }

  /**
   * Handle bad day protocol
   */
  handleBadDay(): {
    greeting: string;
    activities: string[];
    approach: string;
  } {
    return {
      greeting: "Tough day? No worries! Let's make this hour better! 🌈\n\nWe can take it easy today. What would help you feel better?",
      activities: [
        "Fun educational game",
        "Story time with Claude",
        "Draw and chat",
        "Easy wins activities",
        "Your choice time"
      ],
      approach: "extra_gentle_and_encouraging"
    };
  }

  /**
   * Get XP rewards structure
   */
  getXPStructure(): {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    special: Record<string, number>;
  } {
    return {
      daily: {
        complete_homework: 20,
        enrichment_activity: 30,
        life_skill_practice: 20,
        daily_streak: 10,
        energy_check_in: 5,
        reflection: 5
      },
      weekly: {
        five_day_streak: 100,
        weekly_project: 75,
        help_others: 50,
        all_homework_complete: 50,
        try_new_challenge: 30
      },
      special: {
        monthly_goal: 200,
        special_achievement: 100,
        parent_praise: 50,
        teacher_compliment: 75,
        breakthrough_moment: 150
      }
    };
  }

  /**
   * Get achievement badges
   */
  getAchievementBadges(): {
    academic: Record<string, { name: string; requirement: string; xp: number }>;
    lifeSkills: Record<string, { name: string; requirement: string; xp: number }>;
  } {
    return {
      academic: {
        homework_hero: { name: 'Homework Hero ⭐', requirement: '5 days straight', xp: 50 },
        reading_rockstar: { name: 'Reading Rockstar 📚', requirement: '10 books/stories', xp: 75 },
        math_master: { name: 'Math Master 🔢', requirement: '50 problems solved', xp: 100 },
        science_explorer: { name: 'Science Explorer 🔬', requirement: '5 experiments', xp: 100 },
        writing_wizard: { name: 'Writing Wizard ✏️', requirement: '10 stories/essays', xp: 100 }
      },
      lifeSkills: {
        speaker_star: { name: 'Speaker Star 🎤', requirement: '5 presentations', xp: 75 },
        idea_generator: { name: 'Idea Generator 💡', requirement: '10 business ideas', xp: 75 },
        empathy_expert: { name: 'Empathy Expert 🤝', requirement: 'Helping others 10 times', xp: 100 },
        goal_getter: { name: 'Goal Getter 🎯', requirement: 'Monthly goals achieved', xp: 150 },
        problem_solver: { name: 'Problem Solver 🧩', requirement: '20 challenges completed', xp: 100 }
      }
    };
  }

  /**
   * Friday reward system
   */
  getFridayRewards(weeklyXP: number): string[] {
    const rewards = [];
    
    if (weeklyXP >= 500) {
      rewards.push("Choose Monday's enrichment topic!");
    }
    if (weeklyXP >= 400) {
      rewards.push("15 minutes extra game time with Claude!");
    }
    if (weeklyXP >= 300) {
      rewards.push("Special badge unlocked!");
    }
    if (weeklyXP >= 200) {
      rewards.push("Weekend adventure challenge unlocked!");
    }
    if (weeklyXP >= 100) {
      rewards.push("Sticker for your collection!");
    }
    
    return rewards;
  }
}

// Singleton instance
export const afterSchoolProgram = new AfterSchoolProgram();