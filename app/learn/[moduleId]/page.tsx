'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Zap, Target, BookOpen, Brain, Rocket } from 'lucide-react';
import ChatInterface from '@/components/Chat/ChatInterface';
import { LearningModule, UserProgress } from '@/types';
import Link from 'next/link';

const MODULES: { [key: string]: LearningModule } = {
  science: {
    id: 'science',
    name: 'Science & Innovation',
    description: 'Explore experiments and inventions',
    icon: '🔬',
    color: 'blue',
    dayOfWeek: 1,
    lessons: [],
    isAvailable: true,
  },
  math: {
    id: 'math',
    name: 'Math Missions',
    description: 'Solve puzzles and problems',
    icon: '🧮',
    color: 'purple',
    dayOfWeek: 2,
    lessons: [],
    isAvailable: true,
  },
  stories: {
    id: 'stories',
    name: 'Stories & Communication',
    description: 'Create stories and improve speaking',
    icon: '📚',
    color: 'green',
    dayOfWeek: 3,
    lessons: [],
    isAvailable: true,
  },
  world: {
    id: 'world',
    name: 'World Explorer',
    description: 'Discover cultures and history',
    icon: '🌍',
    color: 'orange',
    dayOfWeek: 4,
    lessons: [],
    isAvailable: true,
  },
  entrepreneur: {
    id: 'entrepreneur',
    name: "Entrepreneur's Lab",
    description: 'Learn business and leadership',
    icon: '💼',
    color: 'red',
    dayOfWeek: 5,
    lessons: [],
    isAvailable: true,
  },
};

// Learning activities for each module
const MODULE_ACTIVITIES: { [key: string]: Array<{ title: string; description: string; xp: number }> } = {
  science: [
    { title: "Virtual Lab Experiment", description: "Conduct a safe science experiment", xp: 30 },
    { title: "Invention Workshop", description: "Design your own invention", xp: 40 },
    { title: "Nature Detective", description: "Explore the natural world", xp: 25 },
    { title: "Space Explorer", description: "Learn about planets and stars", xp: 35 },
  ],
  math: [
    { title: "Number Puzzles", description: "Solve fun math puzzles", xp: 30 },
    { title: "Math Games", description: "Play educational math games", xp: 25 },
    { title: "Real-World Math", description: "Apply math to everyday life", xp: 35 },
    { title: "Pattern Hunter", description: "Find patterns in numbers", xp: 30 },
  ],
  stories: [
    { title: "Story Creator", description: "Write your own adventure", xp: 35 },
    { title: "Word Explorer", description: "Learn new vocabulary", xp: 25 },
    { title: "Character Builder", description: "Create unique characters", xp: 30 },
    { title: "Poetry Corner", description: "Write fun poems", xp: 30 },
  ],
  world: [
    { title: "Time Travel", description: "Explore different time periods", xp: 35 },
    { title: "Culture Quest", description: "Learn about world cultures", xp: 30 },
    { title: "Map Master", description: "Navigate the globe", xp: 25 },
    { title: "Wildlife Safari", description: "Discover amazing animals", xp: 30 },
  ],
  entrepreneur: [
    { title: "Business Builder", description: "Create a business plan", xp: 40 },
    { title: "Money Manager", description: "Learn about saving and spending", xp: 30 },
    { title: "Team Leader", description: "Practice leadership skills", xp: 35 },
    { title: "Problem Solver", description: "Solve business challenges", xp: 35 },
  ],
};

export default function LearnModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;
  const module = MODULES[moduleId];

  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load progress
    const storedProgress = localStorage.getItem(`progress_${parsedUser.id}`);
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, [router]);

  const handleXPEarned = (xp: number) => {
    setSessionXP(prev => prev + xp);
    setShowXPAnimation(true);
    setTimeout(() => setShowXPAnimation(false), 2000);

    // Update progress
    if (progress && user) {
      const updatedProgress = {
        ...progress,
        totalXP: progress.totalXP + xp,
      };
      setProgress(updatedProgress);
      localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedProgress));
    }
  };

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Module not found</p>
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-600">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const activities = MODULE_ACTIVITIES[moduleId] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{module.name}</h1>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-900">+{sessionXP} XP</span>
                  <span className="text-sm text-purple-700">this session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* XP Animation */}
      {showXPAnimation && (
        <motion.div
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -50, opacity: 0 }}
          className="fixed top-20 right-10 z-50"
        >
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg">
            +5 XP! 🎉
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Activities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Today's Learning Activities
            </h2>
            
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {activity.description}
                      </p>
                    </div>
                    <div className="bg-purple-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-bold text-purple-700">
                        {activity.xp} XP
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-bold hover:shadow-md transition-shadow"
                    onClick={() => handleXPEarned(activity.xp)}
                  >
                    Start Activity
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Fun Facts */}
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-yellow-600" />
                <h3 className="font-bold text-yellow-900">Did You Know?</h3>
              </div>
              <p className="text-yellow-800 text-sm">
                {moduleId === 'science' && "Scientists have discovered over 8.7 million species on Earth, but they think there might be millions more we haven't found yet!"}
                {moduleId === 'math' && "The word 'calculator' comes from the Latin word 'calculus' which means 'small pebble' - ancient Romans used pebbles for counting!"}
                {moduleId === 'stories' && "The longest novel ever written has over 13 million words! That's like reading Harry Potter 13 times!"}
                {moduleId === 'world' && "There are 195 countries in the world, and people speak over 7,000 different languages!"}
                {moduleId === 'entrepreneur' && "The youngest billionaire in the world became one at just 18 years old by inventing something new!"}
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-500" />
              Ask Claude Anything!
            </h2>
            
            <ChatInterface
              moduleContext={moduleId}
              moduleName={module.name}
              onXPEarned={handleXPEarned}
            />
          </div>
        </div>
      </div>
    </div>
  );
}