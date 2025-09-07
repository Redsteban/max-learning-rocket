'use client';

import { useEffect } from 'react';
// Custom logout - no NextAuth needed
import { motion } from 'framer-motion';
import { Rocket, Heart, Star } from 'lucide-react';

export default function LogoutPage() {
  useEffect(() => {
    // Clear localStorage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('maxLoggedIn');
    localStorage.removeItem('parentLoggedIn');
    
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 text-center shadow-2xl"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6"
        >
          <Rocket className="w-16 h-16 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          See You Soon! 👋
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Thanks for learning today!
        </p>
        
        <div className="flex justify-center gap-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Star className="w-8 h-8 text-yellow-400" />
          </motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          >
            <Heart className="w-8 h-8 text-red-400" />
          </motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -360, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1.5
            }}
          >
            <Star className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}