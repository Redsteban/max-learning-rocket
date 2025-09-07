/**
 * Session Recovery & Continuity System
 * Maintains learning progress during errors and disconnections
 */

interface RecoveryState {
  sessionId: string;
  studentId: string;
  module: string;
  timestamp: Date;
  messages: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
  currentActivity?: any;
  xpProgress: {
    sessionXP: number;
    totalXP: number;
    pendingXP: number; // XP earned during offline
  };
  streak: {
    current: number;
    lastActive: Date;
    maintained: boolean;
  };
  queuedMessages: string[];
  offlineActivities: any[];
  lastTopics: string[];
}

export class SessionRecovery {
  private static readonly STORAGE_KEY = 'max_session_recovery';
  private static readonly STREAK_GRACE_PERIOD = 24 * 60 * 60 * 1000; // 24 hours
  private recoveryState: Map<string, RecoveryState> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startAutoSave();
  }

  /**
   * Save current session state
   */
  saveSession(sessionId: string, data: Partial<RecoveryState>): void {
    const existing = this.recoveryState.get(sessionId) || this.createEmptyState(sessionId);
    
    const updated: RecoveryState = {
      ...existing,
      ...data,
      timestamp: new Date()
    };

    // Maintain streak during outages
    if (this.shouldMaintainStreak(existing.streak.lastActive)) {
      updated.streak.maintained = true;
    }

    this.recoveryState.set(sessionId, updated);
    this.persistToStorage();
  }

  /**
   * Recover session after error/disconnect
   */
  recoverSession(sessionId: string): RecoveryState | null {
    const state = this.recoveryState.get(sessionId);
    
    if (!state) {
      return null;
    }

    // Check if session is still valid (within 1 hour)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (state.timestamp < hourAgo) {
      return null;
    }

    return state;
  }

  /**
   * Add message to queue during offline
   */
  queueMessage(sessionId: string, message: string): void {
    const state = this.recoveryState.get(sessionId);
    if (state) {
      state.queuedMessages.push(message);
      this.saveSession(sessionId, state);
    }
  }

  /**
   * Record offline activity completion
   */
  recordOfflineActivity(sessionId: string, activity: any, xpEarned: number): void {
    const state = this.recoveryState.get(sessionId);
    if (state) {
      state.offlineActivities.push({
        ...activity,
        completedAt: new Date(),
        xpEarned
      });
      state.xpProgress.pendingXP += xpEarned;
      this.saveSession(sessionId, state);
    }
  }

  /**
   * Get recovery summary for UI
   */
  getRecoverySummary(sessionId: string): {
    canRecover: boolean;
    summary: string;
    data?: RecoveryState;
  } {
    const state = this.recoverSession(sessionId);
    
    if (!state) {
      return {
        canRecover: false,
        summary: "Let's start a fresh adventure!"
      };
    }

    const queuedCount = state.queuedMessages.length;
    const offlineCount = state.offlineActivities.length;
    const pendingXP = state.xpProgress.pendingXP;

    let summary = "🎉 Welcome back! ";
    
    if (pendingXP > 0) {
      summary += `You earned ${pendingXP} XP while away! `;
    }
    
    if (queuedCount > 0) {
      summary += `I saved ${queuedCount} of your messages. `;
    }
    
    if (offlineCount > 0) {
      summary += `You completed ${offlineCount} activities! `;
    }
    
    if (state.streak.maintained) {
      summary += `Your ${state.streak.current} day streak is safe! 🔥`;
    }

    return {
      canRecover: true,
      summary,
      data: state
    };
  }

  /**
   * Process recovery on reconnection
   */
  async processRecovery(sessionId: string, claudeApi: any): Promise<{
    success: boolean;
    processedMessages: number;
    xpAwarded: number;
    continuationMessage: string;
  }> {
    const state = this.recoverSession(sessionId);
    
    if (!state) {
      return {
        success: false,
        processedMessages: 0,
        xpAwarded: 0,
        continuationMessage: "Starting fresh session!"
      };
    }

    // Process queued messages
    let processedCount = 0;
    for (const message of state.queuedMessages) {
      try {
        await claudeApi.sendMessage(message, {
          sessionId,
          module: state.module,
          isRecovery: true
        });
        processedCount++;
      } catch (error) {
        console.error('Failed to process queued message:', error);
      }
    }

    // Award pending XP
    const xpToAward = state.xpProgress.pendingXP;

    // Generate continuation message
    const continuationMessage = this.generateContinuationMessage(state);

    // Clear processed data
    state.queuedMessages = [];
    state.xpProgress.pendingXP = 0;
    state.offlineActivities = [];
    this.saveSession(sessionId, state);

    return {
      success: true,
      processedMessages: processedCount,
      xpAwarded: xpToAward,
      continuationMessage
    };
  }

  /**
   * Generate friendly continuation message
   */
  private generateContinuationMessage(state: RecoveryState): string {
    const lastTopic = state.lastTopics[state.lastTopics.length - 1];
    const timeSinceLastActive = Date.now() - state.timestamp.getTime();
    const minutes = Math.floor(timeSinceLastActive / 60000);

    let message = "🚀 **Back to our adventure!**\n\n";

    if (minutes < 5) {
      message += "That was quick! ";
    } else if (minutes < 30) {
      message += "Welcome back! ";
    } else {
      message += "Great to see you again! ";
    }

    if (lastTopic) {
      message += `We were talking about ${lastTopic}. `;
    }

    if (state.currentActivity) {
      message += `You were working on "${state.currentActivity.title}". Want to continue or try something new?`;
    } else {
      message += "What would you like to explore next?";
    }

    return message;
  }

  /**
   * Check if streak should be maintained
   */
  private shouldMaintainStreak(lastActive: Date): boolean {
    const timeSince = Date.now() - lastActive.getTime();
    return timeSince < SessionRecovery.STREAK_GRACE_PERIOD;
  }

  /**
   * Create empty recovery state
   */
  private createEmptyState(sessionId: string): RecoveryState {
    return {
      sessionId,
      studentId: '',
      module: 'general',
      timestamp: new Date(),
      messages: [],
      xpProgress: {
        sessionXP: 0,
        totalXP: 0,
        pendingXP: 0
      },
      streak: {
        current: 0,
        lastActive: new Date(),
        maintained: false
      },
      queuedMessages: [],
      offlineActivities: [],
      lastTopics: []
    };
  }

  /**
   * Persist to localStorage
   */
  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.recoveryState.entries()).map(([key, value]) => ({
        key,
        value: {
          ...value,
          timestamp: value.timestamp.toISOString(),
          streak: {
            ...value.streak,
            lastActive: value.streak.lastActive.toISOString()
          }
        }
      }));

      localStorage.setItem(SessionRecovery.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist recovery state:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(SessionRecovery.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      data.forEach((item: any) => {
        const state = {
          ...item.value,
          timestamp: new Date(item.value.timestamp),
          streak: {
            ...item.value.streak,
            lastActive: new Date(item.value.streak.lastActive)
          }
        };
        this.recoveryState.set(item.key, state);
      });
    } catch (error) {
      console.error('Failed to load recovery state:', error);
    }
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.persistToStorage();
    }, 30000);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.persistToStorage();
  }

  /**
   * Clear old sessions (older than 7 days)
   */
  cleanupOldSessions(): void {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (const [sessionId, state] of this.recoveryState.entries()) {
      if (state.timestamp < weekAgo) {
        this.recoveryState.delete(sessionId);
      }
    }
    
    this.persistToStorage();
  }

  /**
   * Get streak status
   */
  getStreakStatus(sessionId: string): {
    current: number;
    isSafe: boolean;
    hoursRemaining: number;
  } {
    const state = this.recoveryState.get(sessionId);
    if (!state) {
      return { current: 0, isSafe: true, hoursRemaining: 24 };
    }

    const timeSince = Date.now() - state.streak.lastActive.getTime();
    const hoursRemaining = Math.max(0, 24 - Math.floor(timeSince / (60 * 60 * 1000)));
    const isSafe = timeSince < SessionRecovery.STREAK_GRACE_PERIOD;

    return {
      current: state.streak.current,
      isSafe,
      hoursRemaining
    };
  }
}

// Singleton instance
export const sessionRecovery = new SessionRecovery();

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionRecovery.destroy();
  });
}