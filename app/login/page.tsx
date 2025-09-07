'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, RefreshCw, Home, UserPlus, KeyRound, HelpCircle, LogIn } from 'lucide-react';

const EMOJI_CATEGORIES = {
  'Animals': ['🐶', '🐱', '🦁', '🐯', '🦊', '🦝', '🐻', '🐼', '🐨', '🐵', '🦄', '🦖'],
  'Sports & Games': ['🎮', '⚽', '🏀', '🎯', '🎪', '🎨', '🎭', '🎢', '🎡', '🎠', '🏆', '🎳'],
  'Food': ['🍕', '🍔', '🌮', '🍦', '🍩', '🍪', '🧁', '🍰', '🍫', '🍿', '🥤', '🍉'],
  'Space & Nature': ['🌟', '⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '💧', '🌊', '🚀', '🛸', '🪐'],
  'Fun Stuff': ['🎈', '🎉', '🎊', '🎁', '🎀', '💎', '🏖️', '🏰', '🎸', '🥳', '🤖', '👾'],
  'Vehicles': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚁', '🚂'],
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('Animals');
  const [userName, setUserName] = useState('');
  const [showError, setShowError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Get the user's name from localStorage
    const storedName = localStorage.getItem('maxName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    if (selectedEmojis.length < 4) {
      setSelectedEmojis([...selectedEmojis, emoji]);
      setShowError(false);
    }
  };

  const handleReset = () => {
    setSelectedEmojis([]);
    setShowError(false);
  };

  const handleForgotPassword = () => {
    setShowResetModal(true);
  };

  const handleResetPassword = () => {
    // Check if parent email matches
    const storedParentEmail = localStorage.getItem('parentEmail');
    
    if (parentEmail && parentEmail === storedParentEmail) {
      // Show the stored password to the parent
      const storedPassword = localStorage.getItem('maxEmojiPassword');
      if (storedPassword) {
        const emojis = JSON.parse(storedPassword);
        alert(`Max's password is: ${emojis.join(' ')}\n\nPlease help Max remember it!`);
        setResetSuccess(true);
        setTimeout(() => {
          setShowResetModal(false);
          setResetSuccess(false);
          setParentEmail('');
        }, 2000);
      }
    } else {
      alert('Parent email does not match. Please contact support if you need help.');
    }
  };

  const handleLogin = async () => {
    if (selectedEmojis.length !== 4) return;

    setIsChecking(true);
    
    // Get stored password
    const storedPassword = localStorage.getItem('maxEmojiPassword');
    
    if (storedPassword) {
      const correctPassword = JSON.parse(storedPassword);
      
      // Check if password matches
      const isCorrect = selectedEmojis.every((emoji, index) => emoji === correctPassword[index]);
      
      if (isCorrect) {
        // Success animation
        setTimeout(() => {
          localStorage.setItem('maxLoggedIn', 'true');
          router.push('/dashboard');
        }, 500);
      } else {
        // Show error
        setShowError(true);
        setTimeout(() => {
          handleReset();
        }, 2000);
      }
    } else {
      // No password set, redirect to register
      router.push('/register');
    }
    
    setIsChecking(false);
  };

  // Removed auto-submit - now Max needs to click "Enter Here!" button

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12" />
            Hi {userName || 'Friend'}!
            <Sparkles className="w-12 h-12" />
          </h1>
          <p className="text-white/90 text-xl">Pick your 4 secret emojis to enter! 🎮</p>
        </motion.div>

        {/* Password Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 mb-6"
        >
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all ${
                  selectedEmojis[index]
                    ? showError
                      ? 'bg-red-500 animate-shake'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                    : 'bg-gray-200 border-3 border-dashed border-gray-400'
                }`}
              >
                {selectedEmojis[index] || '?'}
              </motion.div>
            ))}
          </div>

          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-600 font-semibold"
            >
              Oops! That's not right. Try again! 🔄
            </motion.p>
          )}
        </motion.div>

        {/* Emoji Selection */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmojiSelect(emoji)}
                disabled={selectedEmojis.length >= 4 || isChecking}
                className={`aspect-square text-3xl rounded-xl flex items-center justify-center transition-all ${
                  selectedEmojis.includes(emoji)
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg opacity-50'
                    : selectedEmojis.length >= 4
                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-6">
          {/* Enter Button - Shows when 4 emojis are selected */}
          {selectedEmojis.length === 4 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold text-white text-lg shadow-xl"
              >
                <LogIn className="w-6 h-6" />
                Enter Here! 🚀
              </motion.button>
            </motion.div>
          )}

          {/* Other Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 bg-white/90 rounded-full font-bold text-black shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Reset
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgotPassword}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-400 rounded-full font-bold text-black shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              Forgot Password?
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/register')}
              className="flex items-center gap-2 px-5 py-3 bg-white/90 rounded-full font-bold text-black shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              New User
            </motion.button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowResetModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-black mb-4">Reset Password 🔑</h2>
            <p className="text-black mb-6">
              Please enter the parent email to view Max's password.
            </p>
            
            {!resetSuccess ? (
              <>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="Parent's email"
                  className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-black font-semibold mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={handleResetPassword}
                    className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition-colors"
                  >
                    Show Password
                  </button>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-black rounded-full font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-green-600 text-xl font-bold mb-2">✓ Success!</div>
                <p className="text-black">Check the alert for Max's password.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}