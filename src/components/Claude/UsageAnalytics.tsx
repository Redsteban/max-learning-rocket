'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Zap,
  PieChart, BarChart3, Activity, AlertCircle,
  Calendar, Clock, Target, Sparkles,
  ChevronRight, Info, Settings, Download, Trophy
} from 'lucide-react';
import { costManager } from '@/src/lib/claude-cost-manager';
import { responseCache } from '@/src/lib/response-cache';

interface UsageAnalyticsProps {
  studentId: string;
  isParentView?: boolean;
}

export default function UsageAnalytics({ 
  studentId, 
  isParentView = false 
}: UsageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [showDetails, setShowDetails] = useState(false);
  const [costAlert, setCostAlert] = useState(false);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    const usage = costManager.getUsageAnalytics();
    const cache = responseCache.getStats();
    
    setAnalytics(usage);
    setCacheStats(cache);
    
    // Check for cost alerts
    if (usage.today.cost > 2.00) {
      setCostAlert(true);
    }
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens > 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens > 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isParentView ? 'Usage & Cost Analytics' : 'Learning Analytics'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isParentView 
              ? 'Monitor Claude AI usage and costs'
              : 'Track your learning progress'}
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Alert */}
      {costAlert && isParentView && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div className="flex-1">
            <p className="font-medium text-orange-800">Daily Cost Alert</p>
            <p className="text-sm text-orange-700">
              Today's usage ({formatCost(analytics.today.cost)}) exceeds the daily budget
            </p>
          </div>
          <button className="text-orange-600 hover:text-orange-800">
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Today's Usage */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {formatTokens(analytics.today.tokens)}
          </p>
          <p className="text-sm text-blue-600">Tokens Used</p>
          {!isParentView && (
            <div className="mt-2 text-xs text-blue-500">
              {analytics.today.sessions} learning sessions
            </div>
          )}
        </motion.div>

        {/* Cost (Parent View Only) */}
        {isParentView && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600">Cost</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              {formatCost(analytics[selectedPeriod].cost)}
            </p>
            <p className="text-sm text-green-600">
              {selectedPeriod === 'month' ? 'This Month' : selectedPeriod === 'week' ? 'This Week' : 'Today'}
            </p>
            {selectedPeriod === 'month' && (
              <div className="mt-2 text-xs text-green-500">
                Projected: {formatCost(analytics.month.projection)}
              </div>
            )}
          </motion.div>
        )}

        {/* Cache Performance */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600">Cache</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">
            {(cacheStats?.hitRate * 100 || 0).toFixed(0)}%
          </p>
          <p className="text-sm text-purple-600">Hit Rate</p>
          {isParentView && (
            <div className="mt-2 text-xs text-purple-500">
              Saved: {formatCost(cacheStats?.costSaved || 0)}
            </div>
          )}
        </motion.div>

        {/* Learning Progress (Student View) or Efficiency (Parent View) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            {isParentView ? (
              <TrendingUp className="w-5 h-5 text-orange-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-orange-600" />
            )}
            <span className="text-xs text-orange-600">
              {isParentView ? 'Efficiency' : 'Progress'}
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-800">
            {isParentView 
              ? `${((cacheStats?.tokensSaved || 0) / 1000).toFixed(1)}K`
              : `${analytics.today.sessions * 50} XP`}
          </p>
          <p className="text-sm text-orange-600">
            {isParentView ? 'Tokens Saved' : 'Earned Today'}
          </p>
        </motion.div>
      </div>

      {/* Module Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-600" />
          Usage by Module
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(analytics.byModule || {}).map(([module, data]: [string, any]) => (
            <motion.div
              key={module}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-lg p-3 cursor-pointer"
              onClick={() => setShowDetails(true)}
            >
              <p className="text-sm font-medium text-gray-700 capitalize">{module}</p>
              <p className="text-lg font-bold text-gray-800">
                {formatTokens(data.tokens)}
              </p>
              {isParentView && (
                <p className="text-xs text-gray-500">{formatCost(data.cost)}</p>
              )}
              {!isParentView && (
                <p className="text-xs text-gray-500">{data.sessions} sessions</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usage Trend Chart (Simplified) */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-600" />
          Usage Trend
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {[...Array(7)].map((_, i) => {
              const height = Math.random() * 100; // Would use real data
              const day = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                  />
                  <span className="text-xs text-gray-600 mt-1">
                    {day.toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optimization Tips (Parent View) */}
      {isParentView && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Cost Optimization Tips
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Cache hit rate is {(cacheStats?.hitRate * 100 || 0).toFixed(0)}% - 
                {cacheStats?.hitRate > 0.3 
                  ? ' Great job! This saves money.' 
                  : ' Could be improved with more consistent topics.'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Peak usage is in {analytics.today.sessions > 3 ? 'afternoons' : 'mornings'}.
                Consider scheduling batch content generation.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Enable economy mode during review sessions to reduce costs by ~60%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {isParentView && (
          <>
            <button className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              Adjust Limits
            </button>
            <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </>
        )}
        {!isParentView && (
          <button className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            View Achievements
          </button>
        )}
      </div>

      {/* Detailed View Modal (would be implemented) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Detailed Analytics</h3>
            <p className="text-gray-600">Detailed breakdown would appear here...</p>
            <button
              onClick={() => setShowDetails(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}