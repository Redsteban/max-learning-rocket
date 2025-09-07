'use client';

import { motion } from 'framer-motion';
import { Target, Clock, Zap, CheckCircle } from 'lucide-react';
import { DailyMission } from '@/types';

interface DailyMissionCardProps {
  mission: DailyMission;
  onStart?: () => void;
}

export default function DailyMissionCard({ mission, onStart }: DailyMissionCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-2xl"
      animate={{ 
        boxShadow: [
          '0 0 20px rgba(251, 191, 36, 0.3)',
          '0 0 40px rgba(251, 191, 36, 0.5)',
          '0 0 20px rgba(251, 191, 36, 0.3)',
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wide">
                Daily Mission
              </span>
              {mission.bonusXP && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                  +{mission.bonusXP} Bonus XP!
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {mission.title}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {mission.description}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-bold text-gray-900">
                  {mission.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Complete today
                </span>
              </div>
            </div>
          </div>
          
          {!mission.isCompleted ? (
            <motion.button
              onClick={onStart}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Mission
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold">Completed!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}