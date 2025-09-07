-- =============================================
-- MAX'S LEARNING ROCKET - SUPABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS & AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('child', 'parent', 'teacher')) DEFAULT 'child',
    date_of_birth DATE,
    grade_level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent-Child relationships
CREATE TABLE public.family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT CHECK (relationship IN ('parent', 'guardian', 'teacher')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, child_id)
);

-- =============================================
-- 2. LEARNING PROGRESS & ACHIEVEMENTS
-- =============================================

-- User progress tracking
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_time_spent_minutes INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Badges and achievements
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_value INTEGER DEFAULT 100,
    category TEXT CHECK (category IN ('math', 'science', 'reading', 'creativity', 'special', 'streak', 'milestone')),
    requirement_type TEXT,
    requirement_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User earned badges
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- =============================================
-- 3. LEARNING SESSIONS & ANALYTICS
-- =============================================

-- Learning sessions
CREATE TABLE public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    module_name TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    xp_earned INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    device_type TEXT,
    session_data JSONB
);

-- Question responses for detailed analytics
CREATE TABLE public.question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT,
    question_text TEXT,
    question_type TEXT,
    subject TEXT,
    difficulty_level INTEGER,
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    hints_used INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily learning goals
CREATE TABLE public.learning_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type TEXT CHECK (goal_type IN ('daily_xp', 'daily_minutes', 'weekly_missions', 'subject_mastery')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    subject TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_completed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. CONTENT MANAGEMENT
-- =============================================

-- Custom questions database
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    topic TEXT,
    grade_level INTEGER,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'open_ended')),
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    answer_options JSONB,
    explanation TEXT,
    hints TEXT[],
    xp_value INTEGER DEFAULT 10,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning modules/missions
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    grade_level INTEGER,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    estimated_time_minutes INTEGER,
    xp_reward INTEGER DEFAULT 100,
    question_ids UUID[],
    prerequisite_mission_id UUID REFERENCES public.missions(id),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User mission progress
CREATE TABLE public.user_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    best_score INTEGER,
    UNIQUE(user_id, mission_id)
);

-- =============================================
-- 5. MULTIPLAYER & SOCIAL
-- =============================================

-- Leaderboards
CREATE TABLE public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_date DATE,
    total_xp INTEGER DEFAULT 0,
    rank INTEGER,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_date, subject)
);

-- Challenges between users
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    mission_id UUID REFERENCES public.missions(id),
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed')) DEFAULT 'pending',
    challenger_score INTEGER,
    challenged_score INTEGER,
    winner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- =============================================
-- 6. PARENT DASHBOARD & MONITORING
-- =============================================

-- Parent settings for children
CREATE TABLE public.parent_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_time_limit_minutes INTEGER,
    allowed_subjects TEXT[],
    difficulty_override INTEGER,
    require_parent_approval_for_rewards BOOLEAN DEFAULT false,
    notification_preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, child_id)
);

-- Parent reports
CREATE TABLE public.parent_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    report_date DATE,
    total_time_minutes INTEGER,
    xp_earned INTEGER,
    subjects_studied TEXT[],
    strongest_subject TEXT,
    weakest_subject TEXT,
    accuracy_percentage DECIMAL(5,2),
    missions_completed INTEGER,
    badges_earned INTEGER,
    report_data JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. NOTIFICATIONS & MESSAGES
-- =============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('achievement', 'challenge', 'reminder', 'parent_message', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_family_connections_parent ON public.family_connections(parent_id);
CREATE INDEX idx_family_connections_child ON public.family_connections(child_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_learning_sessions_user ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_date ON public.learning_sessions(started_at);
CREATE INDEX idx_question_responses_session ON public.question_responses(session_id);
CREATE INDEX idx_question_responses_user ON public.question_responses(user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_missions_user ON public.user_missions(user_id);
CREATE INDEX idx_leaderboards_period ON public.leaderboards(period_type, period_date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parents can view child profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_connections
            WHERE parent_id = auth.uid() AND child_id = profiles.id
        )
    );

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Parents can view child progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_connections
            WHERE parent_id = auth.uid() AND child_id = user_progress.user_id
        )
    );

-- Learning sessions policies
CREATE POLICY "Users can view own sessions" ON public.learning_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Parents can view child sessions" ON public.learning_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_connections
            WHERE parent_id = auth.uid() AND child_id = learning_sessions.user_id
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 10. FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_parent_settings_updated_at
    BEFORE UPDATE ON public.parent_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate and update user level
CREATE OR REPLACE FUNCTION calculate_user_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(xp / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily leaderboard
    INSERT INTO public.leaderboards (user_id, period_type, period_date, total_xp, subject)
    VALUES (NEW.user_id, 'daily', CURRENT_DATE, NEW.xp_earned, NEW.subject)
    ON CONFLICT (user_id, period_type, period_date, subject)
    DO UPDATE SET total_xp = leaderboards.total_xp + NEW.xp_earned;
    
    -- Update weekly leaderboard
    INSERT INTO public.leaderboards (user_id, period_type, period_date, total_xp, subject)
    VALUES (NEW.user_id, 'weekly', DATE_TRUNC('week', CURRENT_DATE)::DATE, NEW.xp_earned, NEW.subject)
    ON CONFLICT (user_id, period_type, period_date, subject)
    DO UPDATE SET total_xp = leaderboards.total_xp + NEW.xp_earned;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboards after learning session
CREATE TRIGGER update_leaderboard_after_session
    AFTER INSERT ON public.learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- =============================================
-- 11. INITIAL DATA SEEDS
-- =============================================

-- Insert default badges
INSERT INTO public.badges (name, description, category, xp_value, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first mission', 'milestone', 50, 'missions_completed', 1),
('Math Wizard', 'Complete 10 math missions', 'math', 200, 'math_missions', 10),
('Science Explorer', 'Complete 10 science missions', 'science', 200, 'science_missions', 10),
('Reading Champion', 'Read for 30 minutes', 'reading', 100, 'reading_time', 30),
('Week Warrior', 'Maintain a 7-day streak', 'streak', 150, 'streak_days', 7),
('Century Club', 'Earn 100 XP in one day', 'milestone', 100, 'daily_xp', 100),
('Perfect Score', 'Get 100% on a mission', 'special', 75, 'perfect_mission', 1),
('Speed Demon', 'Complete a mission in under 5 minutes', 'special', 50, 'speed_mission', 5),
('Helper', 'Help a friend with a challenge', 'special', 100, 'help_friend', 1),
('Rising Star', 'Reach level 5', 'milestone', 250, 'level', 5),
('Superstar', 'Reach level 10', 'milestone', 500, 'level', 10),
('Legend', 'Reach level 20', 'milestone', 1000, 'level', 20);

-- =============================================
-- 12. USEFUL VIEWS
-- =============================================

-- User statistics view
CREATE VIEW public.user_statistics AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    up.total_xp,
    up.level,
    up.streak_days,
    COUNT(DISTINCT ub.badge_id) as total_badges,
    COUNT(DISTINCT um.mission_id) FILTER (WHERE um.status = 'completed') as missions_completed,
    AVG(ls.accuracy_percentage) as avg_accuracy,
    SUM(ls.duration_minutes) as total_time_minutes
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.user_badges ub ON p.id = ub.user_id
LEFT JOIN public.user_missions um ON p.id = um.user_id
LEFT JOIN public.learning_sessions ls ON p.id = ls.user_id
GROUP BY p.id, p.username, p.full_name, up.total_xp, up.level, up.streak_days;

-- Recent activity view
CREATE VIEW public.recent_activity AS
SELECT 
    ls.user_id,
    p.username,
    ls.subject,
    ls.module_name,
    ls.started_at,
    ls.duration_minutes,
    ls.xp_earned,
    ls.accuracy_percentage
FROM public.learning_sessions ls
JOIN public.profiles p ON ls.user_id = p.id
WHERE ls.started_at > NOW() - INTERVAL '7 days'
ORDER BY ls.started_at DESC;

-- =============================================
-- END OF SCHEMA
-- =============================================