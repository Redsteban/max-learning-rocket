'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Play, CheckCircle, Star, Trophy, 
  Rocket, Brain, Sparkles, Award, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  emoji: string;
}

interface LearningModuleProps {
  subject: string;
  icon: React.ReactNode;
  color: string;
  lessons: Lesson[];
}

export default function LearningModule({ subject, icon, color, lessons: initialLessons }: LearningModuleProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check authentication
    const loggedIn = localStorage.getItem('maxLoggedIn');
    if (loggedIn !== 'true') {
      router.push('/login');
    }

    // Load progress
    const savedProgress = localStorage.getItem(`${subject.toLowerCase()}_progress`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setLessons(lessons.map(lesson => ({
        ...lesson,
        completed: progress[lesson.id] || false
      })));
    }
  }, [subject, router]);

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(true);
  };

  const completeLesson = () => {
    if (!currentLesson) return;

    // Mark lesson as completed
    const updatedLessons = lessons.map(l => 
      l.id === currentLesson.id ? { ...l, completed: true } : l
    );
    setLessons(updatedLessons);

    // Save progress
    const progress = updatedLessons.reduce((acc, lesson) => ({
      ...acc,
      [lesson.id]: lesson.completed
    }), {});
    localStorage.setItem(`${subject.toLowerCase()}_progress`, JSON.stringify(progress));

    // Award XP
    setTotalXP(prev => prev + currentLesson.xp);

    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Reset
    setTimeout(() => {
      setCurrentLesson(null);
      setIsPlaying(false);
    }, 2000);
  };

  const completedCount = lessons.filter(l => l.completed).length;
  const progressPercentage = (completedCount / lessons.length) * 100;

  if (isPlaying && currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsPlaying(false)}
                className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-lg">+{currentLesson.xp} XP</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentLesson.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{currentLesson.title}</h2>
              <p className="text-lg text-gray-600">{currentLesson.description}</p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-8 mb-6">
              <div className="text-center">
                <p className="text-xl mb-4">🎮 Interactive lesson content would go here!</p>
                <p className="text-gray-600">This is where Max would:</p>
                <ul className="text-left max-w-md mx-auto mt-4 space-y-2">
                  <li>• Watch fun videos</li>
                  <li>• Play educational games</li>
                  <li>• Solve puzzles</li>
                  <li>• Do experiments</li>
                  <li>• Answer questions</li>
                </ul>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={completeLesson}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-xl shadow-lg"
            >
              Complete Lesson! 🎉
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </motion.button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{totalXP} XP</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="font-bold">{completedCount}/{lessons.length}</span>
            </div>
          </div>
        </div>

        {/* Module Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`bg-gradient-to-r ${color} p-8 rounded-3xl text-white shadow-xl mb-8`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                {icon}
                {subject}
              </h1>
              <p className="text-xl opacity-90">Let's learn something amazing today!</p>
            </div>
            <div className="text-6xl">🚀</div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="bg-white/30 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startLesson(lesson)}
                disabled={lesson.completed}
                className={`w-full p-6 rounded-2xl shadow-lg transition-all ${
                  lesson.completed 
                    ? 'bg-gray-100 opacity-75' 
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{lesson.emoji}</div>
                  {lesson.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Play className="w-6 h-6 text-purple-500" />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 text-left">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-600 text-left mb-4">
                  {lesson.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-600">
                    +{lesson.xp} XP
                  </span>
                  {!lesson.completed && (
                    <span className="text-sm text-gray-500">Click to start!</span>
                  )}
                  {lesson.completed && (
                    <span className="text-sm text-green-600 font-bold">Completed!</span>
                  )}
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Encouragement */}
        {completedCount === lessons.length && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-3xl text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-2">🎉 Amazing Job!</h2>
            <p>You've completed all {subject} lessons! You're a superstar!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}