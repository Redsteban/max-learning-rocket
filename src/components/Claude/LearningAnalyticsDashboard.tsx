'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Target, Brain, Trophy,
  Clock, Calendar, Zap, Star, Heart, Activity,
  ChevronRight, Download, Share, Info, Award,
  BookOpen, Globe, Lightbulb, Calculator, Flask
} from 'lucide-react';
import { claudeAnalytics } from '@/src/lib/claude-analytics';

interface LearningAnalyticsDashboardProps {
  studentId: string;
  studentName: string;
  isParentView?: boolean;
}

export default function LearningAnalyticsDashboard({
  studentId,
  studentName,
  isParentView = false
}: LearningAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'subjects' | 'progress' | 'heatmap'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [studentId, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Get all metrics
    const engagement = claudeAnalytics.getEngagementMetrics(studentId);
    const effectiveness = claudeAnalytics.getEffectivenessMetrics(studentId);
    const performance = claudeAnalytics.getPerformanceMetrics(studentId);
    const subjects = claudeAnalytics.getSubjectMetrics(studentId);
    const heatMap = claudeAnalytics.getLearningHeatMap(studentId);
    const timeline = claudeAnalytics.getProgressTimeline(studentId, 30);

    setMetrics({
      engagement,
      effectiveness,
      performance,
      subjects,
      heatMap,
      timeline
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading learning analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isParentView ? `${studentName}'s Learning Analytics` : 'My Learning Journey'}
            </h1>
            <p className="text-gray-600 mt-1">
              Powered by Claude AI Tutor
            </p>
          </div>
          
          {/* View Selector */}
          <div className="flex gap-2">
            {['overview', 'subjects', 'progress', 'heatmap'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedView === view
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mt-4">
          {['week', 'month', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {range === 'all' ? 'All Time' : `This ${range.charAt(0).toUpperCase() + range.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <OverviewView metrics={metrics} isParentView={isParentView} />
        )}
        {selectedView === 'subjects' && (
          <SubjectsView subjects={metrics.subjects} />
        )}
        {selectedView === 'progress' && (
          <ProgressView timeline={metrics.timeline} effectiveness={metrics.effectiveness} />
        )}
        {selectedView === 'heatmap' && (
          <HeatMapView heatMap={metrics.heatMap} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Overview Component
function OverviewView({ metrics, isParentView }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Brain}
          title="Interaction Quality"
          value={`${Math.round(metrics.engagement.interactionQuality)}%`}
          subtitle="Claude helpfulness"
          color="from-blue-400 to-cyan-400"
        />
        <MetricCard
          icon={Target}
          title="Success Rate"
          value={`${Math.round(metrics.effectiveness.correctAnswerRate * 100)}%`}
          subtitle="Correct answers"
          color="from-green-400 to-emerald-400"
        />
        <MetricCard
          icon={Clock}
          title="Avg Session"
          value={`${Math.round(metrics.engagement.sessionDurationAverage)} min`}
          subtitle="Focus time"
          color="from-purple-400 to-pink-400"
        />
        <MetricCard
          icon={Trophy}
          title="Claude Score"
          value={`${Math.round(metrics.performance.claudeQualityScore)}/100`}
          subtitle="Teaching quality"
          color="from-orange-400 to-red-400"
        />
      </div>

      {/* Learning Patterns */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Learning Patterns
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peak Learning Hours */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Peak Learning Hours</h3>
            <div className="flex gap-2">
              {metrics.engagement.peakLearningHours.map((hour: number) => (
                <div
                  key={hour}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-lg"
                >
                  <p className="text-lg font-bold text-blue-700">
                    {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Topics */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Most Explored Topics</h3>
            <div className="space-y-2">
              {Array.from(metrics.engagement.topicsExplored.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{topic}</span>
                    <span className="text-sm text-gray-500">{count} times</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Strengths
          </h3>
          <div className="space-y-2">
            {metrics.effectiveness.strongAreas.map((area: string) => (
              <div key={area} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-green-600" />
                <span className="text-green-700 capitalize">{area}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Areas to Improve
          </h3>
          <div className="space-y-2">
            {metrics.effectiveness.strugglingAreas.map((area: string) => (
              <div key={area} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700 capitalize">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claude Performance Metrics */}
      {isParentView && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Claude's Teaching Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <PerformanceMetric
              label="Response Helpfulness"
              value={metrics.performance.responseHelpfulness}
            />
            <PerformanceMetric
              label="Explanation Success"
              value={metrics.performance.explanationSuccessRate}
            />
            <PerformanceMetric
              label="Activity Completion"
              value={metrics.performance.activityCompletionRate}
            />
            <PerformanceMetric
              label="Encouragement Effect"
              value={metrics.performance.encouragementEffectiveness}
            />
            <PerformanceMetric
              label="Adaptation Accuracy"
              value={metrics.performance.adaptationAccuracy}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Subjects View Component
function SubjectsView({ subjects }: any) {
  const subjectIcons = {
    math: Calculator,
    science: Flask,
    writing: BookOpen,
    world: Globe,
    entrepreneur: Lightbulb
  };

  const subjectColors = {
    math: 'from-purple-400 to-pink-400',
    science: 'from-blue-400 to-cyan-400',
    writing: 'from-green-400 to-emerald-400',
    world: 'from-orange-400 to-yellow-400',
    entrepreneur: 'from-red-400 to-rose-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Object.entries(subjects).map(([subject, data]: [string, any]) => {
        const Icon = subjectIcons[subject as keyof typeof subjectIcons];
        const color = subjectColors[subject as keyof typeof subjectColors];

        return (
          <motion.div
            key={subject}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold capitalize">{subject}</h3>
                <Icon className="w-8 h-8" />
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {subject === 'math' && (
                <>
                  <Stat label="Problems Solved" value={data.problemsSolved} />
                  <Stat label="Concepts Mastered" value={data.conceptsMastered?.length || 0} />
                  <Stat label="Current Level" value={data.difficultyLevel || 'Medium'} />
                </>
              )}
              
              {subject === 'science' && (
                <>
                  <Stat label="Experiments" value={data.experimentsCompleted} />
                  <Stat label="Hypotheses Formed" value={data.hypothesesFormed} />
                  <Stat label="Questions Asked" value={data.questionsAsked} />
                </>
              )}
              
              {subject === 'writing' && (
                <>
                  <Stat label="Words Written" value={data.wordsWritten} />
                  <Stat label="Stories Completed" value={data.storiesCompleted} />
                  <Stat label="Creativity Score" value={`${data.creativityScore}/100`} />
                </>
              )}
              
              {subject === 'world' && (
                <>
                  <Stat label="Countries Explored" value={data.countriesExplored} />
                  <Stat label="Facts Learned" value={data.factsLearned} />
                  <Stat label="Map Skills" value={`${data.mapSkillsProgress}%`} />
                </>
              )}
              
              {subject === 'entrepreneur' && (
                <>
                  <Stat label="Ideas Generated" value={data.ideasGenerated} />
                  <Stat label="Business Plans" value={data.businessPlansCreated} />
                  <Stat label="Problems Solved" value={data.problemsSolved} />
                </>
              )}

              {/* Favorite Topics */}
              {data.favoriteTopics && data.favoriteTopics.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Favorite Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.favoriteTopics.map((topic: string) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Progress View Component
function ProgressView({ timeline, effectiveness }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Progress Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">30-Day Progress</h2>
        
        <div className="h-64 flex items-end gap-1">
          {timeline.map((point: any, index: number) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(point.xpEarned / 200) * 100}%` }}
              transition={{ delay: index * 0.02 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t hover:opacity-80 relative group"
            >
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {point.xpEarned} XP
                <br />
                {new Date(point.date).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Improvement Trajectory */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Improvement Trajectory</h3>
        <div className="flex items-center gap-4">
          <TrendingUp className="w-12 h-12 text-green-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {effectiveness.improvementTrajectory > 0 ? '+' : ''}{effectiveness.improvementTrajectory}%
            </p>
            <p className="text-gray-600">Weekly improvement rate</p>
          </div>
        </div>
      </div>

      {/* Concept Mastery */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Concept Mastery</h3>
        <div className="space-y-3">
          {Array.from(effectiveness.conceptMasterySpeed.entries()).slice(0, 5).map(([concept, hours]) => (
            <div key={concept} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{concept}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{hours.toFixed(1)} hours to master</span>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Heat Map View Component
function HeatMapView({ heatMap }: any) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Learning Heat Map</h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-2">
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-xs text-gray-500 text-center">
                {hour}
              </div>
            ))}
          </div>

          {/* Heat map grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-sm text-gray-600">{day}</div>
              <div className="flex flex-1 gap-1">
                {hours.map(hour => {
                  const intensity = heatMap.data[dayIndex][hour];
                  const opacity = intensity / 100;
                  
                  return (
                    <div
                      key={hour}
                      className="flex-1 h-8 rounded"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                      }}
                      title={`${day} ${hour}:00 - ${intensity}% effectiveness`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Peak Learning:</strong> {heatMap.peakDay} at {heatMap.peakHour}:00
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {heatMap.recommendation}
        </p>
      </div>
    </motion.div>
  );
}

// Helper Components
function MetricCard({ icon: Icon, title, value, subtitle, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${color} p-1`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </motion.div>
  );
}

function PerformanceMetric({ label, value }: any) {
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(value / 100) * 226} 226`}
          />
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(value)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-bold text-gray-800">{value}</span>
    </div>
  );
}