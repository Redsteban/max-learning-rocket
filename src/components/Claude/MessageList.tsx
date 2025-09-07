'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Trophy, Star, Heart, Brain, Zap,
  Volume2, Copy, ThumbsUp, HelpCircle, Award,
  CheckCircle, AlertCircle, Info, Lightbulb
} from 'lucide-react';
import { TutorMessage } from './TutorChat';

interface MessageListProps {
  messages: TutorMessage[];
  isTyping: boolean;
  onSpeakMessage: (text: string) => void;
  soundEnabled: boolean;
}

export default function MessageList({
  messages,
  isTyping,
  onSpeakMessage,
  soundEnabled
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getEmotionEmoji = (emotion?: TutorMessage['emotion']) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'thinking': return '🤔';
      case 'celebrating': return '🎉';
      case 'encouraging': return '💪';
      default: return '🤖';
    }
  };

  const formatMessage = (content: string) => {
    // Parse markdown-style formatting
    return content
      .split('\n')
      .map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold mt-3 mb-2">
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold mt-3 mb-2">
              {line.substring(3)}
            </h2>
          );
        }
        
        // Lists
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <li key={idx} className="ml-4 mb-1">
              {line.substring(2)}
            </li>
          );
        }
        
        // Code blocks
        if (line.startsWith('```')) {
          return null; // Handle in a more complex way if needed
        }
        
        // Bold text
        const boldPattern = /\*\*(.*?)\*\*/g;
        const parts = line.split(boldPattern);
        
        return (
          <p key={idx} className="mb-2">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-[70%] ${
              message.role === 'user' ? 'order-2' : 'order-1'
            }`}>
              {/* Avatar */}
              <div className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-400 to-purple-400'
                      : message.role === 'system'
                      ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                      : 'bg-gradient-to-br from-green-400 to-teal-400'
                  }`}
                >
                  {message.role === 'user' ? '🦸' : 
                   message.role === 'system' ? '⚙️' : 
                   getEmotionEmoji(message.emotion)}
                </motion.div>

                {/* Message Bubble */}
                <div className={`relative ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`rounded-2xl px-5 py-3 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        : message.role === 'system'
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-gray-800 border-2 border-yellow-300'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {/* XP Award Badge */}
                    {message.xpAwarded && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        +{message.xpAwarded} XP
                      </motion.div>
                    )}

                    {/* Achievement Badge */}
                    {message.achievement && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{message.achievement.icon}</span>
                          <div>
                            <p className="font-bold">{message.achievement.name}</p>
                            <p className="text-xs opacity-90">{message.achievement.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Message Content */}
                    <div className={`${
                      message.role === 'user' ? 'text-white' : ''
                    }`}>
                      {typeof message.content === 'string' 
                        ? formatMessage(message.content)
                        : message.content}
                    </div>

                    {/* Interactive Elements */}
                    {message.interactiveElements && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.interactiveElements.map((element, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm transition-colors"
                            onClick={() => {
                              // Handle interactive element action
                              console.log('Interactive action:', element.action);
                            }}
                          >
                            {element.label}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="mt-3 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSpeakMessage(message.content)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Read aloud"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Good answer!"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl px-5 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      animate={{
                        y: [0, -8, 0]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15
                      }}
                    />
                  ))}
                </motion.div>
                <span className="text-gray-500 text-sm ml-2">
                  Claude is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
}