export interface User {
  id: string;
  username: string;
  name: string;
  role: 'child' | 'parent';
  avatar?: string;
  grade?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  moduleProgress: ModuleProgress[];
  lastActiveAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'subject' | 'special';
  earnedAt: Date;
  xpReward: number;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completedLessons: number;
  totalLessons: number;
  masteryLevel: number;
  lastAccessedAt: Date;
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dayOfWeek: number;
  lessons: Lesson[];
  isAvailable: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'interactive' | 'quiz' | 'project' | 'video' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  xpReward: number;
  content: any;
  isCompleted?: boolean;
}

export interface DailyMission {
  id: string;
  date: Date;
  title: string;
  description: string;
  moduleId: string;
  xpReward: number;
  bonusXP?: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  moduleContext?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXP?: number;
  requiredStreak?: number;
  requiredBadges?: string[];
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface ParentReport {
  childId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalTimeSpent: number;
  modulesCompleted: number;
  xpEarned: number;
  streakDays: number;
  strongestSubjects: string[];
  areasForImprovement: string[];
  chatSummary: string[];
}