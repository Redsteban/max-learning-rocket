'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/types';

interface BadgeDisplayProps {
  badges: Badge[];
  maxDisplay?: number;
}

export default function BadgeDisplay({ badges, maxDisplay = 8 }: BadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 200
            }}
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="relative group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
              <span className="text-2xl">{badge.icon}</span>
            </div>
            
            {/* Tooltip */}
            <motion.div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              <div className="font-bold">{badge.name}</div>
              <div className="text-gray-300">{badge.description}</div>
              <div className="text-yellow-400">+{badge.xpReward} XP</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </motion.div>
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: displayBadges.length * 0.1 }}
            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <span className="text-sm font-bold text-gray-600">+{remainingCount}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}