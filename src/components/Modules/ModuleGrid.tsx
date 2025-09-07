'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BookOpen, Calculator, Microscope, Globe, Lightbulb, Book } from 'lucide-react';

interface ModuleGridProps {
  onModuleStart?: (moduleId: string) => void;
}

const modules = [
  {
    id: 'science',
    title: 'Science & Innovation',
    description: 'Explore the wonders of science!',
    icon: Microscope,
    color: 'from-green-400 to-blue-500',
    emoji: '🧪',
    difficulty: 'Medium'
  },
  {
    id: 'math',
    title: 'Math Missions',
    description: 'Solve puzzles and equations!',
    icon: Calculator,
    color: 'from-purple-400 to-pink-500',
    emoji: '🧮',
    difficulty: 'Easy'
  },
  {
    id: 'stories',
    title: 'Stories & Communication',
    description: 'Create amazing stories!',
    icon: Book,
    color: 'from-yellow-400 to-orange-500',
    emoji: '📚',
    difficulty: 'Easy'
  },
  {
    id: 'world',
    title: 'World Explorer',
    description: 'Discover our amazing world!',
    icon: Globe,
    color: 'from-blue-400 to-cyan-500',
    emoji: '🌍',
    difficulty: 'Medium'
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur\'s Lab',
    description: 'Learn about business and creativity!',
    icon: Lightbulb,
    color: 'from-pink-400 to-purple-500',
    emoji: '💡',
    difficulty: 'Hard'
  }
];

export default function ModuleGrid({ onModuleStart }: ModuleGridProps) {
  const router = useRouter();

  const handleModuleClick = (moduleId: string) => {
    if (onModuleStart) {
      onModuleStart(moduleId);
    }
    router.push(`/learn/${moduleId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module, index) => (
        <motion.div
          key={module.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleModuleClick(module.id)}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl 
                   cursor-pointer transition-all duration-300 border-2 border-transparent 
                   hover:border-purple-200"
        >
          <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl 
                         flex items-center justify-center text-3xl mb-4 mx-auto`}>
            {module.emoji}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            {module.title}
          </h3>
          
          <p className="text-gray-600 text-center mb-4">
            {module.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              module.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              module.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {module.difficulty}
            </span>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-purple-500"
            >
              <BookOpen className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
