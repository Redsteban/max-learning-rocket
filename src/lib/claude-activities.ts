// Interactive Activities Generator for Max (Age 9, Grade 4)
import { MODULE_TUTORS, calculateXP } from './tutor-prompts';

// Types and Interfaces
export interface Activity {
  id: string;
  type: 'challenge' | 'project' | 'exploration' | 'quiz' | 'game';
  module: string;
  title: string;
  description: string;
  instructions: string[];
  materialsNeeded?: string[];
  estimatedTime: number; // in minutes
  xpReward: number;
  successCriteria: string[];
  encouragementMessages: string[];
  hintsAvailable: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  completionStatus?: 'not_started' | 'in_progress' | 'completed';
  currentStep?: number;
  userResponses?: string[];
  score?: number;
}

export interface ActivityProgress {
  activityId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  responses: string[];
  hintsUsed: number;
  xpEarned: number;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  xpValue: number;
}

// Quick Challenges (2-5 minutes)
const QUICK_CHALLENGES = {
  science: [
    {
      title: "🔬 Science Speed Facts!",
      description: "How many science facts can you get right in 2 minutes?",
      instructions: [
        "I'll give you a science fact",
        "You tell me if it's TRUE or FALSE",
        "Quick answers get bonus points!",
        "Ready? Let's go!"
      ],
      estimatedTime: 2,
      xpReward: 30,
      examples: [
        "Octopuses have three hearts (TRUE)",
        "Sound travels faster in water than air (TRUE)",
        "Plants can grow without sunlight (FALSE)",
        "Victoria has tides because of the moon (TRUE)"
      ]
    },
    {
      title: "⚗️ Experiment Predictor!",
      description: "Predict what happens in these experiments!",
      instructions: [
        "I'll describe a simple experiment",
        "You predict what will happen",
        "Explain your thinking",
        "Let's see if you're right!"
      ],
      estimatedTime: 5,
      xpReward: 40
    }
  ],
  math: [
    {
      title: "🎯 Multiplication Lightning Round!",
      description: "How fast can you solve these multiplication problems?",
      instructions: [
        "10 multiplication problems coming up",
        "30 seconds per problem",
        "Use any method you like",
        "Bonus XP for beating the clock!"
      ],
      estimatedTime: 5,
      xpReward: 50
    },
    {
      title: "🍕 Fraction Pizza Party!",
      description: "Help share pizzas fairly using fractions!",
      instructions: [
        "I'll give you a pizza sharing problem",
        "Tell me how to divide it fairly",
        "Draw or describe your solution",
        "Make sure everyone gets equal pieces!"
      ],
      estimatedTime: 3,
      xpReward: 35
    }
  ],
  stories: [
    {
      title: "📝 Story Starter Sprint!",
      description: "Create an amazing story opening in 3 minutes!",
      instructions: [
        "I'll give you three random elements",
        "Write a story opening using all three",
        "Make it exciting and mysterious",
        "Grammar doesn't have to be perfect - creativity counts!"
      ],
      estimatedTime: 3,
      xpReward: 40
    },
    {
      title: "🎭 Character Voice Challenge!",
      description: "Create unique voices for different characters!",
      instructions: [
        "I'll describe a character",
        "Write 3 lines of dialogue in their voice",
        "Make each character sound different",
        "Have fun with accents and personalities!"
      ],
      estimatedTime: 5,
      xpReward: 35
    }
  ],
  world: [
    {
      title: "🗺️ Geography Detective!",
      description: "Solve geography mysteries with clues!",
      instructions: [
        "I'll give you 3 clues about a place",
        "Guess the country or city",
        "Ask yes/no questions if stuck",
        "Learn fun facts along the way!"
      ],
      estimatedTime: 3,
      xpReward: 30
    },
    {
      title: "🌍 Culture Match Game!",
      description: "Match traditions to their countries!",
      instructions: [
        "I'll describe a tradition or food",
        "You guess which country it's from",
        "Learn about different cultures",
        "Discover connections to Victoria!"
      ],
      estimatedTime: 4,
      xpReward: 35
    }
  ],
  entrepreneur: [
    {
      title: "💡 Problem Spotter Challenge!",
      description: "Find problems that need solving!",
      instructions: [
        "Look around your room",
        "Find 3 things that could be improved",
        "Describe the problem clearly",
        "Bonus: suggest a solution!"
      ],
      estimatedTime: 5,
      xpReward: 45
    },
    {
      title: "📊 Price It Right!",
      description: "Figure out fair prices for kid businesses!",
      instructions: [
        "I'll describe a product or service",
        "Calculate costs and fair price",
        "Explain your reasoning",
        "Think about what customers would pay!"
      ],
      estimatedTime: 4,
      xpReward: 40
    }
  ]
};

// Guided Projects (15-30 minutes)
const GUIDED_PROJECTS = {
  science: [
    {
      title: "🚀 Design a Submarine for Victoria's Waters!",
      description: "Create a submarine to explore the Salish Sea!",
      instructions: [
        "Step 1: Draw your submarine design",
        "Step 2: List special features for seeing marine life",
        "Step 3: How does it move underwater?",
        "Step 4: Safety features for the crew",
        "Step 5: Name your submarine!",
        "Step 6: Plan your first mission"
      ],
      materialsNeeded: ["Paper", "Pencil", "Colored pencils (optional)"],
      estimatedTime: 20,
      xpReward: 100,
      hintsAvailable: [
        "Think about how fish move underwater",
        "Windows need to be super strong",
        "How do real submarines get air?"
      ]
    },
    {
      title: "🌱 Create a New Plant Species!",
      description: "Invent a plant that could survive in BC!",
      instructions: [
        "Step 1: Choose your plant's habitat",
        "Step 2: Design special adaptations",
        "Step 3: Draw your plant",
        "Step 4: Explain how it survives winter",
        "Step 5: What animals depend on it?",
        "Step 6: Give it a scientific name!"
      ],
      estimatedTime: 25,
      xpReward: 90
    }
  ],
  math: [
    {
      title: "🏗️ Design Your Dream Playground!",
      description: "Use math to plan the perfect playground!",
      instructions: [
        "Step 1: Draw a rectangle for your space (20m x 30m)",
        "Step 2: Divide it into zones (use fractions)",
        "Step 3: Calculate area for each zone",
        "Step 4: List equipment with prices",
        "Step 5: Calculate total cost",
        "Step 6: Check it fits the $10,000 budget!"
      ],
      materialsNeeded: ["Graph paper", "Ruler", "Calculator"],
      estimatedTime: 30,
      xpReward: 120
    }
  ],
  stories: [
    {
      title: "📚 Create a Comic Strip Adventure!",
      description: "Tell a story in 6 comic panels!",
      instructions: [
        "Step 1: Create your main character",
        "Step 2: Give them a problem to solve",
        "Step 3: Draw 6 panels (stick figures OK!)",
        "Step 4: Add speech bubbles",
        "Step 5: Create a surprising ending",
        "Step 6: Give your comic a title!"
      ],
      materialsNeeded: ["Paper", "Pencil", "Ruler for panels"],
      estimatedTime: 25,
      xpReward: 100
    }
  ],
  world: [
    {
      title: "🏝️ Create Your Own Country!",
      description: "Design a new country from scratch!",
      instructions: [
        "Step 1: Draw your country's map",
        "Step 2: Choose location and climate",
        "Step 3: Design the flag",
        "Step 4: Create 3 laws everyone follows",
        "Step 5: Invent a national holiday",
        "Step 6: Write the national anthem (4 lines)!"
      ],
      estimatedTime: 30,
      xpReward: 110
    }
  ],
  entrepreneur: [
    {
      title: "💼 Build a Lemonade Stand Business!",
      description: "Plan every detail of your business!",
      instructions: [
        "Step 1: Choose your special recipe",
        "Step 2: Calculate costs per cup",
        "Step 3: Set your price",
        "Step 4: Design a poster",
        "Step 5: Plan your first day",
        "Step 6: Predict your profit!"
      ],
      estimatedTime: 20,
      xpReward: 100
    }
  ]
};

// Exploration Activities (Full Session)
const EXPLORATIONS = {
  science: {
    ocean: {
      title: "🌊 Deep Dive: Ocean Exploration!",
      description: "Explore the mysteries of the ocean near Victoria!",
      phases: [
        "Ocean zones and what lives there",
        "Orcas and their families",
        "How tides work in Victoria",
        "Design an ocean cleanup invention",
        "Create an ocean conservation poster"
      ],
      estimatedTime: 45,
      xpReward: 200
    },
    space: {
      title: "🌌 Journey to Space!",
      description: "Blast off on a space adventure!",
      phases: [
        "Design your spaceship",
        "Visit each planet",
        "Discover alien life",
        "Solve space problems",
        "Return to Earth with discoveries"
      ],
      estimatedTime: 40,
      xpReward: 180
    }
  },
  math: {
    city: {
      title: "🏙️ Math City Mayor!",
      description: "Use math to run your city!",
      phases: [
        "Plan the city layout",
        "Budget for services",
        "Solve traffic problems",
        "Design a park system",
        "Calculate population growth"
      ],
      estimatedTime: 35,
      xpReward: 170
    }
  }
};

// Activity Generator Class
export class ActivityGenerator {
  private currentActivity: Activity | null = null;
  private activityHistory: Map<string, ActivityProgress[]> = new Map();

  // Generate activity based on command
  generateActivity(
    command: string,
    module: string,
    userId: string,
    userLevel: number = 1
  ): Activity | null {
    const [cmd, ...args] = command.toLowerCase().split(' ');
    
    switch (cmd) {
      case '!challenge':
        return this.generateChallenge(module, args[0]);
      case '!project':
        return this.generateProject(module);
      case '!explore':
        return this.generateExploration(module, args.join(' '));
      case '!quiz':
        return this.generateQuiz(module, userLevel);
      case '!game':
        return this.generateGame(module);
      default:
        return null;
    }
  }

  // Generate a quick challenge
  private generateChallenge(module: string, type?: string): Activity {
    const challenges = QUICK_CHALLENGES[module as keyof typeof QUICK_CHALLENGES] || QUICK_CHALLENGES.science;
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      id: `challenge-${Date.now()}`,
      type: 'challenge',
      module,
      title: challenge.title,
      description: challenge.description,
      instructions: challenge.instructions,
      estimatedTime: challenge.estimatedTime,
      xpReward: challenge.xpReward,
      successCriteria: [
        "Complete within time limit",
        "Show your thinking",
        "Have fun!"
      ],
      encouragementMessages: [
        "You're doing great! 🌟",
        "Keep going, almost there! 💪",
        "Fantastic thinking! 🎯",
        "You're on fire! 🔥"
      ],
      hintsAvailable: [
        "Take your time to think",
        "Break it into smaller parts",
        "What do you already know about this?"
      ],
      difficulty: 'medium',
      completionStatus: 'not_started',
      currentStep: 0
    };
  }

  // Generate a guided project
  private generateProject(module: string): Activity {
    const projects = GUIDED_PROJECTS[module as keyof typeof GUIDED_PROJECTS] || GUIDED_PROJECTS.science;
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    return {
      id: `project-${Date.now()}`,
      type: 'project',
      module,
      title: project.title,
      description: project.description,
      instructions: project.instructions,
      materialsNeeded: project.materialsNeeded,
      estimatedTime: project.estimatedTime,
      xpReward: project.xpReward,
      successCriteria: [
        "Complete all steps",
        "Show creativity",
        "Explain your choices"
      ],
      encouragementMessages: [
        "Great start! Let's keep building! 🏗️",
        "Your ideas are amazing! ✨",
        "This is coming together beautifully! 🎨",
        "You're a natural at this! 🌟"
      ],
      hintsAvailable: project.hintsAvailable || [],
      difficulty: 'medium',
      completionStatus: 'not_started',
      currentStep: 0
    };
  }

  // Generate an exploration activity
  private generateExploration(module: string, topic: string): Activity {
    const explorations = EXPLORATIONS[module as keyof typeof EXPLORATIONS];
    if (!explorations) {
      return this.generateProject(module); // Fallback to project
    }
    
    const exploration = explorations[topic as keyof typeof explorations] || 
                       explorations[Object.keys(explorations)[0]];
    
    return {
      id: `exploration-${Date.now()}`,
      type: 'exploration',
      module,
      title: exploration.title,
      description: exploration.description,
      instructions: exploration.phases,
      estimatedTime: exploration.estimatedTime,
      xpReward: exploration.xpReward,
      successCriteria: [
        "Explore each phase thoroughly",
        "Ask questions along the way",
        "Make connections to what you know",
        "Share your discoveries"
      ],
      encouragementMessages: [
        "What an explorer you are! 🗺️",
        "Your curiosity is inspiring! 🔍",
        "Amazing discoveries, Max! 🎯",
        "You're learning so much! 🚀"
      ],
      hintsAvailable: [
        "Connect this to Victoria",
        "Think about real-world examples",
        "How would you explain this to a friend?"
      ],
      difficulty: 'hard',
      completionStatus: 'not_started',
      currentStep: 0
    };
  }

  // Generate an adaptive quiz
  private generateQuiz(module: string, userLevel: number): Activity {
    const difficulty = userLevel < 3 ? 'easy' : userLevel < 7 ? 'medium' : 'hard';
    
    return {
      id: `quiz-${Date.now()}`,
      type: 'quiz',
      module,
      title: `🎯 ${module.charAt(0).toUpperCase() + module.slice(1)} Quiz Challenge!`,
      description: "Test your knowledge with fun questions!",
      instructions: [
        "Answer 10 questions",
        "Take your time - no rush!",
        "Hints available if needed",
        "Learn from explanations"
      ],
      estimatedTime: 10,
      xpReward: 60,
      successCriteria: [
        "Answer all questions",
        "Learn from any mistakes",
        "Score doesn't matter - learning does!"
      ],
      encouragementMessages: [
        "Great thinking! 🤔",
        "You're getting it! 💡",
        "Excellent reasoning! 🌟",
        "Learning champion! 🏆"
      ],
      hintsAvailable: [
        "Eliminate obviously wrong answers",
        "Think about what we learned",
        "Break down the question"
      ],
      difficulty,
      completionStatus: 'not_started',
      currentStep: 0
    };
  }

  // Generate an educational game
  private generateGame(module: string): Activity {
    const games = {
      science: {
        title: "🧪 Science Lab Escape Room!",
        description: "Solve science puzzles to escape!",
        instructions: [
          "Solve puzzle 1: Mix the right chemicals",
          "Solve puzzle 2: Balance the equation",
          "Solve puzzle 3: Identify the mystery element",
          "Solve puzzle 4: Fix the broken circuit",
          "Final challenge: Create the antidote!"
        ]
      },
      math: {
        title: "🎮 Math Quest Adventure!",
        description: "Use math skills to defeat the number dragon!",
        instructions: [
          "Level 1: Cross the multiplication bridge",
          "Level 2: Unlock the fraction fortress",
          "Level 3: Navigate the geometry maze",
          "Level 4: Solve the word problem riddle",
          "Boss Battle: Defeat the number dragon!"
        ]
      },
      stories: {
        title: "📖 Story Builder Challenge!",
        description: "Build an epic story piece by piece!",
        instructions: [
          "Round 1: Create your hero",
          "Round 2: Describe the magical world",
          "Round 3: Introduce the villain",
          "Round 4: The big conflict",
          "Round 5: Epic conclusion!"
        ]
      },
      world: {
        title: "🗺️ Around the World Race!",
        description: "Race around the world solving geo-challenges!",
        instructions: [
          "Stop 1: Navigate through Canada",
          "Stop 2: Cross the Pacific Ocean",
          "Stop 3: Explore Asia",
          "Stop 4: Journey through Europe",
          "Stop 5: Return home to Victoria!"
        ]
      },
      entrepreneur: {
        title: "💰 Business Tycoon Challenge!",
        description: "Build your business empire!",
        instructions: [
          "Stage 1: Start with $100",
          "Stage 2: Choose your first product",
          "Stage 3: Make your first sale",
          "Stage 4: Expand your business",
          "Stage 5: Become a millionaire!"
        ]
      }
    };
    
    const game = games[module as keyof typeof games] || games.science;
    
    return {
      id: `game-${Date.now()}`,
      type: 'game',
      module,
      title: game.title,
      description: game.description,
      instructions: game.instructions,
      estimatedTime: 15,
      xpReward: 80,
      successCriteria: [
        "Complete all levels",
        "Collect bonus points",
        "Have fun learning!"
      ],
      encouragementMessages: [
        "Level up! 🎮",
        "Power-up activated! ⚡",
        "High score incoming! 🏆",
        "You're unstoppable! 🚀"
      ],
      hintsAvailable: [
        "Use what you learned today",
        "Think strategically",
        "Every mistake teaches something"
      ],
      difficulty: 'medium',
      completionStatus: 'not_started',
      currentStep: 0
    };
  }

  // Process activity step completion
  processActivityStep(
    activity: Activity,
    stepResponse: string,
    currentStep: number
  ): {
    feedback: string;
    nextStep?: string;
    completed: boolean;
    xpEarned: number;
    celebration?: string;
  } {
    const totalSteps = activity.instructions.length;
    const isLastStep = currentStep >= totalSteps - 1;
    
    // Calculate XP for this step
    const stepXP = Math.floor(activity.xpReward / totalSteps);
    
    // Generate feedback
    const feedback = this.generateStepFeedback(activity, stepResponse, currentStep);
    
    // Check if completed
    if (isLastStep) {
      return {
        feedback,
        completed: true,
        xpEarned: stepXP + 10, // Bonus for completion
        celebration: this.generateCelebration(activity)
      };
    }
    
    return {
      feedback,
      nextStep: activity.instructions[currentStep + 1],
      completed: false,
      xpEarned: stepXP
    };
  }

  // Generate feedback for a step
  private generateStepFeedback(
    activity: Activity,
    response: string,
    step: number
  ): string {
    const encouragements = activity.encouragementMessages;
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    const feedbackTemplates = [
      `${randomEncouragement} Your ${activity.type} is looking great!`,
      `Excellent work on step ${step + 1}! ${randomEncouragement}`,
      `I love how you approached that! ${randomEncouragement}`,
      `Creative thinking! ${randomEncouragement} Let's keep going!`
    ];
    
    return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
  }

  // Generate celebration message
  private generateCelebration(activity: Activity): string {
    const celebrations = [
      `🎉 AMAZING! You completed "${activity.title}"! You earned ${activity.xpReward} XP!`,
      `🌟 SUPERSTAR! "${activity.title}" is complete! ${activity.xpReward} XP is yours!`,
      `🚀 INCREDIBLE! You mastered "${activity.title}"! Plus ${activity.xpReward} XP!`,
      `🏆 CHAMPION! "${activity.title}" conquered! ${activity.xpReward} XP earned!`,
      `✨ BRILLIANT! You finished "${activity.title}"! Enjoy your ${activity.xpReward} XP!`
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  // Get hint for current activity
  getHint(activity: Activity, hintIndex: number = 0): string {
    if (hintIndex >= activity.hintsAvailable.length) {
      return "You're doing great! Trust your instincts!";
    }
    
    return activity.hintsAvailable[hintIndex];
  }

  // Save activity progress
  saveProgress(
    userId: string,
    activity: Activity,
    progress: Partial<ActivityProgress>
  ): void {
    const userHistory = this.activityHistory.get(userId) || [];
    
    const activityProgress: ActivityProgress = {
      activityId: activity.id,
      userId,
      startedAt: progress.startedAt || new Date(),
      currentStep: progress.currentStep || 0,
      responses: progress.responses || [],
      hintsUsed: progress.hintsUsed || 0,
      xpEarned: progress.xpEarned || 0,
      ...progress
    };
    
    userHistory.push(activityProgress);
    this.activityHistory.set(userId, userHistory);
  }

  // Get user's activity history
  getUserHistory(userId: string): ActivityProgress[] {
    return this.activityHistory.get(userId) || [];
  }

  // Generate activity suggestions based on time and energy
  suggestActivity(
    module: string,
    timeAvailable: number,
    energyLevel: 'high' | 'medium' | 'low'
  ): string[] {
    const suggestions: string[] = [];
    
    if (timeAvailable <= 5 && energyLevel === 'high') {
      suggestions.push("!challenge - Quick brain teaser!");
    } else if (timeAvailable <= 5 && energyLevel === 'low') {
      suggestions.push("!quiz easy - Gentle review quiz");
    } else if (timeAvailable <= 30 && energyLevel === 'medium') {
      suggestions.push("!project - Fun creative project!");
    } else if (timeAvailable > 30 && energyLevel === 'high') {
      suggestions.push("!explore - Deep dive adventure!");
    } else {
      suggestions.push("!game - Educational game time!");
    }
    
    return suggestions;
  }
}

// Activity command parser
export function parseActivityCommand(message: string): {
  isCommand: boolean;
  command?: string;
  args?: string[];
} {
  if (!message.startsWith('!')) {
    return { isCommand: false };
  }
  
  const parts = message.slice(1).split(' ');
  return {
    isCommand: true,
    command: parts[0],
    args: parts.slice(1)
  };
}

// Generate activity prompt for Claude
export function generateActivityPrompt(activity: Activity): string {
  return `
ACTIVITY GUIDE MODE ACTIVATED! 🎮

You are now guiding Max through: "${activity.title}"

Activity Type: ${activity.type}
Module: ${activity.module}
Time Estimate: ${activity.estimatedTime} minutes
XP Reward: ${activity.xpReward}

Current Step: ${(activity.currentStep || 0) + 1} of ${activity.instructions.length}

CURRENT INSTRUCTION:
${activity.instructions[activity.currentStep || 0]}

Your role:
1. Guide Max enthusiastically through this step
2. Ask clarifying questions if needed
3. Celebrate progress with encouragement
4. Provide hints only if Max asks or seems stuck
5. Keep the energy high and fun!
6. When step is complete, move to next step

Materials needed: ${activity.materialsNeeded?.join(', ') || 'Just your imagination!'}

Success criteria:
${activity.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Remember: Make this feel like an adventure, not homework! Max is 9 years old and loves to learn through play!
`;
}

// Export singleton instance
let activityGeneratorInstance: ActivityGenerator | null = null;

export function getActivityGenerator(): ActivityGenerator {
  if (!activityGeneratorInstance) {
    activityGeneratorInstance = new ActivityGenerator();
  }
  return activityGeneratorInstance;
}

export default ActivityGenerator;