'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ChevronRight, ChevronLeft, Rocket, 
  Heart, Brain, Palette, Music, Globe, 
  Calculator, Book, Microscope, Code, 
  Gamepad2, Camera, Trophy, Star
} from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const INTERESTS: Interest[] = [
  { id: 'math', name: 'Math & Numbers', icon: <Calculator className="w-8 h-8" />, color: 'from-blue-400 to-blue-600' },
  { id: 'science', name: 'Science & Nature', icon: <Microscope className="w-8 h-8" />, color: 'from-green-400 to-green-600' },
  { id: 'art', name: 'Art & Drawing', icon: <Palette className="w-8 h-8" />, color: 'from-purple-400 to-purple-600' },
  { id: 'music', name: 'Music & Sounds', icon: <Music className="w-8 h-8" />, color: 'from-pink-400 to-pink-600' },
  { id: 'reading', name: 'Reading & Stories', icon: <Book className="w-8 h-8" />, color: 'from-yellow-400 to-yellow-600' },
  { id: 'coding', name: 'Coding & Tech', icon: <Code className="w-8 h-8" />, color: 'from-indigo-400 to-indigo-600' },
  { id: 'games', name: 'Games & Puzzles', icon: <Gamepad2 className="w-8 h-8" />, color: 'from-red-400 to-red-600' },
  { id: 'photography', name: 'Photos & Videos', icon: <Camera className="w-8 h-8" />, color: 'from-teal-400 to-teal-600' },
  { id: 'sports', name: 'Sports & Fitness', icon: <Trophy className="w-8 h-8" />, color: 'from-orange-400 to-orange-600' },
  { id: 'geography', name: 'World & Places', icon: <Globe className="w-8 h-8" />, color: 'from-cyan-400 to-cyan-600' },
];

const EMOJI_CATEGORIES = {
  'Animals': ['🐶', '🐱', '🦁', '🐯', '🦊', '🦝', '🐻', '🐼', '🐨', '🐵', '🦄', '🦖'],
  'Sports & Games': ['🎮', '⚽', '🏀', '🎯', '🎪', '🎨', '🎭', '🎢', '🎡', '🎠', '🏆', '🎳'],
  'Food': ['🍕', '🍔', '🌮', '🍦', '🍩', '🍪', '🧁', '🍰', '🍫', '🍿', '🥤', '🍉'],
  'Space & Nature': ['🌟', '⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '💧', '🌊', '🚀', '🛸', '🪐'],
  'Fun Stuff': ['🎈', '🎉', '🎊', '🎁', '🎀', '💎', '🏖️', '🏰', '🎸', '🥳', '🤖', '👾'],
  'Vehicles': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚁', '🚂'],
};

export default function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: [] as string[],
    favoriteColor: '',
    animalPassword: [] as string[],
    parentEmail: '',
    parentPassword: '',
  });
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Animals');
  const [isLoading, setIsLoading] = useState(false);
  const [nameInputValue, setNameInputValue] = useState('');

  const colors = [
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
    { name: 'Green', value: 'green', bg: 'bg-green-500' },
    { name: 'Pink', value: 'pink', bg: 'bg-pink-500' },
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
    { name: 'Red', value: 'red', bg: 'bg-red-500' },
    { name: 'Teal', value: 'teal', bg: 'bg-teal-500' },
  ];

  const handleInterestToggle = (interestId: string) => {
    if (formData.interests.includes(interestId)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interestId)
      });
    } else if (formData.interests.length < 5) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestId]
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (formData.animalPassword.includes(emoji)) {
      setFormData({
        ...formData,
        animalPassword: formData.animalPassword.filter(e => e !== emoji)
      });
    } else if (formData.animalPassword.length < 4) {
      setFormData({
        ...formData,
        animalPassword: [...formData.animalPassword, emoji]
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameInputValue(value);
    setFormData({ ...formData, name: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Store Max's profile locally (no server needed for kid's app)
      localStorage.setItem('maxSetupComplete', 'true');
      localStorage.setItem('maxName', formData.name);
      localStorage.setItem('maxAge', formData.age);
      localStorage.setItem('maxInterests', JSON.stringify(formData.interests));
      localStorage.setItem('maxFavoriteColor', formData.favoriteColor);
      localStorage.setItem('maxEmojiPassword', JSON.stringify(formData.animalPassword));
      
      // Store parent info separately (optional)
      if (formData.parentEmail) {
        localStorage.setItem('parentEmail', formData.parentEmail);
      }
      if (formData.parentPassword) {
        localStorage.setItem('parentPassword', formData.parentPassword);
      }
      
      // Create a simple username from the name
      const username = formData.name.toLowerCase().replace(/\s+/g, '');
      localStorage.setItem('maxUsername', username);
      
      // Redirect to main page
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return nameInputValue.length > 0 && formData.age;
      case 2: return formData.interests.length >= 3;
      case 3: return formData.favoriteColor;
      case 4: return formData.animalPassword.length === 4;
      case 5: return formData.parentEmail && formData.parentPassword.length >= 6;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`text-white font-bold ${step >= s ? 'opacity-100' : 'opacity-50'}`}
            >
              Step {s}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Name and Age */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-center mb-8 text-black">
                Let's Get Started! 🚀
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-2">What's your name?</label>
                  <input
                    type="text"
                    value={nameInputValue}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-black font-bold"
                    style={{ color: '#1f2937' }}
                  />
                  {nameInputValue && (
                    <p className="mt-2 text-sm text-purple-600">
                      Nice to meet you, {nameInputValue}! 👋
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">How old are you?</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <button
                        key={age}
                        onClick={() => setFormData({ ...formData, age: age.toString() })}
                        className={`py-3 rounded-xl font-bold text-lg transition-all ${
                          formData.age === age.toString()
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-center mb-4 text-black">
                What do you love learning about? 🎯
              </h2>
              <p className="text-center text-black font-semibold mb-8">Pick at least 3 things you enjoy!</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INTERESTS.map((interest) => (
                  <motion.button
                    key={interest.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`p-4 rounded-2xl transition-all ${
                      formData.interests.includes(interest.id)
                        ? `bg-gradient-to-br ${interest.color} text-white shadow-lg`
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {interest.icon}
                      <span className="font-semibold">{interest.name}</span>
                      {formData.interests.includes(interest.id) && (
                        <Star className="w-5 h-5 fill-current" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-purple-600">
                  Selected: {formData.interests.length}/5
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Favorite Color */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-center mb-8 text-black">
                Pick your favorite color! 🎨
              </h2>
              
              <div className="grid grid-cols-4 gap-4">
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, favoriteColor: color.value })}
                    className={`aspect-square rounded-2xl ${color.bg} relative overflow-hidden ${
                      formData.favoriteColor === color.value ? 'ring-4 ring-offset-4 ring-gray-800' : ''
                    }`}
                  >
                    {formData.favoriteColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Star className="w-12 h-12 text-white fill-current" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Animal Password */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-center mb-2 text-black">
                Hi {formData.name || 'Friend'}! 
              </h2>
              <h3 className="text-2xl font-bold text-center mb-4 text-black">
                Create your secret emoji password! 🔐
              </h3>
              <p className="text-center text-black font-semibold mb-6">Pick 4 emojis in order - remember them!</p>
              
              {/* Password Display */}
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${
                      formData.animalPassword[index]
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                        : 'bg-gray-200 border-3 border-dashed border-gray-400'
                    }`}
                  >
                    {formData.animalPassword[index] || (index + 1)}
                  </div>
                ))}
              </div>

              {/* Category Tabs */}
              <div className="flex justify-center gap-2 mb-4">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveEmojiCategory(category)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      activeEmojiCategory === category
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-6 gap-3">
                {EMOJI_CATEGORIES[activeEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`aspect-square text-4xl rounded-xl flex items-center justify-center ${
                      formData.animalPassword.includes(emoji)
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    disabled={formData.animalPassword.includes(emoji)}
                  >
                    {emoji}
                    {formData.animalPassword.includes(emoji) && (
                      <div className="absolute top-0 right-0 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-purple-600">
                        {formData.animalPassword.indexOf(emoji) + 1}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {formData.animalPassword.length === 4 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 p-4 bg-green-100 rounded-xl text-center"
                >
                  <p className="text-green-800 font-semibold">
                    Great password! Remember: {formData.animalPassword.join(' ')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 5: Parent Setup */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <h2 className="text-4xl font-bold text-center mb-4 text-black">
                Parent Setup 👨‍👩‍👧‍👦
              </h2>
              <p className="text-center text-black font-semibold mb-8">Let's add your parent's info for safety!</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold mb-2">Parent's Email</label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@email.com"
                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-black font-bold"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Parent's Password</label>
                  <input
                    type="password"
                    value={formData.parentPassword}
                    onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                    placeholder="Create a parent password"
                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-black font-bold"
                  />
                  <p className="text-sm text-gray-500 mt-2">At least 6 characters</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="max-w-2xl mx-auto mt-8 flex justify-between">
        {step > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/90 rounded-full font-bold text-purple-600 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: canProceed() ? 1.05 : 1 }}
          whileTap={{ scale: canProceed() ? 0.95 : 1 }}
          onClick={() => {
            if (step === 5 && canProceed()) {
              handleSubmit();
            } else if (canProceed()) {
              setStep(step + 1);
            }
          }}
          disabled={!canProceed() || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg ml-auto ${
            canProceed()
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : step === 5 ? (
            <>
              <Rocket className="w-5 h-5" />
              Start Adventure!
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}