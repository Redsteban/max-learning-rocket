/**
 * Success Metrics Tracking System
 * Measuring Max's progress and program effectiveness
 */

export interface MetricGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: 'engagement' | 'academic' | 'confidence' | 'skills' | 'satisfaction';
  priority: 'critical' | 'important' | 'nice-to-have';
}

export interface ProgressIndicator {
  metric: string;
  baseline: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface SuccessReport {
  period: '30-day' | '90-day' | 'weekly' | 'monthly';
  goals: MetricGoal[];
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  overallProgress: number; // 0-100%
}

export class SuccessMetricsTracker {
  private goals30Day: MetricGoal[] = [];
  private goals90Day: MetricGoal[] = [];
  private dailyMetrics: Map<string, any> = new Map();
  private progressHistory: ProgressIndicator[] = [];

  constructor() {
    this.initializeGoals();
    this.setupTracking();
  }

  /**
   * Initialize 30-day and 90-day goals
   */
  private initializeGoals(): void {
    // 30-Day Goals
    this.goals30Day = [
      {
        id: 'daily-engagement',
        title: 'Consistent Daily Engagement',
        description: 'Complete learning session 5 days per week',
        target: 20, // sessions in 30 days
        current: 0,
        unit: 'sessions',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'engagement',
        priority: 'critical'
      },
      {
        id: 'homework-stress',
        title: 'Homework Stress Reduction',
        description: 'Reduce homework-related stress and frustration',
        target: 75, // % of sessions without frustration
        current: 0,
        unit: '%',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'academic',
        priority: 'critical'
      },
      {
        id: 'presentation-complete',
        title: 'First Presentation',
        description: 'Complete one presentation with Claude\'s help',
        target: 1,
        current: 0,
        unit: 'presentations',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'confidence',
        priority: 'important'
      },
      {
        id: 'enrichment-topics',
        title: 'Enrichment Exploration',
        description: 'Explore 5 different enrichment topics',
        target: 5,
        current: 0,
        unit: 'topics',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'engagement',
        priority: 'important'
      },
      {
        id: 'parent-satisfaction',
        title: 'Parent Satisfaction',
        description: 'Positive parent feedback on support quality',
        target: 90, // % satisfaction
        current: 0,
        unit: '%',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'satisfaction',
        priority: 'critical'
      }
    ];

    // 90-Day Goals
    this.goals90Day = [
      {
        id: 'grades-maintained',
        title: 'Academic Performance',
        description: 'Maintain or improve school grades',
        target: 100, // % of subjects maintained/improved
        current: 0,
        unit: '%',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'academic',
        priority: 'critical'
      },
      {
        id: 'confidence-increase',
        title: 'Confidence Growth',
        description: 'Measurable increase in learning confidence',
        target: 30, // % increase
        current: 0,
        unit: '% increase',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'confidence',
        priority: 'important'
      },
      {
        id: 'life-skills',
        title: 'Life Skills Development',
        description: 'Develop 3 core life skills',
        target: 3,
        current: 0,
        unit: 'skills',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'skills',
        priority: 'important'
      },
      {
        id: 'project-portfolio',
        title: 'Project Portfolio',
        description: 'Build portfolio of completed projects',
        target: 10,
        current: 0,
        unit: 'projects',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'academic',
        priority: 'nice-to-have'
      },
      {
        id: 'teacher-feedback',
        title: 'Teacher Recognition',
        description: 'Teacher notices improvement in class',
        target: 1,
        current: 0,
        unit: 'positive feedback',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'academic',
        priority: 'important'
      }
    ];
  }

  /**
   * Track daily session metrics
   */
  trackSession(sessionData: {
    date: Date;
    duration: number;
    homeworkCompleted: boolean;
    enrichmentCompleted: boolean;
    energyLevel: 'rocket' | 'normal' | 'tired';
    frustrationDetected: boolean;
    topicsExplored: string[];
    skillsPracticed: string[];
    parentFeedback?: number; // 1-5 rating
  }): void {
    const dateKey = sessionData.date.toISOString().split('T')[0];
    this.dailyMetrics.set(dateKey, sessionData);

    // Update relevant goals
    this.updateGoalProgress('daily-engagement', 1);
    
    if (!sessionData.frustrationDetected) {
      this.updateHomeworkStressMetric(true);
    }
    
    if (sessionData.topicsExplored.length > 0) {
      this.updateGoalProgress('enrichment-topics', sessionData.topicsExplored.length);
    }

    if (sessionData.parentFeedback && sessionData.parentFeedback >= 4) {
      this.updateParentSatisfaction(sessionData.parentFeedback);
    }

    // Save to storage
    this.saveMetrics();
  }

  /**
   * Update specific goal progress
   */
  private updateGoalProgress(goalId: string, increment: number): void {
    const goal30 = this.goals30Day.find(g => g.id === goalId);
    if (goal30) {
      goal30.current = Math.min(goal30.current + increment, goal30.target);
    }

    const goal90 = this.goals90Day.find(g => g.id === goalId);
    if (goal90) {
      goal90.current = Math.min(goal90.current + increment, goal90.target);
    }
  }

  /**
   * Update homework stress metric
   */
  private updateHomeworkStressMetric(noFrustration: boolean): void {
    const goal = this.goals30Day.find(g => g.id === 'homework-stress');
    if (goal) {
      const totalSessions = this.dailyMetrics.size;
      const noFrustrationSessions = Array.from(this.dailyMetrics.values())
        .filter(s => !s.frustrationDetected).length;
      
      goal.current = Math.round((noFrustrationSessions / totalSessions) * 100);
    }
  }

  /**
   * Update parent satisfaction
   */
  private updateParentSatisfaction(rating: number): void {
    const goal = this.goals30Day.find(g => g.id === 'parent-satisfaction');
    if (goal) {
      const ratings = Array.from(this.dailyMetrics.values())
        .filter(s => s.parentFeedback)
        .map(s => s.parentFeedback!);
      
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      goal.current = Math.round((avgRating / 5) * 100);
    }
  }

  /**
   * Track academic performance
   */
  trackAcademicPerformance(data: {
    subject: string;
    previousGrade: string;
    currentGrade: string;
    improvement: boolean;
  }): void {
    const goal = this.goals90Day.find(g => g.id === 'grades-maintained');
    if (goal && data.improvement) {
      goal.current = Math.min(goal.current + 20, 100); // 5 subjects = 20% each
    }

    // Check for teacher feedback
    if (data.improvement) {
      this.updateGoalProgress('teacher-feedback', 1);
    }
  }

  /**
   * Track confidence metrics
   */
  trackConfidence(data: {
    metric: string;
    score: number; // 1-10
    date: Date;
  }): void {
    this.progressHistory.push({
      metric: `confidence-${data.metric}`,
      baseline: 5, // Assumed baseline
      current: data.score,
      trend: data.score > 5 ? 'improving' : data.score === 5 ? 'stable' : 'declining',
      lastUpdated: data.date
    });

    // Update confidence goal
    const avgConfidence = this.progressHistory
      .filter(p => p.metric.startsWith('confidence'))
      .reduce((sum, p) => sum + p.current, 0) / 
      this.progressHistory.filter(p => p.metric.startsWith('confidence')).length;

    const goal = this.goals90Day.find(g => g.id === 'confidence-increase');
    if (goal) {
      goal.current = Math.round(((avgConfidence - 5) / 5) * 100); // % increase from baseline
    }
  }

  /**
   * Track life skills development
   */
  trackLifeSkill(skill: {
    name: string;
    proficiencyLevel: 'introduced' | 'practicing' | 'proficient';
    practiceHours: number;
  }): void {
    if (skill.proficiencyLevel === 'proficient') {
      this.updateGoalProgress('life-skills', 1);
    }
  }

  /**
   * Track project completion
   */
  trackProject(project: {
    title: string;
    type: string;
    completionDate: Date;
    quality: 'excellent' | 'good' | 'satisfactory';
  }): void {
    this.updateGoalProgress('project-portfolio', 1);
    
    // Track presentation if applicable
    if (project.type === 'presentation') {
      this.updateGoalProgress('presentation-complete', 1);
    }
  }

  /**
   * Generate success report
   */
  generateReport(period: '30-day' | '90-day' | 'weekly' | 'monthly'): SuccessReport {
    const goals = period === '30-day' ? this.goals30Day : 
                  period === '90-day' ? this.goals90Day :
                  this.goals30Day; // Default to 30-day for weekly/monthly

    const achievements = this.identifyAchievements(goals);
    const challenges = this.identifyChallenges(goals);
    const recommendations = this.generateRecommendations(goals, challenges);
    const overallProgress = this.calculateOverallProgress(goals);

    return {
      period,
      goals,
      achievements,
      challenges,
      recommendations,
      overallProgress
    };
  }

  /**
   * Identify achievements
   */
  private identifyAchievements(goals: MetricGoal[]): string[] {
    const achievements: string[] = [];

    goals.forEach(goal => {
      const progressPercent = (goal.current / goal.target) * 100;
      
      if (progressPercent >= 100) {
        achievements.push(`✅ ${goal.title} - Goal achieved!`);
      } else if (progressPercent >= 75) {
        achievements.push(`🎯 ${goal.title} - ${progressPercent.toFixed(0)}% complete`);
      } else if (progressPercent >= 50) {
        achievements.push(`📈 ${goal.title} - Halfway there!`);
      }
    });

    // Add special achievements
    const dailyStreak = this.calculateStreak();
    if (dailyStreak >= 5) {
      achievements.push(`🔥 ${dailyStreak}-day learning streak!`);
    }

    return achievements;
  }

  /**
   * Identify challenges
   */
  private identifyChallenges(goals: MetricGoal[]): string[] {
    const challenges: string[] = [];

    goals.forEach(goal => {
      const progressPercent = (goal.current / goal.target) * 100;
      const daysRemaining = Math.ceil((goal.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const expectedProgress = ((30 - daysRemaining) / 30) * 100;

      if (progressPercent < expectedProgress - 20) {
        challenges.push(`⚠️ ${goal.title} - Behind schedule (${progressPercent.toFixed(0)}% vs ${expectedProgress.toFixed(0)}% expected)`);
      }
    });

    // Check for specific issues
    const recentSessions = Array.from(this.dailyMetrics.values()).slice(-7);
    const frustrationRate = recentSessions.filter(s => s.frustrationDetected).length / recentSessions.length;
    
    if (frustrationRate > 0.3) {
      challenges.push('📊 High frustration detected in recent sessions');
    }

    const lowEnergySessions = recentSessions.filter(s => s.energyLevel === 'tired').length;
    if (lowEnergySessions > 4) {
      challenges.push('😴 Low energy levels - consider adjusting session timing');
    }

    return challenges;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(goals: MetricGoal[], challenges: string[]): string[] {
    const recommendations: string[] = [];

    // Based on challenges
    if (challenges.some(c => c.includes('frustration'))) {
      recommendations.push('💡 Try easier difficulty settings for a confidence boost');
      recommendations.push('🎮 Add more game-based learning activities');
    }

    if (challenges.some(c => c.includes('energy'))) {
      recommendations.push('⏰ Consider moving session time earlier');
      recommendations.push('🍎 Ensure healthy snack before sessions');
    }

    // Based on goal progress
    goals.forEach(goal => {
      const progressPercent = (goal.current / goal.target) * 100;
      
      if (goal.id === 'enrichment-topics' && progressPercent < 50) {
        recommendations.push('🌟 Explore more enrichment topics on Fridays');
      }
      
      if (goal.id === 'presentation-complete' && progressPercent === 0) {
        recommendations.push('🎤 Start with a 2-minute show-and-tell this week');
      }
      
      if (goal.id === 'life-skills' && progressPercent < 30) {
        recommendations.push('💪 Focus on one life skill per week');
      }
    });

    // General recommendations
    if (this.calculateStreak() < 3) {
      recommendations.push('📅 Set a daily reminder for 3:30 PM sessions');
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Calculate overall progress
   */
  private calculateOverallProgress(goals: MetricGoal[]): number {
    if (goals.length === 0) return 0;

    const criticalGoals = goals.filter(g => g.priority === 'critical');
    const importantGoals = goals.filter(g => g.priority === 'important');
    const niceToHaveGoals = goals.filter(g => g.priority === 'nice-to-have');

    // Weighted average: Critical (50%), Important (35%), Nice-to-have (15%)
    const criticalProgress = criticalGoals.reduce((sum, g) => sum + (g.current / g.target), 0) / criticalGoals.length || 0;
    const importantProgress = importantGoals.reduce((sum, g) => sum + (g.current / g.target), 0) / importantGoals.length || 0;
    const niceProgress = niceToHaveGoals.reduce((sum, g) => sum + (g.current / g.target), 0) / niceToHaveGoals.length || 0;

    return Math.round(
      (criticalProgress * 0.5 + importantProgress * 0.35 + niceProgress * 0.15) * 100
    );
  }

  /**
   * Calculate current streak
   */
  private calculateStreak(): number {
    const dates = Array.from(this.dailyMetrics.keys()).sort();
    if (dates.length === 0) return 0;

    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i - 1]);
      const dayDiff = (current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000);
      
      if (dayDiff === 1) {
        streak++;
      } else if (dayDiff > 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get quick status
   */
  getQuickStatus(): {
    streak: number;
    todayComplete: boolean;
    weeklyProgress: number;
    nextMilestone: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    const todayComplete = this.dailyMetrics.has(today);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekSessions = Array.from(this.dailyMetrics.keys())
      .filter(date => new Date(date) >= weekStart).length;

    const nextMilestone = this.getNextMilestone();

    return {
      streak: this.calculateStreak(),
      todayComplete,
      weeklyProgress: (weekSessions / 5) * 100, // 5 sessions per week goal
      nextMilestone
    };
  }

  /**
   * Get next milestone
   */
  private getNextMilestone(): string {
    const upcomingGoals = [...this.goals30Day, ...this.goals90Day]
      .filter(g => g.current < g.target)
      .sort((a, b) => (a.target - a.current) - (b.target - b.current));

    if (upcomingGoals.length > 0) {
      const goal = upcomingGoals[0];
      const remaining = goal.target - goal.current;
      return `${remaining} ${goal.unit} to ${goal.title}`;
    }

    return 'All goals on track!';
  }

  /**
   * Save metrics to storage
   */
  private saveMetrics(): void {
    if (typeof window !== 'undefined') {
      const data = {
        goals30Day: this.goals30Day,
        goals90Day: this.goals90Day,
        dailyMetrics: Array.from(this.dailyMetrics.entries()),
        progressHistory: this.progressHistory
      };
      
      localStorage.setItem('success_metrics', JSON.stringify(data));
    }
  }

  /**
   * Load metrics from storage
   */
  private setupTracking(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('success_metrics');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.goals30Day = data.goals30Day || this.goals30Day;
          this.goals90Day = data.goals90Day || this.goals90Day;
          this.dailyMetrics = new Map(data.dailyMetrics || []);
          this.progressHistory = data.progressHistory || [];
        } catch (error) {
          console.error('Failed to load success metrics:', error);
        }
      }
    }
  }
}

// Singleton instance
export const successMetrics = new SuccessMetricsTracker();