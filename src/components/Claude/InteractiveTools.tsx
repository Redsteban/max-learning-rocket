'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, HelpCircle, RefreshCw, Zap, Brain,
  Calculator, Palette, Music, BookOpen, Target,
  Gamepad2, Trophy, Star, Heart, Sparkles,
  ChevronRight, Settings, Volume2, Mic,
  PenTool, Camera, Globe, Flask, Rocket
} from 'lucide-react';

interface InteractiveToolsProps {
  onQuickAction: (action: string) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export default function InteractiveTools({
  onQuickAction,
  difficulty,
  onDifficultyChange
}: InteractiveToolsProps) {
  const [activeCategory, setActiveCategory] = useState<'quick' | 'tools' | 'settings'>('quick');
  const [showDrawingPad, setShowDrawingPad] = useState(false);

  const quickActions = [
    { id: 'hint', label: 'Get a Hint', icon: Lightbulb, color: 'from-yellow-400 to-orange-400' },
    { id: 'explain', label: 'Explain Again', icon: RefreshCw, color: 'from-blue-400 to-cyan-400' },
    { id: 'example', label: 'Show Example', icon: BookOpen, color: 'from-green-400 to-emerald-400' },
    { id: 'practice', label: "Let's Practice", icon: Target, color: 'from-purple-400 to-pink-400' },
    { id: 'confused', label: "I'm Confused", icon: HelpCircle, color: 'from-red-400 to-rose-400' },
    { id: 'break', label: 'Take a Break', icon: Heart, color: 'from-pink-400 to-red-400' }
  ];

  const learningTools = [
    { id: 'calculator', label: 'Calculator', icon: Calculator, color: 'from-indigo-400 to-blue-400' },
    { id: 'drawing', label: 'Drawing Pad', icon: PenTool, color: 'from-purple-400 to-pink-400' },
    { id: 'worldmap', label: 'World Map', icon: Globe, color: 'from-green-400 to-teal-400' },
    { id: 'science', label: 'Science Lab', icon: Flask, color: 'from-cyan-400 to-blue-400' },
    { id: 'music', label: 'Music Maker', icon: Music, color: 'from-yellow-400 to-orange-400' },
    { id: 'games', label: 'Mini Games', icon: Gamepad2, color: 'from-red-400 to-pink-400' }
  ];

  const difficultySettings = [
    { level: 'easy', label: 'Easy Mode', emoji: '🌟', color: 'from-green-400 to-emerald-400' },
    { level: 'medium', label: 'Normal Mode', emoji: '⚡', color: 'from-blue-400 to-purple-400' },
    { level: 'hard', label: 'Challenge Mode', emoji: '🔥', color: 'from-orange-400 to-red-400' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'quick', label: 'Quick Help', icon: Zap },
          { id: 'tools', label: 'Tools', icon: Brain },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Quick Actions */}
          {activeCategory === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold text-gray-600 mb-3">Quick Actions</h3>
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickAction(action.id)}
                  className="w-full bg-white hover:shadow-lg transition-all rounded-xl p-3 flex items-center gap-3 group"
                >
                  <div className={`bg-gradient-to-r ${action.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}

              {/* Difficulty Quick Toggle */}
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-2">Quick Difficulty</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onDifficultyChange('easy');
                      onQuickAction('easier');
                    }}
                    className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Make Easier
                  </button>
                  <button
                    onClick={() => {
                      onDifficultyChange('hard');
                      onQuickAction('harder');
                    }}
                    className="flex-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Challenge Me
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Learning Tools */}
          {activeCategory === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold text-gray-600 mb-3">Learning Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                {learningTools.map((tool, index) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (tool.id === 'drawing') {
                        setShowDrawingPad(!showDrawingPad);
                      }
                      // Handle other tools
                    }}
                    className="bg-white hover:shadow-lg transition-all rounded-xl p-4 flex flex-col items-center gap-2 group"
                  >
                    <div className={`bg-gradient-to-r ${tool.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{tool.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Special Tools Section */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm font-bold text-gray-600 mb-2">Special Powers</p>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-all">
                    <Rocket className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Rocket Boost (2x XP)</span>
                    <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      3 left
                    </span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-all">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Star Helper</span>
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                      5 left
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {activeCategory === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-gray-600 mb-3">Learning Settings</h3>
              
              {/* Difficulty Selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Difficulty Level</p>
                {difficultySettings.map((setting) => (
                  <motion.button
                    key={setting.level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDifficultyChange(setting.level as any)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      difficulty === setting.level
                        ? 'bg-gradient-to-r ' + setting.color + ' text-white shadow-lg'
                        : 'bg-white hover:shadow-md'
                    }`}
                  >
                    <span className="text-2xl">{setting.emoji}</span>
                    <span className="font-medium">{setting.label}</span>
                    {difficulty === setting.level && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Other Settings */}
              <div className="space-y-3 pt-3 border-t">
                <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Sound Effects</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Voice Input</span>
                  </div>
                  <input type="checkbox" className="toggle" />
                </label>
                
                <label className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Show Rewards</span>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </label>
              </div>

              {/* Learning Style */}
              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <p className="text-sm font-bold text-gray-600 mb-2">Your Learning Style</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    Visual
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Interactive
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                    Creative
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Progress */}
      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-600">Next Achievement</p>
          <Trophy className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="w-full bg-yellow-200 rounded-full h-2 mb-1">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-600">35 XP to "Problem Solver" badge!</p>
      </div>
    </div>
  );
}