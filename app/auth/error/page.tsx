'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, Frown } from 'lucide-react';
import Link from 'next/link';

const ERROR_MESSAGES: { [key: string]: string } = {
  Configuration: 'Oops! Something needs to be set up first! 🔧',
  AccessDenied: 'This area is for grown-ups only! 🚫',
  Verification: 'We need to check something first! 🔍',
  Default: 'Uh oh! Something went a bit wobbly! 🤪'
};

const ENCOURAGEMENT = [
  "Don't worry, even rockets have bumpy launches! 🚀",
  "Every great explorer gets lost sometimes! 🗺️",
  "Mistakes help us learn and grow! 🌱",
  "You're doing great! Let's try again! ⭐",
  "Even superheroes need a second try! 🦸"
];

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [encouragement] = useState(
    ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]
  );
  
  const error = searchParams.get('error');
  const errorMessage = error && ERROR_MESSAGES[error] 
    ? ERROR_MESSAGES[error] 
    : ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl"
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full mb-6"
        >
          <Frown className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {errorMessage}
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          {encouragement}
        </p>
        
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
          
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </Link>
        </div>
        
        {/* Animated decorations */}
        <div className="mt-8 flex justify-center gap-2">
          {['🌟', '💫', '✨'].map((star, index) => (
            <motion.span
              key={index}
              className="text-2xl"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}
            >
              {star}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}