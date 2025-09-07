/**
 * Fallback Tutor System
 * Provides educational content when Claude is unavailable
 */

interface FallbackLesson {
  id: string;
  module: string;
  title: string;
  content: string;
  activities: FallbackActivity[];
  xpReward: number;
}

interface FallbackActivity {
  type: 'quiz' | 'practice' | 'video' | 'game' | 'experiment';
  content: any;
  xpReward: number;
}

export class FallbackTutor {
  private lessons: Map<string, FallbackLesson[]> = new Map();
  private practiceProblems: Map<string, any[]> = new Map();
  private educationalVideos: Map<string, string[]> = new Map();
  private miniGames: Map<string, any[]> = new Map();

  constructor() {
    this.initializeFallbackContent();
  }

  /**
   * Initialize all fallback content
   */
  private initializeFallbackContent(): void {
    // Science content
    this.lessons.set('science', [
      {
        id: 'sci_fallback_1',
        module: 'science',
        title: 'Amazing Animal Facts! 🦁',
        content: `Let's explore some incredible animal superpowers while Claude is away!
        
        Did you know:
        • Dolphins have names for each other! They use special whistles 🐬
        • Butterflies taste with their feet! 🦋
        • A snail can sleep for 3 years! 🐌
        • Sharks existed before trees! 🦈`,
        activities: [
          {
            type: 'quiz',
            content: {
              question: 'Which animal can sleep for 3 years?',
              options: ['Dolphin', 'Butterfly', 'Snail', 'Shark'],
              correct: 2,
              explanation: 'Snails can hibernate for up to 3 years if the weather is not right!'
            },
            xpReward: 10
          },
          {
            type: 'experiment',
            content: {
              title: 'Animal Movement Challenge',
              instructions: [
                'Try moving like different animals!',
                'Hop like a frog 10 times',
                'Slither like a snake across the room',
                'Flap your arms like a bird',
                'Walk sideways like a crab'
              ]
            },
            xpReward: 15
          }
        ],
        xpReward: 25
      },
      {
        id: 'sci_fallback_2',
        module: 'science',
        title: 'Weather Wonder Lab ⛈️',
        content: `Let's be weather scientists! Here in Victoria, we have special weather.
        
        Weather Facts:
        • Clouds are made of tiny water droplets ☁️
        • Lightning creates thunder by heating air super fast ⚡
        • Rainbows need sun AND rain to appear 🌈
        • Victoria gets less rain than Vancouver! 🌂`,
        activities: [
          {
            type: 'practice',
            content: {
              title: 'Weather Journal',
              task: 'Look outside and draw today\'s weather. Is it sunny, cloudy, or rainy?',
              bonus: 'Predict tomorrow\'s weather like a meteorologist!'
            },
            xpReward: 20
          }
        ],
        xpReward: 30
      }
    ]);

    // Math content
    this.lessons.set('math', [
      {
        id: 'math_fallback_1',
        module: 'math',
        title: 'Number Ninja Training! 🥷',
        content: `Time to practice your ninja math skills!
        
        Quick Math Tricks:
        • To multiply by 10, just add a zero! (5 × 10 = 50)
        • Even numbers always end in 0, 2, 4, 6, or 8
        • The sum of digits in 9's times tables always equals 9!`,
        activities: [
          {
            type: 'practice',
            content: {
              problems: [
                { question: '7 + 8 = ?', answer: 15 },
                { question: '12 - 5 = ?', answer: 7 },
                { question: '3 × 4 = ?', answer: 12 },
                { question: '20 ÷ 4 = ?', answer: 5 }
              ]
            },
            xpReward: 5
          },
          {
            type: 'game',
            content: {
              title: 'Math Bingo',
              description: 'Create a 3x3 grid with numbers 1-20. Roll dice and mark off sums!'
            },
            xpReward: 15
          }
        ],
        xpReward: 30
      }
    ]);

    // Stories content
    this.lessons.set('stories', [
      {
        id: 'story_fallback_1',
        module: 'stories',
        title: 'Story Builder Workshop 📚',
        content: `Let's create amazing stories together!
        
        Story Starters:
        • "The day my pet became magical..."
        • "I found a secret door in my room that led to..."
        • "If I could fly for one day, I would..."
        • "The talking tree told me a secret..."`,
        activities: [
          {
            type: 'practice',
            content: {
              title: 'Character Creator',
              task: 'Design a hero for your story! Draw them and write 3 special abilities they have.'
            },
            xpReward: 20
          },
          {
            type: 'quiz',
            content: {
              question: 'What makes a story exciting?',
              options: ['A problem to solve', 'Interesting characters', 'A surprise ending', 'All of these!'],
              correct: 3,
              explanation: 'Great stories have all these elements!'
            },
            xpReward: 10
          }
        ],
        xpReward: 35
      }
    ]);

    // World content
    this.lessons.set('world', [
      {
        id: 'world_fallback_1',
        module: 'world',
        title: 'Victoria Explorer Badge! 🏔️',
        content: `Let's explore our amazing city and province!
        
        Cool Victoria Facts:
        • We live on Vancouver Island, not the mainland! 🏝️
        • The Empress Hotel serves 500,000 cups of tea yearly! ☕
        • We can see Orcas from the shore! 🐋
        • Beacon Hill Park has a petting zoo! 🐐`,
        activities: [
          {
            type: 'quiz',
            content: {
              question: 'What ocean is beside Victoria?',
              options: ['Atlantic', 'Pacific', 'Arctic', 'Indian'],
              correct: 1,
              explanation: 'Victoria is on the Pacific Ocean!'
            },
            xpReward: 10
          },
          {
            type: 'practice',
            content: {
              title: 'Map Your Neighborhood',
              task: 'Draw a map of your street. Mark your house, a friend\'s house, and your favorite place!'
            },
            xpReward: 20
          }
        ],
        xpReward: 30
      }
    ]);

    // Entrepreneur content
    this.lessons.set('entrepreneur', [
      {
        id: 'biz_fallback_1',
        module: 'entrepreneur',
        title: 'Young Inventor Lab! 💡',
        content: `Every great business starts with solving a problem!
        
        Business Basics for Kids:
        • Find a problem people have
        • Think of a creative solution
        • Make it fun and useful
        • Share it with others!`,
        activities: [
          {
            type: 'practice',
            content: {
              title: 'Invention Time',
              task: 'Design a new toy! Draw it and explain what makes it special.',
              questions: [
                'What problem does it solve?',
                'Who would want it?',
                'What would you call it?'
              ]
            },
            xpReward: 25
          },
          {
            type: 'game',
            content: {
              title: 'Lemonade Stand Math',
              scenario: 'You sell lemonade for $2. If 5 people buy, how much do you earn?',
              bonus: 'If supplies cost $6, what\'s your profit?'
            },
            xpReward: 15
          }
        ],
        xpReward: 40
      }
    ]);

    // Initialize practice problems bank
    this.initializePracticeProblems();
    
    // Initialize video links (YouTube Kids approved)
    this.initializeEducationalVideos();
    
    // Initialize mini-games
    this.initializeMiniGames();
  }

  /**
   * Initialize practice problems
   */
  private initializePracticeProblems(): void {
    this.practiceProblems.set('math', [
      {
        type: 'word_problem',
        question: 'Max has 24 stickers. He gives 8 to his friend. How many does he have left?',
        answer: 16,
        hint: 'Try subtracting: 24 - 8 = ?',
        xp: 10
      },
      {
        type: 'pattern',
        question: 'Complete the pattern: 2, 4, 6, 8, __',
        answer: 10,
        hint: 'Each number increases by 2!',
        xp: 10
      },
      {
        type: 'geometry',
        question: 'How many sides does a hexagon have?',
        answer: 6,
        hint: 'Hex means six!',
        xp: 10
      }
    ]);

    this.practiceProblems.set('science', [
      {
        type: 'true_false',
        question: 'Plants need sunlight to make food.',
        answer: true,
        explanation: 'This process is called photosynthesis!',
        xp: 10
      },
      {
        type: 'classification',
        question: 'Is a spider an insect?',
        answer: false,
        explanation: 'Spiders are arachnids! They have 8 legs, insects have 6.',
        xp: 10
      }
    ]);
  }

  /**
   * Initialize educational video links
   */
  private initializeEducationalVideos(): void {
    // These would be actual YouTube Kids or educational platform links
    this.educationalVideos.set('science', [
      'How Do Volcanoes Work? - Science for Kids',
      'The Water Cycle Song',
      'Animal Habitats for Kids'
    ]);

    this.educationalVideos.set('math', [
      'Multiplication Tables Songs',
      'Fractions Made Easy',
      'Geometry Shapes Song'
    ]);
  }

  /**
   * Initialize mini-games
   */
  private initializeMiniGames(): void {
    this.miniGames.set('general', [
      {
        id: 'countdown',
        name: 'Countdown Challenge',
        description: 'Count backwards from 30 while doing jumping jacks!',
        duration: 30,
        xpReward: 10
      },
      {
        id: 'memory',
        name: 'Memory Master',
        description: 'Remember this sequence: 🍎🌟🚀🎨. Now close your eyes and repeat!',
        xpReward: 15
      },
      {
        id: 'rhyme_time',
        name: 'Rhyme Time',
        description: 'Think of 5 words that rhyme with "play"!',
        xpReward: 10
      }
    ]);
  }

  /**
   * Get fallback response for a module
   */
  async getFallbackResponse(module: string, lastTopic?: string): Promise<{
    message: string;
    activity?: any;
    xpReward: number;
    isOfflineContent: boolean;
  }> {
    const lessons = this.lessons.get(module) || this.lessons.get('science');
    const randomLesson = lessons![Math.floor(Math.random() * lessons!.length)];

    return {
      message: `🎮 **Offline Adventure Mode Activated!**\n\n${randomLesson.content}\n\nLet's do some fun activities while Claude is getting ready!`,
      activity: randomLesson.activities[0],
      xpReward: randomLesson.xpReward,
      isOfflineContent: true
    };
  }

  /**
   * Get a random practice problem
   */
  getRandomProblem(module: string): any {
    const problems = this.practiceProblems.get(module) || [];
    if (problems.length === 0) return null;
    
    return problems[Math.floor(Math.random() * problems.length)];
  }

  /**
   * Get mini-game for waiting periods
   */
  getMiniGame(): any {
    const games = this.miniGames.get('general') || [];
    if (games.length === 0) return null;
    
    return games[Math.floor(Math.random() * games.length)];
  }

  /**
   * Check answer for offline quiz
   */
  checkAnswer(questionId: string, answer: any): {
    correct: boolean;
    explanation: string;
    xpAwarded: number;
  } {
    // Implementation would check against stored answers
    // For now, return a sample response
    return {
      correct: true,
      explanation: "Great job! You're amazing even when Claude is away!",
      xpAwarded: 10
    };
  }

  /**
   * Get progress recovery content
   */
  getRecoveryContent(sessionData: any): string {
    return `🎉 **Welcome back, adventurer!**

Claude is back and ready to continue! While I was away, you:
• Earned ${sessionData.offlineXP || 0} XP in offline mode
• Completed ${sessionData.offlineActivities || 0} activities
• Kept your ${sessionData.streak || 0} day streak alive!

Let's pick up right where we left off! What would you like to explore?`;
  }
}

// Singleton instance
export const fallbackTutor = new FallbackTutor();