'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Flame, Target, Zap,
  TrendingUp, Award, Medal, Crown, Diamond,
  Brain, Rocket, Heart, Sparkles, Gift
} from 'lucide-react';

interface ProgressTrackerProps {
  sessionXP: number;
  totalXP: number;
  currentStreak: number;
  module: string;
}

interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  icon: React.ReactNode;
  color: string;
}

export default function ProgressTracker({
  sessionXP,
  totalXP,
  currentStreak,
  module
}: ProgressTrackerProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LevelInfo | null>(null);
  const [nextLevel, setNextLevel] = useState<LevelInfo | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const levels: LevelInfo[] = [
    { level: 1, title: 'Explorer', minXP: 0, maxXP: 100, icon: '🌱', color: 'from-green-400 to-emerald-400' },
    { level: 2, title: 'Adventurer', minXP: 100, maxXP: 250, icon: '🌟', color: 'from-blue-400 to-cyan-400' },
    { level: 3, title: 'Scholar', minXP: 250, maxXP: 500, icon: '📚', color: 'from-purple-400 to-pink-400' },
    { level: 4, title: 'Expert', minXP: 500, maxXP: 1000, icon: '🎯', color: 'from-orange-400 to-red-400' },
    { level: 5, title: 'Master', minXP: 1000, maxXP: 2000, icon: '🏆', color: 'from-yellow-400 to-orange-400' },
    { level: 6, title: 'Champion', minXP: 2000, maxXP: 5000, icon: '👑', color: 'from-pink-400 to-purple-400' },
    { level: 7, title: 'Legend', minXP: 5000, maxXP: 10000, icon: '🚀', color: 'from-indigo-400 to-purple-400' },
    { level: 8, title: 'Superhero', minXP: 10000, maxXP: Infinity, icon: '🦸', color: 'from-red-400 to-yellow-400' }
  ];

  const achievements = [
    { id: 'first_answer', name: 'First Steps', icon: '👣', earned: totalXP >= 10 },
    { id: 'streak_3', name: '3 Day Streak', icon: '🔥', earned: currentStreak >= 3 },
    { id: 'quick_learner', name: 'Quick Learner', icon: '⚡', earned: sessionXP >= 50 },
    { id: 'century', name: 'Century Club', icon: '💯', earned: totalXP >= 100 },
    { id: 'explorer', name: `${module} Explorer`, icon: '🗺️', earned: sessionXP >= 30 },
    { id: 'helper', name: 'Helper Hero', icon: '🦸', earned: false }
  ];

  const dailyGoals = [
    { id: 'xp', label: 'Earn 100 XP', current: sessionXP, target: 100, icon: Sparkles },
    { id: 'questions', label: 'Ask 5 Questions', current: 3, target: 5, icon: Brain },
    { id: 'activities', label: 'Complete 3 Activities', current: 1, target: 3, icon: Target }
  ];

  useEffect(() => {
    // Calculate current level and progress
    const level = levels.find(l => totalXP >= l.minXP && totalXP < l.maxXP) || levels[0];
    const next = levels[levels.indexOf(level) + 1] || levels[levels.length - 1];
    
    setCurrentLevel(level);
    setNextLevel(next);
    
    const xpInLevel = totalXP - level.minXP;
    const xpNeeded = level.maxXP - level.minXP;
    const percent = Math.min((xpInLevel / xpNeeded) * 100, 100);
    setProgressPercent(percent);
    
    // Check for level up
    const prevLevel = levels.find(l => (totalXP - sessionXP) >= l.minXP && (totalXP - sessionXP) < l.maxXP);
    if (prevLevel && level.level > prevLevel.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  }, [totalXP, sessionXP]);

  return (
    <div className="space-y-4">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && currentLevel && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You're now a {currentLevel.title}!</p>
              <div className="text-5xl mt-3">{currentLevel.icon}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Level Card */}
      {currentLevel && nextLevel && (
        <div className={`bg-gradient-to-r ${currentLevel.color} text-white p-4 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentLevel.icon}</span>
              <div>
                <p className="font-bold text-lg">Level {currentLevel.level}</p>
                <p className="text-sm opacity-90">{currentLevel.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-xs opacity-90">Total XP</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs opacity-90">
              <span>{totalXP} XP</span>
              <span>{nextLevel.maxXP} XP</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-white h-full rounded-full flex items-center justify-end pr-1"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {progressPercent > 10 && (
                  <Sparkles className="w-2 h-2 animate-pulse" />
                )}
              </motion.div>
            </div>
            <p className="text-center text-sm">
              {nextLevel.maxXP - totalXP} XP to {nextLevel.title} {nextLevel.icon}
            </p>
          </div>
        </div>
      )}

      {/* Daily Goals */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Today's Goals
        </h3>
        <div className="space-y-3">
          {dailyGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <goal.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{goal.label}</span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    goal.current >= goal.target 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
              {goal.current >= goal.target && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 mt-1"
                >
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-green-600 font-medium">Complete!</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: achievement.earned ? 1.1 : 1 }}
              className={`relative p-3 rounded-lg text-center cursor-pointer transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-md'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <span className={`text-2xl ${!achievement.earned && 'grayscale'}`}>
                {achievement.icon}
              </span>
              <p className="text-xs mt-1 font-medium text-gray-700">
                {achievement.name}
              </p>
              {achievement.earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1"
                >
                  <Star className="w-3 h-3" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Streak Counter */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🔥
            </motion.div>
            <div>
              <p className="font-bold text-gray-800">{currentStreak} Day Streak!</p>
              <p className="text-xs text-gray-600">Keep learning every day!</p>
            </div>
          </div>
          {currentStreak >= 7 && (
            <div className="bg-white/80 px-3 py-1 rounded-full">
              <p className="text-xs font-bold text-orange-600">Week Warrior!</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          This Session
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">XP Earned</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">+{sessionXP}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-medium">Focus Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">12m</p>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center"
      >
        <Sparkles className="w-6 h-6 mx-auto mb-2" />
        <p className="font-bold">You're doing amazing!</p>
        <p className="text-sm opacity-90">Every question makes you smarter!</p>
      </motion.div>
    </div>
  );
}