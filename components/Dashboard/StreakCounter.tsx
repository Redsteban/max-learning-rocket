'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  const getStreakColor = () => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    if (streak >= 3) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <motion.div
      className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={streak > 0 ? { 
          y: [0, -2, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: 0.5, 
          repeat: streak > 0 ? Infinity : 0,
          repeatDelay: 2 
        }}
      >
        <Flame className={`w-5 h-5 ${getStreakColor()}`} />
      </motion.div>
      <div>
        <div className="text-xl font-bold text-gray-900">{streak}</div>
        <div className="text-xs text-gray-600">day streak</div>
      </div>
    </motion.div>
  );
}