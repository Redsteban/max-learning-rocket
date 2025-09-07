// Mock database using localStorage (no Prisma)
// This file provides database-like functions without requiring an actual database

interface User {
  id: string;
  username: string;
  name: string;
  role: 'child' | 'parent';
  grade?: number;
  avatar?: string;
  passwordHash?: string;
  picturePassword?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Progress {
  userId: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  lastActivityDate?: Date;
}

// Mock database storage (in production, this would use Supabase)
class MockDatabase {
  private users: Map<string, User> = new Map();
  private progress: Map<string, Progress> = new Map();

  constructor() {
    // Initialize with localStorage data if available
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('mock_users');
      const storedProgress = localStorage.getItem('mock_progress');
      
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        this.users = new Map(Object.entries(parsed));
      }
      
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);
        this.progress = new Map(Object.entries(parsed));
      }
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_users', JSON.stringify(Object.fromEntries(this.users)));
      localStorage.setItem('mock_progress', JSON.stringify(Object.fromEntries(this.progress)));
    }
  }

  async createUser(data: {
    username: string;
    name: string;
    role: 'child' | 'parent';
    grade?: number;
    avatar?: string;
    passwordHash?: string;
    picturePassword?: string[];
  }) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(userId, user);
    
    // Create progress record for the user
    const progress: Progress = {
      userId,
      level: 1,
      totalXP: 0,
      currentStreak: 0,
    };
    this.progress.set(userId, progress);
    
    this.save();
    
    return {
      ...user,
      progress,
    };
  }

  async findUserByUsername(username: string) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        const progress = this.progress.get(user.id);
        return { ...user, progress };
      }
    }
    return null;
  }

  async updateUserProgress(userId: string, data: Partial<Progress>) {
    const progress = this.progress.get(userId);
    if (progress) {
      Object.assign(progress, data);
      this.progress.set(userId, progress);
      this.save();
      return progress;
    }
    return null;
  }

  async getUserProgress(userId: string) {
    return this.progress.get(userId) || null;
  }
}

// Create singleton instance
const db = new MockDatabase();

// Export mock prisma object to maintain compatibility
export const prisma = {
  user: {
    create: async ({ data }: any) => db.createUser(data),
    findUnique: async ({ where }: any) => {
      if (where.username) {
        return db.findUserByUsername(where.username);
      }
      return null;
    },
  },
  progress: {
    update: async ({ where, data }: any) => {
      return db.updateUserProgress(where.userId, data);
    },
    findUnique: async ({ where }: any) => {
      return db.getUserProgress(where.userId);
    },
  },
};

// Export database functions
export async function createUser(data: {
  username: string;
  name: string;
  role: 'child' | 'parent';
  grade?: number;
  avatar?: string;
  passwordHash?: string;
  picturePassword?: string[];
}) {
  return db.createUser(data);
}

export async function findUserByUsername(username: string) {
  return db.findUserByUsername(username);
}

export async function updateUserProgress(userId: string, data: {
  level?: number;
  totalXP?: number;
  currentStreak?: number;
  lastActivityDate?: Date;
}) {
  return db.updateUserProgress(userId, data);
}

// Knowledge-related functions (simplified versions)
export async function getAdaptiveContent(userId: string, subject: string) {
  // Simplified adaptive content - in production, this would query Supabase
  const progress = await db.getUserProgress(userId);
  const level = progress?.level || 1;
  
  return {
    difficulty: Math.min(level, 5),
    topics: [`${subject} Level ${level}`],
    suggestedDuration: 15,
  };
}

export async function trackLearningProgress(userId: string, data: {
  subject: string;
  score: number;
  timeSpent: number;
  conceptsLearned: string[];
}) {
  // Simplified progress tracking
  const progress = await db.getUserProgress(userId);
  if (progress) {
    const xpEarned = Math.floor(data.score * 10);
    await db.updateUserProgress(userId, {
      totalXP: progress.totalXP + xpEarned,
      level: Math.floor((progress.totalXP + xpEarned) / 100) + 1,
      lastActivityDate: new Date(),
    });
  }
  
  return {
    xpEarned: Math.floor(data.score * 10),
    newLevel: progress ? Math.floor((progress.totalXP + Math.floor(data.score * 10)) / 100) + 1 : 1,
  };
}

export async function getPersonalizedContent(userId: string, subject: string) {
  // Simplified personalized content
  return getAdaptiveContent(userId, subject);
}

// Export the missing functions that the progress route needs
export async function getUserProgress(userId: string) {
  return db.getUserProgress(userId);
}

export async function updateProgress(userId: string, xpEarned: number, moduleId?: string) {
  const currentProgress = await db.getUserProgress(userId);
  if (!currentProgress) {
    return null;
  }
  
  const newTotalXP = currentProgress.totalXP + xpEarned;
  const newLevel = Math.floor(newTotalXP / 100) + 1;
  
  return db.updateUserProgress(userId, {
    totalXP: newTotalXP,
    level: newLevel,
    lastActivityDate: new Date(),
  });
}

export async function checkAndUnlockAchievements(userId: string) {
  // Simplified achievement checking
  const progress = await db.getUserProgress(userId);
  if (!progress) {
    return [];
  }
  
  const achievements = [];
  
  // Check for level-based achievements
  if (progress.level === 5) {
    achievements.push({
      id: 'level_5',
      name: 'Rising Star',
      description: 'Reached level 5',
      unlockedAt: new Date(),
    });
  }
  
  if (progress.level === 10) {
    achievements.push({
      id: 'level_10',
      name: 'Superstar',
      description: 'Reached level 10',
      unlockedAt: new Date(),
    });
  }
  
  // Check for XP milestones
  if (progress.totalXP >= 1000 && progress.totalXP < 1100) {
    achievements.push({
      id: 'xp_1000',
      name: 'XP Master',
      description: 'Earned 1000 XP',
      unlockedAt: new Date(),
    });
  }
  
  return achievements;
}