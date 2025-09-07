'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Brain, Zap, Coffee, Trophy } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  energyLevel?: 'high' | 'medium' | 'low';
  encouragementType?: string;
}

interface EnhancedChatInterfaceProps {
  module: string;
  studentId: string;
  token: string;
}

export default function EnhancedChatInterface({ 
  module, 
  studentId, 
  token 
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    energyLevel: 'high' as 'high' | 'medium' | 'low',
    performanceLevel: 'progressing',
    messageCount: 0,
    missionProgress: 0,
  });
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Start session on mount
  useEffect(() => {
    startSession();
  }, [module]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'start', module }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
        
        // Add greeting as first message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: data.greeting,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'continue',
          sessionId,
          message: input,
        }),
      });

      const data = await response.json();

      // Update session stats
      if (data.energyLevel) {
        setSessionStats(prev => ({
          ...prev,
          energyLevel: data.energyLevel,
          messageCount: prev.messageCount + 1,
        }));
      }

      // Check for break suggestion
      if (data.encouragementType === 'break-suggestion') {
        setShowBreakSuggestion(true);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        energyLevel: data.energyLevel,
        encouragementType: data.encouragementType,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add suggested next step if available
      if (data.suggestedNextStep) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'system',
            content: `💡 Try this: ${data.suggestedNextStep}`,
            timestamp: new Date(),
          }]);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "🤔 Oops! My thinking cap slipped off. Can you try asking that again?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnergyIcon = () => {
    switch (sessionStats.energyLevel) {
      case 'high': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'medium': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'low': return <Coffee className="w-5 h-5 text-gray-500" />;
    }
  };

  const getModuleColor = () => {
    const colors: Record<string, string> = {
      science: 'from-blue-400 to-cyan-400',
      math: 'from-purple-400 to-pink-400',
      stories: 'from-green-400 to-emerald-400',
      world: 'from-orange-400 to-yellow-400',
      entrepreneur: 'from-red-400 to-rose-400',
    };
    return colors[module] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden">
      {/* Session Header */}
      <div className={`bg-gradient-to-r ${getModuleColor()} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold capitalize">
              {module} Learning Session
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getEnergyIcon()}
              <span className="text-sm">Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm">{sessionStats.messageCount} messages</span>
            </div>
          </div>
        </div>

        {/* Mission Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Today's Mission Progress</span>
            <span>{sessionStats.missionProgress}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${sessionStats.missionProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Break Suggestion Banner */}
      <AnimatePresence>
        {showBreakSuggestion && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-100 border-b border-yellow-300 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-yellow-800 flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Time for a quick break! Your brain needs to recharge! 🧠⚡
              </p>
              <button
                onClick={() => setShowBreakSuggestion(false)}
                className="text-yellow-600 hover:text-yellow-800 font-bold"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] lg:max-w-[70%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : message.role === 'system'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                {/* Message Content */}
                <p className="whitespace-pre-wrap text-base lg:text-lg">
                  {message.content}
                </p>

                {/* Timestamp */}
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>

                {/* Energy indicator for assistant messages */}
                {message.role === 'assistant' && message.energyLevel && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Detected energy: {message.energyLevel}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-pink-500 rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  />
                </div>
                <span className="text-gray-500 text-sm">Claude is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything! What would you like to learn? 🚀"
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
              isLoading || !input.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick prompts */}
        <div className="mt-3 flex flex-wrap gap-2">
          {getQuickPrompts(module).map((prompt, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInput(prompt)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module-specific quick prompts
function getQuickPrompts(module: string): string[] {
  const prompts: Record<string, string[]> = {
    science: [
      "How do volcanoes work?",
      "Why is the sky blue?",
      "Tell me about ocean animals",
      "Let's do an experiment!"
    ],
    math: [
      "Help me with multiplication",
      "What's a fraction?",
      "Show me a math puzzle",
      "Practice word problems"
    ],
    stories: [
      "Help me write a story",
      "Create a character with me",
      "What makes a good story?",
      "Practice presenting"
    ],
    world: [
      "Tell me about Canada",
      "Explore different cultures",
      "Geography quiz please!",
      "Famous landmarks"
    ],
    entrepreneur: [
      "Business idea help",
      "How to solve problems",
      "Leadership skills",
      "Invention ideas"
    ],
  };

  return prompts[module] || prompts.science;
}