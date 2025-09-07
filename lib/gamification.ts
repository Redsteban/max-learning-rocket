import { Badge, Achievement, UserProgress } from '@/types';

// XP Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 100, title: 'Explorer' },
  { level: 2, minXP: 100, maxXP: 300, title: 'Adventurer' },
  { level: 3, minXP: 300, maxXP: 600, title: 'Discoverer' },
  { level: 4, minXP: 600, maxXP: 1000, title: 'Scholar' },
  { level: 5, minXP: 1000, maxXP: 1500, title: 'Researcher' },
  { level: 6, minXP: 1500, maxXP: 2500, title: 'Expert' },
  { level: 7, minXP: 2500, maxXP: 4000, title: 'Master' },
  { level: 8, minXP: 4000, maxXP: 6000, title: 'Sage' },
  { level: 9, minXP: 6000, maxXP: 10000, title: 'Legend' },
  { level: 10, minXP: 10000, maxXP: 999999, title: 'Grand Master' },
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'first-day',
    title: 'First Day Hero',
    description: 'Complete your first day of learning!',
    icon: '🌟',
    requiredStreak: 1,
    isUnlocked: false,
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Complete 5 days in a row',
    icon: '⚔️',
    requiredStreak: 5,
    isUnlocked: false,
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Complete 20 days in a row',
    icon: '👑',
    requiredStreak: 20,
    isUnlocked: false,
  },
  {
    id: 'century-streak',
    title: 'Century Champion',
    description: 'Reach a 100-day streak!',
    icon: '💯',
    requiredStreak: 100,
    isUnlocked: false,
  },
  // XP achievements
  {
    id: 'xp-rookie',
    title: 'XP Rookie',
    description: 'Earn your first 100 XP',
    icon: '🎯',
    requiredXP: 100,
    isUnlocked: false,
  },
  {
    id: 'xp-champion',
    title: 'XP Champion',
    description: 'Earn 1000 XP',
    icon: '🏆',
    requiredXP: 1000,
    isUnlocked: false,
  },
  {
    id: 'xp-legend',
    title: 'XP Legend',
    description: 'Earn 5000 XP',
    icon: '🌈',
    requiredXP: 5000,
    isUnlocked: false,
  },
];

// Badge definitions
export const BADGES: Badge[] = [
  // Subject badges
  {
    id: 'science-star',
    name: 'Science Star',
    description: 'Complete 10 science lessons',
    icon: '🔬',
    category: 'subject',
    earnedAt: new Date(),
    xpReward: 50,
  },
  {
    id: 'math-wizard',
    name: 'Math Wizard',
    description: 'Solve 50 math problems',
    icon: '🧮',
    category: 'subject',
    earnedAt: new Date(),
    xpReward: 50,
  },
  {
    id: 'story-teller',
    name: 'Story Teller',
    description: 'Write 5 creative stories',
    icon: '📚',
    category: 'subject',
    earnedAt: new Date(),
    xpReward: 50,
  },
  {
    id: 'world-explorer',
    name: 'World Explorer',
    description: 'Visit 10 countries virtually',
    icon: '🌍',
    category: 'subject',
    earnedAt: new Date(),
    xpReward: 50,
  },
  {
    id: 'business-builder',
    name: 'Business Builder',
    description: 'Create 3 business ideas',
    icon: '💼',
    category: 'subject',
    earnedAt: new Date(),
    xpReward: 50,
  },
  // Special event badges
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Learn on a Saturday or Sunday',
    icon: '🌅',
    category: 'special',
    earnedAt: new Date(),
    xpReward: 25,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Start learning before 8 AM',
    icon: '🌄',
    category: 'special',
    earnedAt: new Date(),
    xpReward: 25,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Learn after 7 PM',
    icon: '🦉',
    category: 'special',
    earnedAt: new Date(),
    xpReward: 25,
  },
];

export function calculateLevel(totalXP: number): { level: number; title: string; progress: number } {
  const threshold = LEVEL_THRESHOLDS.find(t => totalXP >= t.minXP && totalXP < t.maxXP) || LEVEL_THRESHOLDS[0];
  const progress = ((totalXP - threshold.minXP) / (threshold.maxXP - threshold.minXP)) * 100;
  
  return {
    level: threshold.level,
    title: threshold.title,
    progress: Math.min(progress, 100),
  };
}

export function checkAchievements(progress: UserProgress): Achievement[] {
  const newAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!achievement.isUnlocked) {
      let shouldUnlock = false;

      if (achievement.requiredStreak && progress.currentStreak >= achievement.requiredStreak) {
        shouldUnlock = true;
      }
      if (achievement.requiredXP && progress.totalXP >= achievement.requiredXP) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newAchievements.push({
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date(),
        });
      }
    }
  });

  return newAchievements;
}

export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return 50;
  if (streak >= 14) return 30;
  if (streak >= 7) return 20;
  if (streak >= 3) return 10;
  return 0;
}

export function getRandomDailyMission(moduleId: string): {
  title: string;
  description: string;
  xpReward: number;
} {
  const missions: { [key: string]: Array<{ title: string; description: string; xpReward: number }> } = {
    science: [
      { title: 'Lab Explorer', description: 'Conduct a virtual experiment', xpReward: 30 },
      { title: 'Nature Detective', description: 'Identify 3 plants or animals', xpReward: 25 },
      { title: 'Invention Time', description: 'Design a new invention', xpReward: 40 },
    ],
    math: [
      { title: 'Problem Solver', description: 'Solve 10 math puzzles', xpReward: 30 },
      { title: 'Pattern Hunter', description: 'Find patterns in numbers', xpReward: 25 },
      { title: 'Math in Life', description: 'Find math in everyday objects', xpReward: 35 },
    ],
    stories: [
      { title: 'Story Creator', description: 'Write a short adventure story', xpReward: 35 },
      { title: 'Word Explorer', description: 'Learn 5 new vocabulary words', xpReward: 25 },
      { title: 'Reading Champion', description: 'Read for 15 minutes', xpReward: 20 },
    ],
    world: [
      { title: 'Culture Quest', description: 'Learn about a new country', xpReward: 30 },
      { title: 'Time Traveler', description: 'Explore a historical period', xpReward: 35 },
      { title: 'Map Master', description: 'Find 5 places on the map', xpReward: 25 },
    ],
    entrepreneur: [
      { title: 'Business Idea', description: 'Create a new business concept', xpReward: 40 },
      { title: 'Money Math', description: 'Calculate profits and costs', xpReward: 30 },
      { title: 'Team Leader', description: 'Plan a team project', xpReward: 35 },
    ],
  };

  const moduleMissions = missions[moduleId] || missions.science;
  return moduleMissions[Math.floor(Math.random() * moduleMissions.length)];
}

export function triggerCelebration(type: 'badge' | 'level' | 'streak' | 'achievement'): void {
  // This will be implemented with canvas-confetti in the component
  console.log(`Celebration triggered for: ${type}`);
}