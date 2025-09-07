'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, Rocket, Star, Zap, BookOpen, Info } from 'lucide-react';
import ChatInterface from '@/components/Chat/ChatInterface';
import { useGamification } from '@/src/hooks/useGamification';

function ClaudeChatContent() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const [currentModule, setCurrentModule] = useState<string>('');
  const { userProgress, currentLevel } = useGamification();
  const [tips] = useState([
    "🎯 Ask Claude to explain things like you're playing a game!",
    "🌟 Claude loves to help with homework - just ask!",
    "🚀 Try asking 'Why' questions to learn more!",
    "💡 Claude can help you create stories and ideas!",
    "🎨 Ask Claude to help you imagine and create!"
  ]);
  const [currentTip, setCurrentTip] = useState(0);

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

  useEffect(() => {
    // Get module from URL params
    const module = searchParams.get('module');
    if (module) {
      setCurrentModule(module);
    }
  }, [searchParams]);

  useEffect(() => {
    // Rotate tips
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🤖
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm">
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
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Brain className="w-8 h-8 text-purple-500" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Claude AI Assistant</h1>
                  <p className="text-sm text-gray-600">Your learning buddy is here to help!</p>
                </div>
              </div>
            </div>
            
            {/* User Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-600">Level</p>
                  <p className="text-sm font-bold text-gray-800">
                    {currentLevel?.name || 'Explorer'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Total XP</p>
                  <p className="text-sm font-bold text-gray-800">
                    {userProgress?.totalXP || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ height: '600px' }}>
              <ChatInterface currentModule={currentModule} />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Module Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Learning Module
              </h3>
              
              <select
                value={currentModule}
                onChange={(e) => setCurrentModule(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-200 
                         focus:border-purple-400 focus:outline-none text-gray-700"
              >
                <option value="">General Learning</option>
                <option value="science">🧪 Science & Innovation</option>
                <option value="math">🧮 Math Missions</option>
                <option value="stories">📚 Stories & Communication</option>
                <option value="world">🌍 World Explorer</option>
                <option value="entrepreneur">💡 Entrepreneur's Lab</option>
              </select>
              
              <p className="text-xs text-gray-500 mt-2">
                Claude will focus on this subject!
              </p>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-lg text-white"
            >
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Pro Tip!
              </h3>
              
              <motion.p
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm"
              >
                {tips[currentTip]}
              </motion.p>
            </motion.div>

            {/* Quick Questions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-500" />
                Quick Questions
              </h3>
              
              <div className="space-y-2">
                {[
                  "How do plants make food?",
                  "Why is the sky blue?",
                  "How do airplanes fly?",
                  "What makes rainbows?",
                  "How do computers work?"
                ].map((question) => (
                  <button
                    key={question}
                    className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 
                             rounded-xl text-sm text-gray-700 transition-colors"
                    onClick={() => {
                      // This would populate the chat input
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input) {
                        input.value = question;
                        input.focus();
                      }
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Parent Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200"
            >
              <p className="text-xs text-blue-700">
                <strong>For Parents:</strong> All conversations are saved for your review. 
                Claude provides age-appropriate responses with no external links. 
                Daily limit: 50 messages.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaudeChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🤖
        </motion.div>
      </div>
    }>
      <ClaudeChatContent />
    </Suspense>
  );
}