'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Zap, Trophy, Clock, HelpCircle, 
  Play, CheckCircle, Award, Target, Lightbulb, Gamepad2 
} from 'lucide-react';
import { Activity } from '@/src/lib/claude-activities';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'activity';
  content: string;
  timestamp: Date;
  activity?: Activity;
  activityStep?: number;
}

interface ActivityChatInterfaceProps {
  module: string;
  studentId: string;
  token: string;
}

export default function ActivityChatInterface({ 
  module, 
  studentId, 
  token 
}: ActivityChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityStep, setActivityStep] = useState(0);
  const [showActivityCommands, setShowActivityCommands] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start session on mount
  useEffect(() => {
    startSession();
  }, [module]);

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
        
        // Add greeting with activity suggestions
        setMessages([{
          id: '1',
          role: 'assistant',
          content: data.greeting + '\n\n💡 **Try these commands:**\n• `!challenge` - Quick 5-minute challenge\n• `!project` - Creative project (20-30 min)\n• `!explore` - Deep exploration\n• `!quiz` - Test your knowledge\n• `!game` - Educational game',
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          moduleContext: module,
          sessionId,
          currentActivity,
        }),
      });

      const data = await response.json();

      // Handle activity response
      if (data.activity) {
        setCurrentActivity(data.activity);
        setActivityStep(0);
        
        // Add activity card message
        const activityMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'activity',
          content: data.message,
          timestamp: new Date(),
          activity: data.activity,
          activityStep: 0,
        };
        
        setMessages(prev => [...prev, activityMessage]);
      } else if (currentActivity && !data.activityCompleted) {
        // Handle activity step progression
        setActivityStep(prev => prev + 1);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          activityStep: activityStep + 1,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Check if activity completed
        if (activityStep >= currentActivity.instructions.length - 1) {
          setCurrentActivity(null);
          setActivityStep(0);
          
          // Add completion celebration
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'system',
              content: `🎊 ACTIVITY COMPLETE! You earned ${currentActivity.xpReward} XP! Amazing work!`,
              timestamp: new Date(),
            }]);
          }, 1000);
        }
      } else {
        // Normal chat response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Update XP
      if (data.xpAwarded) {
        setTotalXP(prev => prev + data.xpAwarded);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "🤔 Oops! My circuits got tangled. Can you try that again?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendActivityCommand = (command: string) => {
    setInput(command);
    setShowActivityCommands(false);
    // Auto-send after a brief delay
    setTimeout(() => {
      const button = document.querySelector('[data-send-button]') as HTMLButtonElement;
      button?.click();
    }, 100);
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
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden">
      {/* Header with XP and Activity Status */}
      <div className={`bg-gradient-to-r ${getModuleColor()} p-4 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold capitalize">
              {module} Adventure
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {currentActivity && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Target className="w-4 h-4" />
                <span className="text-sm">
                  Step {activityStep + 1}/{currentActivity.instructions.length}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Current Activity Bar */}
        {currentActivity && (
          <div className="mt-3 bg-white/20 rounded-lg p-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{currentActivity.title}</span>
              <span>{currentActivity.estimatedTime} min</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <motion.div
                className="bg-white rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((activityStep + 1) / currentActivity.instructions.length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activity Commands Toggle */}
      <AnimatePresence>
        {showActivityCommands && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-b"
          >
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <button
                onClick={() => sendActivityCommand('!challenge')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Challenge</span>
              </button>
              <button
                onClick={() => sendActivityCommand('!project')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Project</span>
              </button>
              <button
                onClick={() => sendActivityCommand('!explore')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Explore</span>
              </button>
              <button
                onClick={() => sendActivityCommand('!quiz')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <HelpCircle className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Quiz</span>
              </button>
              <button
                onClick={() => sendActivityCommand('!game')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Gamepad2 className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Game</span>
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
              transition={{ delay: index * 0.05 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'activity' ? (
                // Special activity card design
                <div className="max-w-[90%] lg:max-w-[80%] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Activity Started!</h3>
                      <p className="text-sm opacity-90">
                        {message.activity?.estimatedTime} minutes • 
                        {message.activity?.xpReward} XP
                      </p>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.activity?.materialsNeeded && (
                    <div className="mt-3 bg-white/20 rounded-lg p-2">
                      <p className="text-sm">
                        📦 Materials: {message.activity.materialsNeeded.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Regular message bubble
                <div
                  className={`max-w-[80%] lg:max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : message.role === 'system'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  {/* Activity step indicator */}
                  {message.activityStep !== undefined && currentActivity && (
                    <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                      <CheckCircle className="w-4 h-4" />
                      Step {message.activityStep + 1} of {currentActivity.instructions.length}
                    </div>
                  )}
                  
                  <p className="whitespace-pre-wrap text-base lg:text-lg">
                    {message.content}
                  </p>
                  
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              )}
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
                <span className="text-gray-500 text-sm">
                  {currentActivity ? 'Checking your work...' : 'Claude is thinking...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowActivityCommands(!showActivityCommands)}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              currentActivity 
                ? `Answer for step ${activityStep + 1}...` 
                : "Ask me anything or type ! for activities! 🚀"
            }
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          
          <motion.button
            data-send-button
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

        {/* Activity hints */}
        {currentActivity && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <HelpCircle className="w-4 h-4" />
            <span>Need help? Type "hint" or "help" for guidance!</span>
          </div>
        )}
      </div>
    </div>
  );
}