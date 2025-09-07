'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Expanded emoji options with categories for Max to choose from
const EMOJI_CATEGORIES = {
  'Animals': ['🐶', '🐱', '🦁', '🐯', '🦊', '🦝', '🐻', '🐼', '🐨', '🐵', '🦄', '🦖'],
  'Sports & Games': ['⚽', '🏀', '🏈', '⚾', '🎮', '🎯', '🎪', '🎨', '🎭', '🎪', '🎳', '🏆'],
  'Food': ['🍕', '🍔', '🌮', '🍦', '🍩', '🍪', '🧁', '🍰', '🍫', '🍿', '🥤', '🍉'],
  'Space & Nature': ['🌟', '⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '💧', '🌊', '🚀', '🛸', '🪐'],
  'Fun Stuff': ['💎', '🎈', '🎁', '🎊', '✨', '💫', '🌺', '🏰', '🗿', '🎢', '🎡', '🎠'],
  'Vehicles': ['🚗', '🏎️', '🚁', '✈️', '🚢', '🚂', '🚜', '🛵', '🛴', '🚲', '🛹', '🚤']
};

export default function MaxLoginPage() {
  const router = useRouter();
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [maxName, setMaxName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showParentAccess, setShowParentAccess] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [activeCategory, setActiveCategory] = useState('Animals');

  // Check if Max has set up his account
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      checkSetupStatus();
    }
  }, []);

  const checkSetupStatus = () => {
    try {
      // Check localStorage for setup completion
      const setupComplete = localStorage.getItem('maxSetupComplete');
      const storedName = localStorage.getItem('maxName');
      const emojiPassword = localStorage.getItem('maxEmojiPassword');
      
      if (setupComplete === 'true' && storedName && emojiPassword) {
        setIsSetup(true);
        setMaxName(storedName);
        // Don't redirect immediately, show the login interface
      } else {
        setIsSetup(false);
        // Don't redirect, show the setup interface
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      setIsSetup(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (selectedEmojis.includes(emoji)) {
      // Remove if already selected
      setSelectedEmojis(selectedEmojis.filter(e => e !== emoji));
    } else if (selectedEmojis.length < 4) {
      // Add if under 4 emojis
      setSelectedEmojis([...selectedEmojis, emoji]);
      
      // Auto-login when 4 emojis are selected
      if (selectedEmojis.length === 3) {
        const newSelection = [...selectedEmojis, emoji];
        setTimeout(() => handleLogin(newSelection), 300);
      }
    }
  };

  const handleLogin = async (emojis = selectedEmojis) => {
    if (emojis.length !== 4) {
      setError('Pick 4 emojis for your password!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, check if the emoji password matches what's stored in localStorage
      const storedEmojiPassword = localStorage.getItem('maxEmojiPassword');
      if (storedEmojiPassword) {
        const correctPassword = JSON.parse(storedEmojiPassword);
        if (JSON.stringify(emojis) !== JSON.stringify(correctPassword)) {
          setError('Oops! Wrong password. Try again!');
          setSelectedEmojis([]);
          setIsLoading(false);
          return;
        }
      } else {
        // If no stored password, check against the default "max" user
        const defaultPassword = ['🌟', '🚀', '🌈', '🎮'];
        if (JSON.stringify(emojis) !== JSON.stringify(defaultPassword)) {
          setError('Oops! Wrong password. Try again!');
          setSelectedEmojis([]);
          setIsLoading(false);
          return;
        }
      }

      // If password is correct, create a simple session
      const user = {
        id: 'user-1',
        username: maxName?.toLowerCase() || 'max',
        name: maxName || 'Max',
        role: 'child',
        grade: 4,
        avatar: '🦸',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store session data
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('maxLoggedIn', 'true');
      
      // Celebration animation
      const celebration = document.createElement('div');
      celebration.innerHTML = '🎉';
      celebration.style.cssText = 'position:fixed;top:50%;left:50%;font-size:100px;z-index:9999;animation:celebrate 1s ease-out';
      document.body.appendChild(celebration);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      setError('Something went wrong. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check against the default parent password or stored parent password
      const storedParentPassword = localStorage.getItem('parentPassword');
      const correctPassword = storedParentPassword || 'parent123';
      
      if (parentPassword !== correctPassword) {
        setError('Wrong password');
        setIsLoading(false);
        return;
      }

      // Create parent session
      const user = {
        id: 'user-2',
        username: 'parent',
        name: 'Parent',
        role: 'parent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem('token', 'parent-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('parentLoggedIn', 'true');
      
      router.push('/parent/dashboard');
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show loading screen, show the main interface immediately
  // if (isSetup === null) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
  //       <motion.div
  //         animate={{ rotate: 360 }}
  //         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  //       >
  //         <Sparkles className="w-16 h-16 text-white" />
  //       </motion.div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      <style jsx global>{`
        @keyframes celebrate {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.5) rotate(180deg); }
          100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Main Login Screen */}
      <div className="max-w-4xl mx-auto pt-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
            {maxName ? `Hi ${maxName}!` : "Max's Learning Adventure"}
          </h1>
          <p className="text-2xl text-white/90">Pick your 4 secret emojis to enter! 🎮</p>
        </motion.div>

        {/* Password Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6 max-w-md mx-auto"
        >
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
                  ${selectedEmojis[index] 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg' 
                    : 'bg-gray-200 border-3 border-dashed border-gray-400'}`}
                animate={selectedEmojis[index] ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {selectedEmojis[index] || '?'}
              </motion.div>
            ))}
          </div>
          
          {selectedEmojis.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedEmojis([])}
              className="mt-4 text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Clear and try again
            </motion.button>
          )}
        </motion.div>

        {/* Category Tabs */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-6 md:grid-cols-8 gap-3"
          >
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                disabled={selectedEmojis.length >= 4 && !selectedEmojis.includes(emoji)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  text-5xl p-4 rounded-2xl transition-all
                  ${selectedEmojis.includes(emoji)
                    ? 'bg-gradient-to-br from-green-400 to-blue-500 shadow-lg ring-4 ring-green-300'
                    : selectedEmojis.length >= 4
                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md cursor-pointer'
                  }
                `}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-center max-w-md mx-auto font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="bg-white rounded-full p-8"
            >
              <Sparkles className="w-16 h-16 text-purple-500" />
            </motion.div>
          </div>
        )}

        {/* Setup New Account Button */}
        {!maxName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 left-8"
          >
            <button
              onClick={() => router.push('/register')}
              className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-bold text-purple-600"
            >
              <Plus className="w-5 h-5" />
              First Time? Create Password
            </button>
          </motion.div>
        )}

        {/* Parent Access (Hidden) */}
        <button
          onClick={() => setShowParentAccess(!showParentAccess)}
          className="fixed bottom-8 right-8 text-white/50 hover:text-white/80 transition-colors"
        >
          <Lock className="w-6 h-6" />
        </button>

        {/* Parent Login Modal */}
        {showParentAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowParentAccess(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-4">Parent Access</h3>
              <input
                type="password"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleParentLogin()}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none mb-4"
                placeholder="Enter parent password"
                autoFocus
              />
              <button
                onClick={handleParentLogin}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold hover:shadow-lg transition-all"
              >
                Login as Parent
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Demo: username "parent", password "parent123"
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}