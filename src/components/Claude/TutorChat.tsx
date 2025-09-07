'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles,
  HelpCircle, RefreshCw, Zap, Trophy, Pause, Play,
  ChevronUp, ChevronDown, Brain, Lightbulb, Target,
  MessageCircle, Award, Flame, Star, Heart
} from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InteractiveTools from './InteractiveTools';
import InputArea from './InputArea';
import ProgressTracker from './ProgressTracker';
import { useSound } from '@/hooks/useSound';
import { formatForUI } from '@/src/lib/response-processor';

// Types
export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  avatar?: string;
  isTyping?: boolean;
  xpAwarded?: number;
  achievement?: {
    name: string;
    icon: string;
    description: string;
  };
  interactiveElements?: Array<{
    type: string;
    label: string;
    action: string;
  }>;
  emotion?: 'happy' | 'thinking' | 'celebrating' | 'encouraging';
}

export interface TutorChatProps {
  module: string;
  studentId: string;
  studentName?: string;
  sessionId: string;
  onModuleChange?: (module: string) => void;
  onSessionEnd?: () => void;
}

export default function TutorChat({
  module,
  studentId,
  studentName = 'Max',
  sessionId,
  onModuleChange,
  onSessionEnd
}: TutorChatProps) {
  // State
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [showTools, setShowTools] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [lastAchievement, setLastAchievement] = useState<any>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Custom hooks
  const { playSound } = useSound();

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setVoiceEnabled(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceEnabled(false);
      };
    }
  }, []);

  // Initialize session with welcome message
  const initializeSession = async () => {
    const welcomeMessage: TutorMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `🎉 Hey ${studentName}! Welcome to your ${module} adventure! I'm Claude, your learning buddy. Ready to explore something amazing today?`,
      timestamp: new Date(),
      avatar: '/claude-avatar.png',
      emotion: 'happy',
      xpAwarded: 10
    };
    
    setMessages([welcomeMessage]);
    setSessionXP(10);
    
    if (soundEnabled) {
      playSound('welcome');
    }
  };

  // Send message to Claude
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isPaused) return;
    
    // Add user message
    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      avatar: '/max-avatar.png'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    if (soundEnabled) {
      playSound('send');
    }
    
    try {
      // Call Claude API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: text,
          moduleContext: module,
          sessionId,
          difficulty,
          studentProfile: {
            name: studentName,
            currentStreak,
            totalXP
          }
        })
      });
      
      const data = await response.json();
      
      // Process response
      const processed = formatForUI(data);
      
      // Add Claude's response
      const claudeMessage: TutorMessage = {
        id: `claude-${Date.now()}`,
        role: 'assistant',
        content: processed.displayContent,
        timestamp: new Date(),
        avatar: '/claude-avatar.png',
        xpAwarded: data.xpAwarded,
        achievement: data.achievement,
        interactiveElements: processed.actions,
        emotion: determineEmotion(data)
      };
      
      setMessages(prev => [...prev, claudeMessage]);
      
      // Update XP
      if (data.xpAwarded) {
        animateXPGain(data.xpAwarded);
      }
      
      // Check for achievements
      if (data.achievement) {
        showAchievement(data.achievement);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: TutorMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: "Oops! My circuits got a bit tangled. Can you try that again?",
        timestamp: new Date(),
        emotion: 'thinking'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Animate XP gain
  const animateXPGain = (amount: number) => {
    setSessionXP(prev => prev + amount);
    setTotalXP(prev => prev + amount);
    
    if (soundEnabled) {
      playSound('xp-gain');
    }
  };

  // Show achievement notification
  const showAchievement = (achievement: any) => {
    setLastAchievement(achievement);
    
    if (soundEnabled) {
      playSound('achievement');
    }
    
    setTimeout(() => {
      setLastAchievement(null);
    }, 5000);
  };

  // Determine Claude's emotion based on response
  const determineEmotion = (response: any): TutorMessage['emotion'] => {
    if (response.achievement) return 'celebrating';
    if (response.encouragement) return 'encouraging';
    if (response.thinking) return 'thinking';
    return 'happy';
  };

  // Handle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (voiceEnabled) {
      recognitionRef.current.stop();
      setVoiceEnabled(false);
    } else {
      recognitionRef.current.start();
      setVoiceEnabled(true);
      
      if (soundEnabled) {
        playSound('voice-start');
      }
    }
  };

  // Handle text-to-speech
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'hint':
        sendMessage("Can you give me a hint?");
        break;
      case 'explain':
        sendMessage("Can you explain that differently?");
        break;
      case 'example':
        sendMessage("Can you show me an example?");
        break;
      case 'practice':
        sendMessage("Let's practice more!");
        break;
      case 'confused':
        sendMessage("I'm confused. Can you help?");
        break;
      case 'easier':
        setDifficulty('easy');
        sendMessage("Can you make it easier?");
        break;
      case 'harder':
        setDifficulty('hard');
        sendMessage("I want a challenge!");
        break;
    }
  };

  // Pause/resume session
  const togglePause = () => {
    setIsPaused(!isPaused);
    
    if (!isPaused) {
      const pauseMessage: TutorMessage = {
        id: `pause-${Date.now()}`,
        role: 'system',
        content: "Session paused. Take your time! I'll be here when you're ready.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, pauseMessage]);
    } else {
      const resumeMessage: TutorMessage = {
        id: `resume-${Date.now()}`,
        role: 'system',
        content: "Welcome back! Let's continue our adventure!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resumeMessage]);
    }
  };

  // End session
  const handleEndSession = () => {
    const summaryMessage: TutorMessage = {
      id: `summary-${Date.now()}`,
      role: 'assistant',
      content: `🎊 Amazing work today, ${studentName}! You earned ${sessionXP} XP and learned so much! See you next time for more adventures!`,
      timestamp: new Date(),
      emotion: 'celebrating'
    };
    
    setMessages(prev => [...prev, summaryMessage]);
    
    if (onSessionEnd) {
      setTimeout(onSessionEnd, 3000);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Achievement Notification */}
      <AnimatePresence>
        {lastAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <span className="text-3xl">{lastAchievement.icon}</span>
              <div>
                <p className="font-bold">{lastAchievement.name}</p>
                <p className="text-sm">{lastAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <ChatHeader
        module={module}
        studentName={studentName}
        currentStreak={currentStreak}
        totalXP={totalXP}
        sessionXP={sessionXP}
        isPaused={isPaused}
        onPauseToggle={togglePause}
        onEndSession={handleEndSession}
        onModuleChange={onModuleChange}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <MessageList
            messages={messages}
            isTyping={isTyping}
            onSpeakMessage={speakMessage}
            soundEnabled={soundEnabled}
          />
          
          {/* Input Area */}
          <InputArea
            input={input}
            setInput={setInput}
            onSendMessage={sendMessage}
            voiceEnabled={voiceEnabled}
            onVoiceToggle={toggleVoiceInput}
            soundEnabled={soundEnabled}
            onSoundToggle={() => setSoundEnabled(!soundEnabled)}
            disabled={isPaused}
            inputRef={inputRef}
          />
        </div>

        {/* Side Panel */}
        <motion.div
          initial={false}
          animate={{ width: showTools ? 320 : 60 }}
          className="bg-white/80 backdrop-blur-sm border-l"
        >
          {/* Toggle Button */}
          <button
            onClick={() => setShowTools(!showTools)}
            className="w-full p-4 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            {showTools ? <ChevronUp /> : <Brain />}
          </button>

          {/* Tools Panel */}
          <AnimatePresence>
            {showTools && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <InteractiveTools
                  onQuickAction={handleQuickAction}
                  difficulty={difficulty}
                  onDifficultyChange={setDifficulty}
                />
                
                <div className="mt-6">
                  <ProgressTracker
                    sessionXP={sessionXP}
                    totalXP={totalXP}
                    currentStreak={currentStreak}
                    module={module}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Hidden scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

