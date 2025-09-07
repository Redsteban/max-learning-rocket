'use client';

import { useState, useEffect } from 'react';

interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  xpEarned: number;
  lastAccessed: Date;
  streak: number;
}

export function useModuleProgress() {
  const [progress, setProgress] = useState<ModuleProgress[]>([]);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('moduleProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed.map((p: any) => ({
          ...p,
          lastAccessed: new Date(p.lastAccessed)
        })));
      } catch (error) {
        console.error('Error loading module progress:', error);
      }
    }
  }, []);

  const updateProgress = (moduleId: string, xpGained: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.moduleId === moduleId);
      const updated = existing ? {
        ...existing,
        completedLessons: existing.completedLessons + 1,
        xpEarned: existing.xpEarned + xpGained,
        lastAccessed: new Date(),
        streak: existing.streak + 1
      } : {
        moduleId,
        completedLessons: 1,
        totalLessons: 10, // Default total lessons
        xpEarned: xpGained,
        lastAccessed: new Date(),
        streak: 1
      };

      const newProgress = existing 
        ? prev.map(p => p.moduleId === moduleId ? updated : p)
        : [...prev, updated];

      // Save to localStorage
      localStorage.setItem('moduleProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.moduleId === moduleId) || {
      moduleId,
      completedLessons: 0,
      totalLessons: 10,
      xpEarned: 0,
      lastAccessed: new Date(),
      streak: 0
    };
  };

  const getTotalXP = () => {
    return progress.reduce((total, p) => total + p.xpEarned, 0);
  };

  const getBestStreak = () => {
    return Math.max(...progress.map(p => p.streak), 0);
  };

  const getTotalLessonsCompleted = () => {
    return progress.reduce((total, p) => total + p.completedLessons, 0);
  };

  return {
    progress,
    updateProgress,
    getModuleProgress,
    getTotalXP,
    getBestStreak,
    getTotalLessonsCompleted
  };
}
