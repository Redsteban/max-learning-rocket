'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { LEVEL_THRESHOLDS } from '@/lib/gamification';

interface XPProgressProps {
  currentXP: number;
  level: number;
  progress: number;
}

export default function XPProgress({ currentXP, level, progress }: XPProgressProps) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpNeeded = nextThreshold.minXP - currentXP;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Level {level}: {currentThreshold.title}
            </h3>
            <p className="text-sm text-gray-600">
              {xpNeeded} XP to next level
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">
            {currentXP} XP
          </div>
          <div className="text-xs text-gray-500">
            Total earned
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <motion.div
              className="h-full w-full opacity-30 bg-white"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>
        
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 w-full h-6 flex items-center justify-around">
          {[25, 50, 75].map(milestone => (
            <div
              key={milestone}
              className={`w-0.5 h-4 ${progress >= milestone ? 'bg-white' : 'bg-gray-400'}`}
              style={{ marginLeft: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {currentThreshold.minXP} XP
        </span>
        <span className="text-xs text-gray-500">
          {nextThreshold.minXP} XP
        </span>
      </div>
    </div>
  );
}