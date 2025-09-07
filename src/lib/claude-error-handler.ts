/**
 * Claude API Error Handler & Fallback System
 * Child-friendly error handling for Max's learning adventure
 */

import { Activity } from './claude-activities';

// Error types we might encounter
export enum ErrorType {
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  NETWORK = 'network',
  API_KEY = 'api_key',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown'
}

// Child-friendly error messages
export const ERROR_MESSAGES: Record<ErrorType, {
  title: string;
  message: string;
  emoji: string;
  waitTime?: number; // in seconds
  showMiniGame?: boolean;
  parentAlert?: boolean;
}> = {
  [ErrorType.RATE_LIMIT]: {
    title: "Claude's Water Break! 💧",
    message: "Claude needs a quick water break! He'll be back in just 1 minute. Want to play a quick game while we wait?",
    emoji: "🚦",
    waitTime: 60,
    showMiniGame: true,
    parentAlert: false
  },
  [ErrorType.TIMEOUT]: {
    title: "Big Think Time! 🤔",
    message: "Wow, that's a tough one! Claude is thinking really hard. Let's try asking in a different way!",
    emoji: "⏰",
    waitTime: 0,
    showMiniGame: false,
    parentAlert: false
  },
  [ErrorType.NETWORK]: {
    title: "Space Explorer Mode! 🚀",
    message: "Claude might be exploring space! Let's check our internet connection and try again.",
    emoji: "📡",
    waitTime: 5,
    showMiniGame: true,
    parentAlert: false
  },
  [ErrorType.API_KEY]: {
    title: "Parent Help Needed",
    message: "We need a grown-up to help us reconnect to Claude. Press the parent button!",
    emoji: "🔑",
    waitTime: 0,
    showMiniGame: false,
    parentAlert: true
  },
  [ErrorType.MAINTENANCE]: {
    title: "Super Power Upgrade! ⚡",
    message: "Claude is getting new super powers! He'll be back soon with even cooler abilities!",
    emoji: "🛠️",
    waitTime: 300,
    showMiniGame: true,
    parentAlert: true
  },
  [ErrorType.UNKNOWN]: {
    title: "Silly Hiccup! 🎪",
    message: "Something silly happened! Let's shake it off and try again. Ready?",
    emoji: "🤷",
    waitTime: 3,
    showMiniGame: false,
    parentAlert: false
  }
};

// Fallback content for offline mode
export interface FallbackContent {
  id: string;
  type: 'quiz' | 'fact' | 'joke' | 'challenge' | 'video';
  module: string;
  content: any;
  xpReward: number;
}

// Error handler class
export class ClaudeErrorHandler {
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private messageQueue: Array<{ message: string; timestamp: Date }> = [];
  private isOfflineMode: boolean = false;
  private lastSuccessfulConnection: Date = new Date();
  private savedProgress: Map<string, any> = new Map();

  constructor() {
    // Initialize error handler
    this.setupNetworkListener();
    this.loadSavedProgress();
  }

  /**
   * Handle API errors with child-friendly responses
   */
  async handleError(error: any, context?: {
    module?: string;
    sessionId?: string;
    message?: string;
  }): Promise<{
    errorType: ErrorType;
    fallbackResponse?: any;
    shouldRetry: boolean;
    waitTime: number;
    showUI: boolean;
  }> {
    const errorType = this.classifyError(error);
    const errorConfig = ERROR_MESSAGES[errorType];

    // Save current progress
    if (context?.sessionId) {
      this.saveProgress(context.sessionId, context);
    }

    // Queue message if network issue
    if (context?.message && this.shouldQueueMessage(errorType)) {
      this.messageQueue.push({
        message: context.message,
        timestamp: new Date()
      });
    }

    // Notify parent if needed
    if (errorConfig.parentAlert) {
      this.notifyParent(errorType, error);
    }

    // Get fallback content if needed
    let fallbackResponse;
    if (this.shouldUseFallback(errorType)) {
      fallbackResponse = await this.getFallbackContent(context?.module || 'general');
    }

    // Determine if we should retry
    const shouldRetry = this.shouldRetryRequest(errorType);
    if (shouldRetry) {
      this.retryCount++;
    }

    return {
      errorType,
      fallbackResponse,
      shouldRetry,
      waitTime: errorConfig.waitTime || 0,
      showUI: true
    };
  }

  /**
   * Classify the error type
   */
  private classifyError(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    // Check for rate limit
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return ErrorType.RATE_LIMIT;
    }

    // Check for timeout
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return ErrorType.TIMEOUT;
    }

    // Check for network issues
    if (error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' || 
        !navigator.onLine) {
      return ErrorType.NETWORK;
    }

    // Check for API key issues
    if (error.status === 401 || error.status === 403) {
      return ErrorType.API_KEY;
    }

    // Check for maintenance
    if (error.status === 503) {
      return ErrorType.MAINTENANCE;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Retry logic with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await fn();
        this.retryCount = 0; // Reset on success
        this.lastSuccessfulConnection = new Date();
        return result;
      } catch (error) {
        if (attempt === maxAttempts - 1) throw error;
        
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.wait(waitTime);
      }
    }
    throw new Error('Max retry attempts reached');
  }

  /**
   * Get fallback content when Claude is unavailable
   */
  async getFallbackContent(module: string): Promise<FallbackContent> {
    const fallbackBank = this.getFallbackBank(module);
    const randomIndex = Math.floor(Math.random() * fallbackBank.length);
    return fallbackBank[randomIndex];
  }

  /**
   * Fallback content bank
   */
  private getFallbackBank(module: string): FallbackContent[] {
    const generalContent: FallbackContent[] = [
      {
        id: 'fb1',
        type: 'fact',
        module: 'general',
        content: {
          fact: "Did you know? Octopuses have three hearts! 🐙",
          followUp: "Two pump blood to the gills, and one pumps blood to the body!"
        },
        xpReward: 5
      },
      {
        id: 'fb2',
        type: 'joke',
        module: 'general',
        content: {
          setup: "Why don't scientists trust atoms?",
          punchline: "Because they make up everything! 😄"
        },
        xpReward: 5
      },
      {
        id: 'fb3',
        type: 'quiz',
        module: 'general',
        content: {
          question: "What's the largest planet in our solar system?",
          options: ["Earth", "Jupiter", "Saturn", "Mars"],
          correct: 1,
          explanation: "Jupiter is huge! You could fit all the other planets inside it!"
        },
        xpReward: 10
      }
    ];

    const moduleSpecific: Record<string, FallbackContent[]> = {
      science: [
        {
          id: 'sci1',
          type: 'challenge',
          module: 'science',
          content: {
            title: "Water Detective 💧",
            challenge: "Find 3 things in your room that contain water!",
            hint: "Think about plants, drinks, or even your body!"
          },
          xpReward: 15
        },
        {
          id: 'sci2',
          type: 'fact',
          module: 'science',
          content: {
            fact: "Lightning is 5 times hotter than the surface of the sun! ⚡",
            experiment: "Draw what you think lightning looks like!"
          },
          xpReward: 10
        }
      ],
      math: [
        {
          id: 'math1',
          type: 'quiz',
          module: 'math',
          content: {
            question: "If you have 12 cookies and share them equally with 3 friends, how many does each person get?",
            answer: 4,
            visual: "🍪🍪🍪 🍪🍪🍪 🍪🍪🍪 🍪🍪🍪"
          },
          xpReward: 10
        },
        {
          id: 'math2',
          type: 'challenge',
          module: 'math',
          content: {
            title: "Shape Hunter 🔺",
            challenge: "Count how many rectangles you can see in your room!",
            bonus: "Extra XP if you find more than 10!"
          },
          xpReward: 15
        }
      ],
      stories: [
        {
          id: 'story1',
          type: 'challenge',
          module: 'stories',
          content: {
            title: "Story Starter ✏️",
            prompt: "Continue this story: The magical pencil could draw anything that came to life...",
            tips: "What would you draw first?"
          },
          xpReward: 20
        }
      ],
      world: [
        {
          id: 'world1',
          type: 'fact',
          module: 'world',
          content: {
            fact: "Victoria BC has the mildest climate in Canada! 🌸",
            localConnection: "That's why we can see flowers blooming even in winter!"
          },
          xpReward: 10
        }
      ],
      entrepreneur: [
        {
          id: 'biz1',
          type: 'challenge',
          module: 'entrepreneur',
          content: {
            title: "Business Idea Machine 💡",
            challenge: "Think of a problem you have and invent something to solve it!",
            example: "Like a robot that finds lost socks!"
          },
          xpReward: 20
        }
      ]
    };

    return [
      ...generalContent,
      ...(moduleSpecific[module] || [])
    ];
  }

  /**
   * Save progress during error
   */
  private saveProgress(sessionId: string, data: any): void {
    this.savedProgress.set(sessionId, {
      ...data,
      timestamp: new Date(),
      messageQueue: this.messageQueue
    });
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `max_progress_${sessionId}`,
        JSON.stringify(data)
      );
    }
  }

  /**
   * Load saved progress
   */
  private loadSavedProgress(): void {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('max_progress_'));
      keys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const sessionId = key.replace('max_progress_', '');
          this.savedProgress.set(sessionId, data);
        } catch (e) {
          console.error('Failed to load saved progress:', e);
        }
      });
    }
  }

  /**
   * Get recovery data for session
   */
  getRecoveryData(sessionId: string): any {
    return this.savedProgress.get(sessionId);
  }

  /**
   * Process queued messages after reconnection
   */
  async processQueuedMessages(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    // Process each queued message
    for (const msg of messages) {
      // Implementation would send these to Claude API
      console.log('Processing queued message:', msg);
    }
  }

  /**
   * Setup network listener
   */
  private setupNetworkListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOfflineMode = false;
        this.processQueuedMessages();
      });

      window.addEventListener('offline', () => {
        this.isOfflineMode = true;
      });
    }
  }

  /**
   * Check if we should queue the message
   */
  private shouldQueueMessage(errorType: ErrorType): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.RATE_LIMIT,
      ErrorType.MAINTENANCE
    ].includes(errorType);
  }

  /**
   * Check if we should use fallback content
   */
  private shouldUseFallback(errorType: ErrorType): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.MAINTENANCE,
      ErrorType.RATE_LIMIT
    ].includes(errorType);
  }

  /**
   * Check if we should retry the request
   */
  private shouldRetryRequest(errorType: ErrorType): boolean {
    if (this.retryCount >= this.maxRetries) return false;
    
    return [
      ErrorType.TIMEOUT,
      ErrorType.UNKNOWN,
      ErrorType.NETWORK
    ].includes(errorType);
  }

  /**
   * Notify parent dashboard
   */
  private notifyParent(errorType: ErrorType, error: any): void {
    if (typeof window !== 'undefined') {
      // Send to parent dashboard
      const event = new CustomEvent('claude-error', {
        detail: {
          errorType,
          error,
          timestamp: new Date()
        }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Wait utility
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get offline activities
   */
  getOfflineActivities(module: string): Activity[] {
    // Return pre-loaded activities that don't require Claude
    return [
      {
        id: 'offline1',
        type: 'challenge',
        title: 'Drawing Challenge',
        description: 'Draw your favorite animal and write 3 facts about it!',
        instructions: [
          'Get paper and coloring supplies',
          'Draw your favorite animal',
          'Write 3 cool facts about it',
          'Show someone your awesome work!'
        ],
        module,
        difficulty: 'easy',
        estimatedTime: 15,
        xpReward: 20,
        requiresClaudeResponse: false
      },
      {
        id: 'offline2',
        type: 'game',
        title: 'Math Scavenger Hunt',
        description: 'Find numbers around your house!',
        instructions: [
          'Find something with the number 5 on it',
          'Count how many windows you have',
          'Find the biggest number you can see',
          'Add up all the numbers you found!'
        ],
        module: 'math',
        difficulty: 'easy',
        estimatedTime: 10,
        xpReward: 15,
        requiresClaudeResponse: false
      }
    ];
  }

  /**
   * Check if Claude is available
   */
  async checkClaudeStatus(): Promise<{
    available: boolean;
    estimatedWaitTime?: number;
    reason?: string;
  }> {
    try {
      // Ping Claude API health endpoint
      const response = await fetch('/api/claude/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { available: true };
      }

      const data = await response.json();
      return {
        available: false,
        estimatedWaitTime: data.estimatedWaitTime,
        reason: data.reason
      };
    } catch (error) {
      return {
        available: false,
        reason: 'Network error'
      };
    }
  }
}

// Singleton instance
export const errorHandler = new ClaudeErrorHandler();

// Helper function for components
export async function handleClaudeError(
  error: any,
  context?: any
): Promise<any> {
  return errorHandler.handleError(error, context);
}