'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  Calendar,
  ChevronRight,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';
import { UserProgress, LearningModule, DailyMission, Badge } from '@/types';
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/gamification';
import ModuleCard from './ModuleCard';
import StreakCounter from './StreakCounter';
import XPProgress from './XPProgress';
import DailyMissionCard from './DailyMissionCard';
import BadgeDisplay from './BadgeDisplay';

interface MainDashboardProps {
  user: {
    name: string;
    avatar: string;
  };
  progress: UserProgress;
  modules: LearningModule[];
  dailyMission: DailyMission | null;
}

export default function MainDashboard({ 
  user, 
  progress, 
  modules, 
  dailyMission 
}: MainDashboardProps) {
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  const levelInfo = calculateLevel(progress.totalXP);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
      setGreeting('Good morning');
    } else if (hour < 17) {
      setTimeOfDay('afternoon');
      setGreeting('Good afternoon');
    } else {
      setTimeOfDay('evening');
      setGreeting('Good evening');
    }
  }, []);

  // Get today's module based on day of week
  const today = new Date().getDay();
  const todaysModule = modules.find(m => m.dayOfWeek === today);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                className="text-4xl"
              >
                {user.avatar}
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {greeting}, {user.name}! 🎉
                </h1>
                <p className="text-sm text-gray-600">
                  Level {levelInfo.level} {levelInfo.title}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <StreakCounter streak={progress.currentStreak} />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">{progress.badges.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-gray-900">{progress.totalXP} XP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* XP Progress Bar */}
        <XPProgress 
          currentXP={progress.totalXP} 
          level={levelInfo.level}
          progress={levelInfo.progress}
        />

        {/* Daily Mission */}
        {dailyMission && !dailyMission.isCompleted && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <DailyMissionCard mission={dailyMission} />
          </motion.div>
        )}

        {/* Today's Focus */}
        {todaysModule && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Today's Adventure
            </h2>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1 rounded-2xl">
              <div className="bg-white rounded-xl p-6">
                <ModuleCard 
                  module={todaysModule} 
                  isToday={true}
                  progress={progress.moduleProgress.find(p => p.moduleId === todaysModule.id)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Modules Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            All Learning Adventures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ModuleCard 
                  module={module} 
                  isToday={module.dayOfWeek === today}
                  progress={progress.moduleProgress.find(p => p.moduleId === module.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Badges */}
        {progress.badges.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Your Badges
            </h2>
            <BadgeDisplay badges={progress.badges} />
          </motion.div>
        )}
      </div>
    </div>
  );
}