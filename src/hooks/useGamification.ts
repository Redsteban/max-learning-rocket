'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserProgress {
  totalXP: number;
  currentLevel: number;
  achievements: string[];
  dailyStreak: number;
  lastActiveDate: string;
}

interface Level {
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  emoji: string;
}

const levels: Level[] = [
  { name: 'Explorer', minXP: 0, maxXP: 99, color: 'green', emoji: '🌱' },
  { name: 'Adventurer', minXP: 100, maxXP: 249, color: 'blue', emoji: '🚀' },
  { name: 'Scholar', minXP: 250, maxXP: 499, color: 'purple', emoji: '🎓' },
  { name: 'Master', minXP: 500, maxXP: 999, color: 'gold', emoji: '👑' },
  { name: 'Legend', minXP: 1000, maxXP: 9999, color: 'rainbow', emoji: '🌟' }
];

export function useGamification() {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXP: 0,
    currentLevel: 1,
    achievements: [],
    dailyStreak: 0,
    lastActiveDate: new Date().toDateString()
  });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserProgress(parsed);
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    }
  }, []);

  const awardXP = useCallback(async (xp: number, reason: string) => {
    setUserProgress(prev => {
      const newTotalXP = prev.totalXP + xp;
      const newLevel = levels.findIndex(level => 
        newTotalXP >= level.minXP && newTotalXP <= level.maxXP
      ) + 1;

      const today = new Date().toDateString();
      const newStreak = today === prev.lastActiveDate ? prev.dailyStreak : prev.dailyStreak + 1;

      const updated = {
        ...prev,
        totalXP: newTotalXP,
        currentLevel: newLevel,
        dailyStreak: newStreak,
        lastActiveDate: today
      };

      // Save to localStorage
      localStorage.setItem('userProgress', JSON.stringify(updated));
      
      // Check for level up
      if (newLevel > prev.currentLevel) {
        // You could trigger a celebration here
        console.log(`Level up! You're now level ${newLevel}!`);
      }

      return updated;
    });
  }, []);

  const addAchievement = useCallback((achievement: string) => {
    setUserProgress(prev => {
      if (!prev.achievements.includes(achievement)) {
        const updated = {
          ...prev,
          achievements: [...prev.achievements, achievement]
        };
        localStorage.setItem('userProgress', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const getCurrentLevel = useCallback(() => {
    return levels.find(level => 
      userProgress.totalXP >= level.minXP && userProgress.totalXP <= level.maxXP
    ) || levels[0];
  }, [userProgress.totalXP]);

  const getNextLevel = useCallback(() => {
    const currentLevelIndex = levels.findIndex(level => 
      userProgress.totalXP >= level.minXP && userProgress.totalXP <= level.maxXP
    );
    return levels[currentLevelIndex + 1] || null;
  }, [userProgress.totalXP]);

  const getProgressToNextLevel = useCallback(() => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!nextLevel) return { progress: 100, xpNeeded: 0 };
    
    const progress = ((userProgress.totalXP - currentLevel.minXP) / 
                     (nextLevel.minXP - currentLevel.minXP)) * 100;
    const xpNeeded = nextLevel.minXP - userProgress.totalXP;
    
    return { progress: Math.min(progress, 100), xpNeeded };
  }, [userProgress.totalXP, getCurrentLevel, getNextLevel]);

  return {
    userProgress,
    awardXP,
    addAchievement,
    currentLevel: getCurrentLevel(),
    nextLevel: getNextLevel(),
    progressToNextLevel: getProgressToNextLevel(),
    levels
  };
}
