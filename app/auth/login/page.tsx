'use client';

import { useState, useEffect } from 'react';
// Custom authentication - no NextAuth needed
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  User, 
  Lock, 
  Sparkles, 
  Rocket,
  PartyPopper,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ChevronLeft,
  Heart
} from 'lucide-react';

// Animal options for picture password
const ANIMALS = [
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'elephant', emoji: '🐘', name: 'Elephant' },
  { id: 'monkey', emoji: '🐵', name: 'Monkey' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'dragon', emoji: '🐲', name: 'Dragon' },
  { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'tiger', emoji: '🐅', name: 'Tiger' },
  { id: 'koala', emoji: '🐨', name: 'Koala' }
];

// Fun floating shapes for background
const FloatingShape = ({ delay }: { delay: number }) => {
  const shapes = ['⭐', '🌟', '✨', '🎈', '🌈', '☁️', '🎵'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const randomX1 = Math.random() * 100;
  const randomX2 = Math.random() * 100;
  
  return (
    <motion.div
      className="absolute text-4xl pointer-events-none"
      initial={{ 
        x: `${randomX1}vw`,
        y: '100vh'
      }}
      animate={{ 
        y: '-10vh',
        x: `${randomX2}vw`
      }}
      transition={{
        duration: Math.random() * 20 + 10,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {shape}
    </motion.div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'student' | 'parent'>('student');
  const [authMethod, setAuthMethod] = useState<'picture' | 'password'>('picture');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [parentOverride, setParentOverride] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showParentOverride, setShowParentOverride] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset selections when changing modes
  useEffect(() => {
    setSelectedAnimals([]);
    setPassword('');
    setError('');
    setParentOverride('');
  }, [loginMode, authMethod]);

  const handleAnimalSelect = (animalId: string) => {
    if (selectedAnimals.includes(animalId)) {
      // Remove if already selected
      setSelectedAnimals(selectedAnimals.filter(id => id !== animalId));
    } else if (selectedAnimals.length < 3) {
      // Add if less than 3 selected
      setSelectedAnimals([...selectedAnimals, animalId]);
    }
  };

  const triggerSuccessAnimation = () => {
    // Confetti from left
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    });
    
    // Confetti from right
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    });

    setSuccessMessage("🎉 Welcome back! Get ready for adventure!");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (authMethod === 'picture' && loginMode === 'student') {
        // Picture password login
        if (selectedAnimals.length !== 3) {
          setError('Please select 3 animals for your password!');
          setIsLoading(false);
          return;
        }
        
        const picturePassword = selectedAnimals.map(id => 
          ANIMALS.find(a => a.id === id)?.emoji
        ).join('');
        
        // Custom picture password authentication
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            picturePassword: selectedAnimals.map(id => 
              ANIMALS.find(a => a.id === id)?.emoji
            ),
            mode: 'child',
          }),
        });

        const data = await response.json();
        result = { ok: response.ok, error: data.error };
      } else {
        // Regular password login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            mode: loginMode === 'parent' ? 'parent' : 'child',
          }),
        });

        const data = await response.json();
        result = { ok: response.ok, error: data.error };
      }

      if (result?.error) {
        setError(result.error);
        // Shake animation on error
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
          loginForm.classList.add('animate-shake');
          setTimeout(() => loginForm.classList.remove('animate-shake'), 500);
        }
      } else if (result?.ok) {
        triggerSuccessAnimation();
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong! Let\'s try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnimals = () => {
    setSelectedAnimals([]);
    // Fun spinning animation
    const animals = document.querySelectorAll('.animal-button');
    animals.forEach((animal, index) => {
      setTimeout(() => {
        animal.classList.add('animate-spin');
        setTimeout(() => animal.classList.remove('animate-spin'), 500);
      }, index * 50);
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      {/* Animated background shapes */}
      {[...Array(5)].map((_, i) => (
        <FloatingShape key={i} delay={i * 2} />
      ))}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-4 border-white/50">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block text-6xl mb-4"
              >
                🚀
              </motion.div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Max's Learning Adventure
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Ready for fun? Let's go!</p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoginMode('student')}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-lg transition-all ${
                  loginMode === 'student'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User className="inline-block w-5 h-5 mr-2" />
                I'm Max
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoginMode('parent')}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-lg transition-all ${
                  loginMode === 'parent'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Lock className="inline-block w-5 h-5 mr-2" />
                Parent
              </motion.button>
            </div>

            {/* Auth Method Selector (for students) */}
            {loginMode === 'student' && (
              <div className="flex gap-2 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMethod('picture')}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
                    authMethod === 'picture'
                      ? 'bg-yellow-400 text-gray-800 shadow-md'
                      : 'bg-yellow-100 text-gray-600 hover:bg-yellow-200'
                  }`}
                >
                  🐾 Animal Password
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
                    authMethod === 'password'
                      ? 'bg-yellow-400 text-gray-800 shadow-md'
                      : 'bg-yellow-100 text-gray-600 hover:bg-yellow-200'
                  }`}
                >
                  🔤 Text Password
                </motion.button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} id="login-form">
              {/* Username Input */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {loginMode === 'student' ? 'Your Name' : 'Username'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border-3 border-purple-200 focus:border-purple-500 focus:outline-none text-lg font-semibold bg-white/80"
                    placeholder={loginMode === 'student' ? 'Enter your name!' : 'Enter username'}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                </div>
              </div>

              {/* Picture Password for Students */}
              {loginMode === 'student' && authMethod === 'picture' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pick 3 animals in order! ({selectedAnimals.length}/3)
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {ANIMALS.map((animal) => {
                      const isSelected = selectedAnimals.includes(animal.id);
                      const order = selectedAnimals.indexOf(animal.id) + 1;
                      
                      return (
                        <motion.button
                          key={animal.id}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9, rotate: 360 }}
                          onClick={() => handleAnimalSelect(animal.id)}
                          className={`animal-button relative p-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{animal.emoji}</span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-gray-800 rounded-full text-xs font-bold flex items-center justify-center">
                              {order}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedAnimals.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-700">Your password:</span>
                        <div className="flex gap-1">
                          {selectedAnimals.map((id, index) => (
                            <motion.span
                              key={id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-2xl"
                            >
                              {ANIMALS.find(a => a.id === id)?.emoji}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ rotate: 180 }}
                        onClick={resetAnimals}
                        className="p-2 text-purple-600 hover:bg-purple-200 rounded-lg"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* Text Password */}
              {(loginMode === 'parent' || (loginMode === 'student' && authMethod === 'password')) && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pl-10 pr-12 rounded-2xl border-3 border-purple-200 focus:border-purple-500 focus:outline-none text-lg font-semibold bg-white/80"
                      placeholder="Enter your secret password!"
                      required={authMethod === 'password'}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Parent Override Option */}
              {loginMode === 'student' && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowParentOverride(!showParentOverride)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <KeyRound className="w-4 h-4" />
                    Parent helping?
                  </button>
                  
                  {showParentOverride && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2"
                    >
                      <input
                        type="password"
                        value={parentOverride}
                        onChange={(e) => setParentOverride(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
                        placeholder="Parent PIN"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2"
                  >
                    <span className="text-xl">😅</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mb-4 p-3 bg-green-100 border-2 border-green-300 rounded-xl text-green-700 text-sm font-bold flex items-center gap-2"
                  >
                    <PartyPopper className="w-5 h-5" />
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !!successMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isLoading || successMessage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : loginMode === 'student'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Rocket className="w-5 h-5" />
                    </motion.div>
                    Blasting Off...
                  </>
                ) : successMessage ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Welcome!
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Let's Go!
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo Accounts Info */}
            <div className="mt-6 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 text-center font-semibold">
                <span className="text-lg">🎮</span> Demo Accounts:<br />
                Student: max (animals: 🌟🚀🌈)<br />
                Parent: parent / parent123
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom shake animation styles */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}