'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Trophy, Flame, Pause, Play, X,
  ChevronDown, Book, Calculator, Globe, Lightbulb, Flask
} from 'lucide-react';

interface ChatHeaderProps {
  module: string;
  studentName: string;
  currentStreak: number;
  totalXP: number;
  sessionXP: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onEndSession: () => void;
  onModuleChange?: (module: string) => void;
}

export default function ChatHeader({
  module,
  studentName,
  currentStreak,
  totalXP,
  sessionXP,
  isPaused,
  onPauseToggle,
  onEndSession,
  onModuleChange
}: ChatHeaderProps) {
  const [showModuleSelector, setShowModuleSelector] = React.useState(false);

  const modules = [
    { id: 'science', name: 'Science', icon: Flask, color: 'from-blue-400 to-cyan-400' },
    { id: 'math', name: 'Math', icon: Calculator, color: 'from-purple-400 to-pink-400' },
    { id: 'stories', name: 'Stories', icon: Book, color: 'from-green-400 to-emerald-400' },
    { id: 'world', name: 'World', icon: Globe, color: 'from-orange-400 to-yellow-400' },
    { id: 'entrepreneur', name: 'Business', icon: Lightbulb, color: 'from-red-400 to-rose-400' }
  ];

  const currentModule = modules.find(m => m.id === module) || modules[0];

  return (
    <div className={`bg-gradient-to-r ${currentModule.color} text-white shadow-lg relative`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Module & Student Info */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-white/20 p-3 rounded-full"
            >
              <currentModule.icon className="w-6 h-6" />
            </motion.div>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {studentName}'s {currentModule.name} Adventure
                <button
                  onClick={() => setShowModuleSelector(!showModuleSelector)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </h1>
              <p className="text-sm opacity-90">
                with Claude, your AI learning buddy
              </p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-6">
            {/* Streak */}
            <motion.div 
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold">{currentStreak} day streak</span>
            </motion.div>

            {/* Session XP */}
            <motion.div 
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
              key={sessionXP}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">+{sessionXP} XP</span>
            </motion.div>

            {/* Total XP */}
            <motion.div 
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{totalXP} Total XP</span>
            </motion.div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPauseToggle}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEndSession}
              className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>End Session</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Module Selector Dropdown */}
      {showModuleSelector && onModuleChange && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-6 mt-2 bg-white rounded-lg shadow-xl p-2 z-50"
        >
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => {
                onModuleChange(mod.id);
                setShowModuleSelector(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                mod.id === module ? 'bg-gray-100' : ''
              }`}
            >
              <div className={`bg-gradient-to-r ${mod.color} p-2 rounded-lg text-white`}>
                <mod.icon className="w-4 h-4" />
              </div>
              <span className="text-gray-800 font-medium">{mod.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}