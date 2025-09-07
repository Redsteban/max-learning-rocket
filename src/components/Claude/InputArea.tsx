'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, 
  Smile, Paperclip, Camera, Sparkles,
  Keyboard, X, ChevronUp, Zap
} from 'lucide-react';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export default function InputArea({
  input,
  setInput,
  onSendMessage,
  voiceEnabled,
  onVoiceToggle,
  soundEnabled,
  onSoundToggle,
  disabled,
  inputRef
}: InputAreaProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const emojis = ['😊', '🤔', '👍', '❤️', '🎉', '🌟', '🚀', '🦸', '🎨', '🧪', '📚', '🌍'];
  
  const suggestions = [
    "Can you explain that again?",
    "Show me an example",
    "I need help with this",
    "Let's try something else",
    "Can we practice more?",
    "I think I understand now!"
  ];

  useEffect(() => {
    if (voiceEnabled) {
      setIsRecording(true);
      // Animate recording pulse
      const timer = setTimeout(() => {
        setIsRecording(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [voiceEnabled]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const insertEmoji = (emoji: string) => {
    setInput(input + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => onSendMessage(), 100);
  };

  return (
    <div className="border-t bg-white">
      {/* Suggestions Bar */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-medium text-gray-700">Quick Messages</p>
              <button
                onClick={() => setShowSuggestions(false)}
                className="ml-auto p-1 hover:bg-white/50 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => useSuggestion(suggestion)}
                  className="px-3 py-1.5 bg-white rounded-full text-sm hover:shadow-md transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-gray-50 px-4 py-3"
          >
            <div className="flex gap-3">
              {emojis.map((emoji, index) => (
                <motion.button
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => insertEmoji(emoji)}
                  className="text-2xl hover:bg-white rounded p-1 transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="p-4">
        <div className={`flex items-end gap-3 ${disabled ? 'opacity-50' : ''}`}>
          {/* Left Actions */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`p-2.5 rounded-xl transition-colors ${
                showSuggestions 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              disabled={disabled}
              title="Quick messages"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojis(!showEmojis)}
              className={`p-2.5 rounded-xl transition-colors ${
                showEmojis 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              disabled={disabled}
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Input Field Container */}
          <div className="flex-1 relative">
            <motion.div
              animate={inputFocused ? { scale: 1.01 } : { scale: 1 }}
              className={`relative flex items-center ${
                inputFocused 
                  ? 'ring-2 ring-blue-400 ring-offset-2' 
                  : ''
              } rounded-2xl transition-all`}
            >
              {/* Recording Animation */}
              {voiceEnabled && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(239, 68, 68, 0.4)',
                      '0 0 0 10px rgba(239, 68, 68, 0)',
                      '0 0 0 0 rgba(239, 68, 68, 0)'
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  voiceEnabled 
                    ? "🎤 Listening..." 
                    : disabled 
                    ? "Session paused" 
                    : "Type your message or question..."
                }
                className={`w-full px-4 py-3 pr-12 bg-gray-50 rounded-2xl focus:outline-none transition-all ${
                  voiceEnabled ? 'bg-red-50' : ''
                }`}
                disabled={disabled || voiceEnabled}
              />

              {/* Character Counter */}
              {input.length > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {input.length}/500
                </span>
              )}
            </motion.div>

            {/* Typing Indicator for Voice */}
            {voiceEnabled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                Listening...
              </motion.div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex gap-2">
            {/* Voice Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onVoiceToggle}
              className={`p-3 rounded-xl transition-all ${
                voiceEnabled
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              disabled={disabled}
              title={voiceEnabled ? "Stop recording" : "Start voice input"}
            >
              {voiceEnabled ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>

            {/* Sound Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSoundToggle}
              className={`p-3 rounded-xl transition-colors ${
                soundEnabled
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </motion.button>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendMessage}
              disabled={disabled || !input.trim()}
              className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                disabled || !input.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {input.trim() && !disabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              )}
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Input Hints */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Press Enter to send
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              Click mic for voice
            </span>
            <span className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3" />
              Quick messages
            </span>
          </div>
          
          {/* Power-up Indicator */}
          {!disabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs"
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">Ready to learn!</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}