'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Zap, Target, Trophy, Calendar, 
  Play, Pause, CheckCircle, Sparkles,
  Home, BookOpen, Lightbulb, Heart, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { ClaudePersonality, EnergyDetector, type EnergyLevel } from '@/lib/claude-personality';
import { AfterSchoolProgram } from '@/lib/after-school-program';
import { SuccessMetrics } from '@/lib/success-metrics';

interface AfterSchoolDashboardProps {
  studentName: string;
  onSessionStart: () => void;
  onActivityComplete: (activity: string, xpEarned: number) => void;
}

export default function AfterSchoolDashboard({
  studentName,
  onSessionStart,
  onActivityComplete
}: AfterSchoolDashboardProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('check-in');
  const [timeRemaining, setTimeRemaining] = useState(60); // minutes
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [todaysFocus, setTodaysFocus] = useState<string>('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState(0);

  const personality = new ClaudePersonality();
  const program = new AfterSchoolProgram();
  const metrics = new SuccessMetrics();

  // Visual timer component
  const VisualTimer = () => {
    const phases = [
      { name: 'Check-in', duration: 5, icon: Home, color: 'bg-blue-500' },
      { name: 'Homework', duration: 15, icon: BookOpen, color: 'bg-purple-500' },
      { name: 'Enrichment', duration: 20, icon: Lightbulb, color: 'bg-green-500' },
      { name: 'Life Skills', duration: 15, icon: Heart, color: 'bg-orange-500' },
      { name: 'Reflection', duration: 5, icon: MessageCircle, color: 'bg-pink-500' }
    ];

    const totalMinutes = 60;
    const elapsedMinutes = totalMinutes - timeRemaining;
    const currentPhaseIndex = Math.floor(elapsedMinutes / 12); // Rough calculation

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Today's Adventure Timeline</h3>
          <span className="text-2xl font-bold text-purple-600">
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </span>
        </div>

        <div className="relative">
          <div className="flex space-x-1">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.name.toLowerCase().replace(' ', '-') === currentPhase;
              const isPast = index < currentPhaseIndex;
              
              return (
                <motion.div
                  key={phase.name}
                  className={`flex-1 relative`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-500
                      ${isActive ? phase.color : isPast ? 'bg-gray-300' : 'bg-gray-200'}
                    `}
                  />
                  <div className={`
                    mt-2 text-center transition-all duration-300
                    ${isActive ? 'scale-110' : ''}
                  `}>
                    <div className={`
                      inline-flex p-2 rounded-full
                      ${isActive ? phase.color + ' text-white' : 'bg-gray-100'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`
                      text-xs mt-1
                      ${isActive ? 'font-bold' : 'text-gray-600'}
                    `}>
                      {phase.name}
                    </p>
                    <p className="text-xs text-gray-500">{phase.duration}min</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Energy level selector
  const EnergySelector = () => {
    const levels: Array<{ level: EnergyLevel; emoji: string; label: string }> = [
      { level: 'high', emoji: '⚡', label: 'Super Energetic!' },
      { level: 'medium', emoji: '😊', label: 'Feeling Good' },
      { level: 'low', emoji: '😴', label: 'Pretty Tired' },
      { level: 'frustrated', emoji: '😤', label: 'Bit Frustrated' }
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">How are you feeling today?</h3>
        <div className="grid grid-cols-2 gap-3">
          {levels.map(({ level, emoji, label }) => (
            <motion.button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${energyLevel === level 
                  ? 'border-purple-500 bg-purple-50 scale-105' 
                  : 'border-gray-200 hover:border-purple-300'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-sm font-medium">{label}</div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  // Achievement notification
  const AchievementNotification = ({ achievement }: { achievement: string }) => {
    useEffect(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">Achievement Unlocked!</p>
              <p className="text-sm">{achievement}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Quick start button
  const QuickStartButton = () => {
    const personalityContext = {
      energyLevel,
      timeOfDay: format(new Date(), 'HH:mm'),
      currentActivity: currentPhase,
      recentAchievements: achievements.slice(-3),
      streakDays
    };

    const response = personality.getPersonality(personalityContext);

    return (
      <motion.div
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ready for Today's Adventure?</h2>
            <p className="text-purple-100">{response.greeting}</p>
          </div>
          <Sparkles className="w-12 h-12 text-yellow-300" />
        </div>

        <div className="mb-4">
          <p className="text-sm text-purple-100 mb-2">Today's Options:</p>
          <div className="flex flex-wrap gap-2">
            {response.suggestions.map((suggestion, index) => (
              <span
                key={index}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>

        <motion.button
          onClick={() => {
            setIsSessionActive(true);
            onSessionStart();
          }}
          className="w-full bg-white text-purple-600 rounded-xl py-3 px-6 font-bold text-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSessionActive ? (
            <span className="flex items-center justify-center space-x-2">
              <Pause className="w-5 h-5" />
              <span>Session Active</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Adventure!</span>
            </span>
          )}
        </motion.button>

        {response.encouragement && (
          <p className="text-sm text-center mt-3 text-yellow-300 font-medium">
            {response.encouragement}
          </p>
        )}
      </motion.div>
    );
  };

  // Daily streak tracker
  const StreakTracker = () => {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Your Learning Streak</h3>
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-bold text-orange-500">{streakDays}</span>
          </div>
        </div>

        <div className="flex space-x-1">
          {[...Array(7)].map((_, i) => {
            const dayNumber = streakDays - (6 - i);
            const isActive = dayNumber > 0 && dayNumber <= streakDays;
            
            return (
              <div
                key={i}
                className={`
                  flex-1 h-12 rounded-lg flex items-center justify-center
                  ${isActive 
                    ? 'bg-gradient-to-t from-orange-500 to-yellow-400 text-white' 
                    : 'bg-gray-100 text-gray-400'}
                `}
              >
                {isActive && <CheckCircle className="w-5 h-5" />}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-600 mt-3">
          {streakDays === 0 
            ? "Start your streak today!" 
            : `Keep going! You're doing amazing!`}
        </p>
      </div>
    );
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isSessionActive) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setIsSessionActive(false);
          return 60;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Load user data on mount
  useEffect(() => {
    // Load streak from localStorage
    const savedStreak = localStorage.getItem('learningStreak');
    if (savedStreak) {
      setStreakDays(parseInt(savedStreak, 10));
    }

    // Check last session date for streak
    const lastSession = localStorage.getItem('lastSessionDate');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastSession !== today) {
      localStorage.setItem('lastSessionDate', today);
      const newStreak = lastSession === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') 
        ? streakDays + 1 
        : 1;
      setStreakDays(newStreak);
      localStorage.setItem('learningStreak', newStreak.toString());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <AnimatePresence>
        {achievements.length > 0 && (
          <AchievementNotification achievement={achievements[achievements.length - 1]} />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {studentName}! 🌟
          </h1>
          <p className="text-gray-600">
            {format(new Date(), "EEEE, MMMM d")} • After School Adventure Time
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <QuickStartButton />
            <VisualTimer />
            <StreakTracker />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <EnergySelector />
            
            {/* Today's Goals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Today's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Complete homework without stress</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Learn something new and fun</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Practice a life skill</span>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Recent Wins</h3>
              {achievements.length > 0 ? (
                <div className="space-y-2">
                  {achievements.slice(-3).map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Start your session to earn achievements!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}