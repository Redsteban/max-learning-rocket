'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Share, Mail, Calendar,
  TrendingUp, Trophy, Target, AlertCircle, 
  CheckCircle, Star, Brain, Clock, Zap,
  ChevronRight, Printer, Heart, Sparkles
} from 'lucide-react';
import { claudeAnalytics } from '@/src/lib/claude-analytics';

interface ParentReportProps {
  studentId: string;
  studentName: string;
  parentEmail?: string;
}

export default function ParentReport({
  studentId,
  studentName,
  parentEmail
}: ParentReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    generateReport();
  }, [studentId]);

  const generateReport = async () => {
    setLoading(true);
    const weeklyReport = claudeAnalytics.generateWeeklyReport(studentId);
    setReport(weeklyReport);
    setLoading(false);
  };

  const sendReportEmail = async () => {
    if (!parentEmail) return;
    
    setSending(true);
    // API call to send email would go here
    setTimeout(() => {
      setSending(false);
      alert('Report sent successfully!');
    }, 2000);
  };

  const downloadPDF = () => {
    // Generate and download PDF
    console.log('Downloading PDF report...');
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Generating weekly report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Weekly Learning Report</h1>
            <p className="text-purple-100">
              {studentName}'s Progress with Claude AI Tutor
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Week of</p>
            <p className="text-lg font-medium">
              {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={sendReportEmail}
            disabled={!parentEmail || sending}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            {sending ? 'Sending...' : 'Email Report'}
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Clock}
          label="Learning Time"
          value={`${report.summary.totalTime} min`}
          color="blue"
        />
        <SummaryCard
          icon={Zap}
          label="XP Earned"
          value={report.summary.totalXP}
          color="purple"
        />
        <SummaryCard
          icon={Target}
          label="Activities"
          value={report.summary.totalActivities}
          color="green"
        />
        <SummaryCard
          icon={Brain}
          label="Sessions"
          value={report.summary.totalSessions}
          color="orange"
        />
      </div>

      {/* Key Achievement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-full">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              🎉 Key Achievement This Week
            </h2>
            <p className="text-lg text-gray-700">{report.keyAchievement}</p>
          </div>
        </div>
      </motion.div>

      {/* Subject Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Learning Highlights
        </h2>

        <div className="space-y-4">
          {/* Math */}
          <HighlightRow
            icon="🔢"
            subject="Mathematics"
            detail={`${report.highlights.mathProblems.count} problems solved`}
            extra={`${Math.round(report.highlights.mathProblems.successRate * 100)}% success rate`}
            color="purple"
          />

          {/* Science */}
          <HighlightRow
            icon="🔬"
            subject="Science"
            detail={`${report.highlights.scienceExperiments} experiments completed`}
            color="blue"
          />

          {/* Writing */}
          <HighlightRow
            icon="✏️"
            subject="Creative Writing"
            detail={`${report.highlights.storiesWritten.count} stories written`}
            extra={`${report.highlights.storiesWritten.totalWords} words total`}
            color="green"
          />

          {/* World */}
          <HighlightRow
            icon="🌍"
            subject="World Geography"
            detail={`${report.highlights.countriesExplored} countries explored`}
            color="orange"
          />

          {/* Business */}
          <HighlightRow
            icon="💡"
            subject="Young Entrepreneur"
            detail={`${report.highlights.businessIdeas} business ideas generated`}
            color="red"
          />
        </div>
      </motion.div>

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Strengths Demonstrated
          </h3>
          <div className="space-y-2">
            {report.strengthAreas.map((strength: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 capitalize">{strength}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Areas to Improve */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Areas for Growth
          </h3>
          <div className="space-y-2">
            {report.improvementAreas.map((area: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 capitalize">{area}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Challenge Area */}
      {report.challengeArea && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-orange-800 mb-2">
                Current Challenge Area
              </h3>
              <p className="text-orange-700">{report.challengeArea}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Claude's Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-full">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Claude's Recommendation
            </h3>
            <p className="text-gray-700 mb-3">{report.claudeRecommendation}</p>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800 mb-1">
                Next Week Focus:
              </p>
              <p className="text-purple-700">{report.nextWeekFocus}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Parent Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-50 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Tips for Parents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TipCard
            title="Celebrate Progress"
            description={`Praise ${studentName} for ${report.keyAchievement.toLowerCase()}`}
          />
          <TipCard
            title="Support Challenge Areas"
            description={`Help with ${report.challengeArea?.toLowerCase() || 'current challenges'} through practice`}
          />
          <TipCard
            title="Optimal Learning Time"
            description="Best focus shown during afternoon sessions"
          />
          <TipCard
            title="Encourage Questions"
            description="Questions show engagement and curiosity"
          />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-600 text-sm"
      >
        <p>This report was generated by Claude AI Learning Analytics</p>
        <p className="mt-1">
          Questions? Contact us at support@maxlearning.com
        </p>
      </motion.div>
    </div>
  );
}

// Helper Components
function SummaryCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className={`h-1 bg-gradient-to-r ${colors[color]}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </motion.div>
  );
}

function HighlightRow({ icon, subject, detail, extra, color }: any) {
  const colors = {
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{subject}</p>
        <p className="text-sm text-gray-600">{detail}</p>
      </div>
      {extra && (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
          {extra}
        </span>
      )}
    </div>
  );
}

function TipCard({ title, description }: any) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}