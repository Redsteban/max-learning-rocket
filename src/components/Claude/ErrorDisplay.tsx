'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, RefreshCw, Wifi, WifiOff, Clock,
  Gamepad2, Home, HelpCircle, Heart, Sparkles,
  Rocket, Shield, Zap, Coffee, Construction
} from 'lucide-react';
import { ErrorType, ERROR_MESSAGES } from '@/src/lib/claude-error-handler';
import { fallbackTutor } from '@/src/lib/fallback-tutor';

interface ErrorDisplayProps {
  errorType: ErrorType;
  onRetry: () => void;
  onGoHome?: () => void;
  onContactParent?: () => void;
  module?: string;
  waitTime?: number;
}

export default function ErrorDisplay({
  errorType,
  onRetry,
  onGoHome,
  onContactParent,
  module = 'general',
  waitTime = 0
}: ErrorDisplayProps) {
  const [countdown, setCountdown] = useState(waitTime);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [miniGameScore, setMiniGameScore] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  
  const errorConfig = ERROR_MESSAGES[errorType];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (waitTime > 0 && countdown === 0) {
      // Auto-retry when countdown reaches 0
      setIsAutoRetrying(true);
      setTimeout(onRetry, 500);
    }
  }, [countdown, waitTime, onRetry]);

  const getErrorIcon = () => {
    switch (errorType) {
      case ErrorType.RATE_LIMIT:
        return <Coffee className="w-16 h-16 text-blue-500" />;
      case ErrorType.NETWORK:
        return <WifiOff className="w-16 h-16 text-orange-500" />;
      case ErrorType.TIMEOUT:
        return <Clock className="w-16 h-16 text-purple-500" />;
      case ErrorType.MAINTENANCE:
        return <Construction className="w-16 h-16 text-yellow-500" />;
      case ErrorType.API_KEY:
        return <Shield className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  const playMiniGame = () => {
    const game = fallbackTutor.getMiniGame();
    if (game) {
      setShowMiniGame(true);
      // Implementation of mini-game would go here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 
                 flex items-center justify-center z-50 p-4"
    >
      <div className="max-w-lg w-full">
        {/* Main Error Card */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Animated Header */}
          <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-6">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="flex justify-center mb-4"
            >
              {getErrorIcon()}
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white text-center"
            >
              {errorConfig.title}
            </motion.h2>
          </div>

          {/* Error Message */}
          <div className="p-6">
            <div className="text-center mb-6">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl inline-block mb-4"
              >
                {errorConfig.emoji}
              </motion.span>
              
              <p className="text-gray-700 text-lg">
                {errorConfig.message}
              </p>
            </div>

            {/* Countdown Timer */}
            {countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4">
                  <p className="text-center text-sm text-gray-600 mb-2">
                    Claude will be back in:
                  </p>
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold text-center bg-gradient-to-r 
                               from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    {countdown}
                  </motion.div>
                  <div className="mt-2 flex justify-center gap-1">
                    {Array.from({ length: Math.min(countdown, 10) }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Retry Button */}
              {!isAutoRetrying && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
                  disabled={countdown > 0}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white 
                            flex items-center justify-center gap-2 transition-all ${
                    countdown > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg'
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </motion.button>
              )}

              {/* Mini-Game Button */}
              {errorConfig.showMiniGame && countdown > 10 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playMiniGame}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 
                           text-white rounded-xl font-bold hover:shadow-lg transition-all
                           flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Play a Game While Waiting!
                </motion.button>
              )}

              {/* Parent Help Button */}
              {errorConfig.parentAlert && onContactParent && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onContactParent}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-400 to-red-400 
                           text-white rounded-xl font-bold hover:shadow-lg transition-all
                           flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  Get Parent Help
                </motion.button>
              )}

              {/* Home Button */}
              {onGoHome && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGoHome}
                  className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-xl 
                           font-bold hover:bg-gray-300 transition-all
                           flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Home
                </motion.button>
              )}
            </div>

            {/* Auto-retry indicator */}
            {isAutoRetrying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center"
              >
                <div className="flex justify-center gap-2 items-center text-green-600">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.div>
                  <span className="font-medium">Reconnecting to Claude...</span>
                </div>
              </motion.div>
            )}

            {/* Encouragement Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl"
            >
              <div className="flex items-center gap-2 text-orange-700">
                <Heart className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Don't worry! Your progress is saved and your streak is safe! 
                  {countdown > 30 && ' Why not grab a snack while we wait?'}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating decorations */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
          className="absolute top-10 left-10 text-4xl"
        >
          🌟
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity
          }}
          className="absolute bottom-10 right-10 text-4xl"
        >
          🚀
        </motion.div>
      </div>

      {/* Mini-Game Modal */}
      <AnimatePresence>
        {showMiniGame && (
          <MiniGameModal
            onClose={() => setShowMiniGame(false)}
            onScoreUpdate={setMiniGameScore}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Mini-game component
function MiniGameModal({ 
  onClose, 
  onScoreUpdate 
}: { 
  onClose: () => void;
  onScoreUpdate: (score: number) => void;
}) {
  const [gameScore, setGameScore] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleClick = () => {
    if (timeLeft > 0) {
      setClicks(clicks + 1);
      const points = Math.floor(Math.random() * 10) + 1;
      setGameScore(gameScore + points);
      onScoreUpdate(gameScore + points);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-center mb-4">
          Star Catcher! ⭐
        </h3>
        
        <div className="text-center mb-4">
          <p className="text-gray-600">Click the stars as fast as you can!</p>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
          {timeLeft > 0 ? (
            <motion.button
              key={clicks}
              initial={{
                x: Math.random() * 200,
                y: Math.random() * 200
              }}
              animate={{
                x: Math.random() * 200,
                y: Math.random() * 200
              }}
              transition={{ duration: 0.5 }}
              onClick={handleClick}
              className="absolute text-4xl hover:scale-125 transition-transform"
            >
              ⭐
            </motion.button>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  Game Over!
                </p>
                <p className="text-4xl font-bold">
                  Score: {gameScore} 🏆
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Score: {gameScore}</span>
          <span className="text-lg font-medium">Clicks: {clicks}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 
                   text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Close Game
        </button>
      </div>
    </motion.div>
  );
}