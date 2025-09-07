'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import {
  Flame,
  Star,
  Trophy,
  Calendar,
  Rocket,
  BookOpen,
  Calculator,
  Globe,
  Lightbulb,
  DollarSign,
  CheckCircle,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  LogOut,
  User,
  Target,
  Zap,
  Heart
} from 'lucide-react';

// Daily missions for Grade 4
const DAILY_MISSIONS = [
  { id: 1, text: "🌊 Invent something to help ocean animals", xp: 100 },
  { id: 2, text: "⏰ Write a story about time travel", xp: 120 },
  { id: 3, text: "🚀 Design your own spaceship", xp: 100 },
  { id: 4, text: "🔬 Create a new science experiment", xp: 150 },
  { id: 5, text: "🗺️ Draw a map of an imaginary country", xp: 100 },
  { id: 6, text: "🎨 Make art using only circles", xp: 80 },
  { id: 7, text: "📖 Write a poem about your favorite food", xp: 90 },
  { id: 8, text: "🧮 Solve the mystery math puzzle", xp: 110 },
  { id: 9, text: "🌍 Learn 5 facts about a new country", xp: 100 },
  { id: 10, text: "💡 Think of 10 uses for a paperclip", xp: 70 }
];

// Module schedule
const MODULE_SCHEDULE: { [key: number]: { name: string; icon: JSX.Element; color: string; path: string } } = {
  1: { name: "Science Explorer", icon: <Lightbulb className="w-8 h-8" />, color: "from-green-400 to-teal-500", path: "/learn/science" },
  2: { name: "Math Wizard", icon: <Calculator className="w-8 h-8" />, color: "from-purple-400 to-pink-500", path: "/learn/math" },
  3: { name: "Story Creator", icon: <BookOpen className="w-8 h-8" />, color: "from-orange-400 to-red-500", path: "/learn/stories" },
  4: { name: "World Explorer", icon: <Globe className="w-8 h-8" />, color: "from-blue-400 to-indigo-500", path: "/learn/world" },
  5: { name: "Future CEO", icon: <DollarSign className="w-8 h-8" />, color: "from-yellow-400 to-orange-500", path: "/learn/entrepreneur" },
  0: { name: "Creative Lab", icon: <Sparkles className="w-8 h-8" />, color: "from-pink-400 to-purple-500", path: "/learn/creative" },
  6: { name: "Adventure Quest", icon: <Rocket className="w-8 h-8" />, color: "from-indigo-400 to-purple-500", path: "/learn/adventure" }
};

// Level thresholds
const LEVELS = [
  { name: "Explorer", minXP: 0, color: "text-green-500", icon: "🌱" },
  { name: "Adventurer", minXP: 500, color: "text-blue-500", icon: "⚡" },
  { name: "Scholar", minXP: 1500, color: "text-purple-500", icon: "📚" },
  { name: "Master", minXP: 3000, color: "text-orange-500", icon: "🏆" },
  { name: "Legend", minXP: 5000, color: "text-yellow-500", icon: "👑" }
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️", icon: <Sun className="w-6 h-6 text-yellow-400" /> };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️", icon: <Cloud className="w-6 h-6 text-blue-400" /> };
  return { text: "Good evening", emoji: "🌙", icon: <Moon className="w-6 h-6 text-indigo-400" /> };
}

function getKidFriendlyDate() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = new Date();
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(7);
  const [totalXP, setTotalXP] = useState(1250);
  const [badges, setBadges] = useState(12);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [todayMission, setTodayMission] = useState(DAILY_MISSIONS[0]);
  const [animateXP, setAnimateXP] = useState(false);

  // Check if user is logged in
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
    // Random daily mission
    const missionIndex = new Date().getDate() % DAILY_MISSIONS.length;
    setTodayMission(DAILY_MISSIONS[missionIndex]);
    
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('maxProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setStreak(progress.streak || 7);
      setTotalXP(progress.totalXP || 1250);
      setBadges(progress.badges || 12);
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('maxProgress', JSON.stringify({
      streak,
      totalXP,
      badges
    }));
  }, [streak, totalXP, badges]);

  const greeting = getGreeting();
  const currentLevel = getLevel(totalXP);
  const dayOfWeek = new Date().getDay();
  const todayModule = MODULE_SCHEDULE[dayOfWeek];

  const completeMission = () => {
    if (!missionCompleted) {
      setMissionCompleted(true);
      setTotalXP(prev => prev + todayMission.xp);
      setAnimateXP(true);
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => setAnimateXP(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-pink-400 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="w-16 h-16 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-pink-400 p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-xl"
      >
        <div className="flex justify-between items-center">
          <div>
            <motion.h1
              animate={{
                backgroundImage: [
                  'linear-gradient(to right, #8b5cf6, #ec4899)',
                  'linear-gradient(to right, #ec4899, #f59e0b)',
                  'linear-gradient(to right, #f59e0b, #10b981)',
                  'linear-gradient(to right, #10b981, #3b82f6)',
                  'linear-gradient(to right, #3b82f6, #8b5cf6)'
                ]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2"
            >
              Max's Learning Adventure 🚀
            </motion.h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="text-lg">{getKidFriendlyDate()}</span>
              <div className="flex items-center gap-2">
                {greeting.icon}
                <span className="text-lg font-medium">{greeting.text}, {userName || 'Max'}! {greeting.emoji}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white shadow-lg"
            >
              <User className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem('maxLoggedIn');
                router.push('/login');
              }}
              className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white shadow-lg"
            >
              <LogOut className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <motion.span
              animate={{ rotate: animateXP ? [0, 360] : 0 }}
              className="text-2xl"
            >
              ⭐
            </motion.span>
          </div>
          <motion.div
            key={totalXP}
            initial={{ scale: animateXP ? 1.5 : 1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gray-800"
          >
            {totalXP}
          </motion.div>
          <div className="text-sm text-gray-600">Total XP</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8" />
            <span className="text-2xl">{currentLevel.icon}</span>
          </div>
          <div className={`text-2xl font-bold ${currentLevel.color}`}>
            {currentLevel.name}
          </div>
          <div className="text-sm text-gray-600">Current Level</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-purple-500" />
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              🏆
            </motion.span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{badges}</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
        </motion.div>
      </div>

      {/* Daily Mission Card */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center gap-2">
              <Target className="w-8 h-8 text-purple-500" />
              Today's Mission
            </h2>
            <p className="text-xl text-gray-700 mb-4">{todayMission.text}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 bg-yellow-100 px-3 py-1 rounded-full">
                +{todayMission.xp} XP
              </span>
              {missionCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500 font-bold"
                >
                  ✅ Completed!
                </motion.span>
              )}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={completeMission}
            disabled={missionCompleted}
            className={`p-4 rounded-full ${
              missionCompleted 
                ? 'bg-green-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            } text-white shadow-lg transition-all`}
          >
            {missionCompleted ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Today's Focus */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-500" />
          Today's Focus
        </h2>
        
        <Link href={todayModule.path}>
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-r ${todayModule.color} p-8 rounded-2xl text-white shadow-lg cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">{todayModule.name}</h3>
                <p className="text-lg opacity-90">Click to start today's adventure!</p>
              </div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-white/20 p-6 rounded-full"
              >
                {todayModule.icon}
              </motion.div>
            </div>
          </motion.div>
        </Link>

        {/* Quick Links to Other Modules */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {Object.entries(MODULE_SCHEDULE)
            .filter(([day]) => parseInt(day) !== dayOfWeek)
            .map(([day, module]) => (
              <Link key={day} href={module.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-r ${module.color} p-2 rounded-lg text-white`}>
                      {React.cloneElement(module.icon, { className: "w-5 h-5" })}
                    </div>
                    <span className="text-gray-700 font-medium">{module.name}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
        </div>
      </motion.div>

      {/* Floating decorations */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        {['🌟', '💫', '✨'].map((star, index) => (
          <motion.span
            key={index}
            className="text-4xl"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            {star}
          </motion.span>
        ))}
      </div>
    </div>
  );
}