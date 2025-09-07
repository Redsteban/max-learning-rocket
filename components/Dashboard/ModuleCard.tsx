'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Lock, Star } from 'lucide-react';
import { LearningModule, ModuleProgress } from '@/types';
import Link from 'next/link';

interface ModuleCardProps {
  module: LearningModule;
  isToday: boolean;
  progress?: ModuleProgress;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ModuleCard({ module, isToday, progress }: ModuleCardProps) {
  const completionRate = progress 
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;

  return (
    <Link href={module.isAvailable ? `/learn/${module.id}` : '#'}>
      <motion.div
        className={`
          relative rounded-2xl p-6 h-full cursor-pointer transition-all
          ${isToday 
            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl' 
            : 'bg-white shadow-md hover:shadow-lg'
          }
          ${!module.isAvailable && !isToday ? 'opacity-60' : ''}
        `}
        whileHover={module.isAvailable ? { y: -4 } : {}}
      >
        {isToday && (
          <motion.div
            className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TODAY!
          </motion.div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{module.icon}</div>
          {!module.isAvailable && !isToday && (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
          {module.isAvailable && (
            <ChevronRight className={`w-5 h-5 ${isToday ? 'text-white' : 'text-gray-400'}`} />
          )}
        </div>

        <h3 className={`font-bold text-lg mb-2 ${isToday ? 'text-white' : 'text-gray-900'}`}>
          {module.name}
        </h3>
        
        <p className={`text-sm mb-4 ${isToday ? 'text-white/90' : 'text-gray-600'}`}>
          {module.description}
        </p>

        <div className={`text-xs ${isToday ? 'text-white/80' : 'text-gray-500'}`}>
          {dayNames[module.dayOfWeek]}
        </div>

        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isToday ? 'text-white/90' : 'text-gray-600'}`}>
                Progress
              </span>
              <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                {completionRate}%
              </span>
            </div>
            <div className={`h-2 rounded-full ${isToday ? 'bg-white/30' : 'bg-gray-200'}`}>
              <motion.div
                className={`h-full rounded-full ${isToday ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(progress.masteryLevel)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 fill-current ${isToday ? 'text-yellow-300' : 'text-yellow-500'}`} />
              ))}
              {[...Array(Math.max(0, 5 - progress.masteryLevel))].map((_, i) => (
                <Star key={i + progress.masteryLevel} className={`w-4 h-4 ${isToday ? 'text-white/30' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}