'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ModuleGrid from '@/src/components/Modules/ModuleGrid';
import { useModuleProgress } from '@/src/hooks/useModuleProgress';
import { useGamification } from '@/src/hooks/useGamification';
import { ArrowLeft, Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ModulesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalXP, getBestStreak } = useModuleProgress();
  const { awardXP, userProgress } = useGamification();
  const [weeklyGoal] = useState(500); // Weekly XP goal

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('maxLoggedIn');
      const name = localStorage.getItem('maxName');
      
      if (loggedIn !== 'true' || !name) {
        router.push('/login');
      } else {
        setUserName(name);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleModuleStart = async (moduleId: string) => {
    // Award XP for starting a module
    if (awardXP) {
      await awardXP(5, 'Started a learning module!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🚀
        </motion.div>
      </div>
    );
  }

  const totalXP = getTotalXP();
  const bestStreak = getBestStreak();
  const weeklyProgress = Math.min((totalXP / weeklyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Learning Modules</h1>
                <p className="text-sm text-gray-600">Choose your adventure for today!</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-600">Total XP</p>
                  <p className="text-sm font-bold text-gray-800">{userProgress?.totalXP || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Best Streak</p>
                  <p className="text-sm font-bold text-gray-800">{bestStreak} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goal Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Weekly Challenge 🎯</h2>
              <p className="text-white/90">Earn {weeklyGoal} XP this week!</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalXP}/{weeklyGoal}</p>
              <p className="text-sm text-white/80">XP earned</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          {weeklyProgress === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-xl font-bold">🎉 Goal Achieved! Amazing work!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Module Grid */}
        <ModuleGrid onModuleStart={handleModuleStart} />

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Target className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Daily Goals</h3>
            <p className="text-sm text-gray-600">
              Complete at least 3 activities each day to maintain your streak!
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Level Up Fast</h3>
            <p className="text-sm text-gray-600">
              Try different modules to earn bonus XP and unlock special achievements!
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Weekend Bonus</h3>
            <p className="text-sm text-gray-600">
              Complete modules on weekends for double XP rewards!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}