-- Family Goals System
-- Comprehensive goal tracking for all family members

-- Goal categories enum
CREATE TYPE goal_category AS ENUM (
  'school',
  'chores',
  'spiritual',
  'health',
  'money',
  'fun',
  'relationship',
  'learning',
  'habit',
  'other'
);

-- Goal types enum
CREATE TYPE goal_type AS ENUM (
  'habit',      -- Do X times per week/month
  'one_time',   -- Complete by specific date
  'learning',   -- Practice skill, read N books, etc.
  'streak'      -- Maintain consecutive days
);

-- Goal status enum
CREATE TYPE goal_status AS ENUM (
  'active',
  'completed',
  'paused',
  'archived'
);

-- Family member type (who the goal belongs to)
CREATE TYPE family_member_type AS ENUM (
  'self',       -- The logged-in parent
  'spouse',     -- Partner
  'child',      -- Linked to child_profiles
  'family'      -- Shared family goal
);

-- Main goals table
CREATE TABLE IF NOT EXISTS family_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Who this goal is for
  member_type family_member_type NOT NULL DEFAULT 'self',
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE, -- Only if member_type = 'child'

  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  category goal_category NOT NULL DEFAULT 'other',
  goal_type goal_type NOT NULL DEFAULT 'habit',
  icon TEXT DEFAULT '🎯', -- Emoji icon for visual display
  color TEXT DEFAULT '#8B7CF6', -- Hex color for the goal card

  -- Target configuration
  target_count INTEGER DEFAULT 1, -- How many times to complete (for habits)
  target_frequency TEXT DEFAULT 'week', -- 'day', 'week', 'month'
  target_date DATE, -- Due date for one-time goals

  -- Progress tracking
  current_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,

  -- Status
  status goal_status NOT NULL DEFAULT 'active',

  -- Motivation
  why_it_matters TEXT, -- Why this goal is important
  reward TEXT, -- Optional reward for completion
  notes TEXT,

  -- Linked people (for shared goals)
  linked_member_ids TEXT[], -- Array of 'self', 'spouse', or child UUIDs

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Ensure child_id is only set for child goals
  CONSTRAINT valid_child_goal CHECK (
    (member_type = 'child' AND child_id IS NOT NULL) OR
    (member_type != 'child' AND child_id IS NULL)
  )
);

-- Goal tasks/actions table (recurring tasks tied to goals)
CREATE TABLE IF NOT EXISTS goal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekdays', 'weekly', 'monthly', or cron-like
  scheduled_date DATE, -- For one-time tasks
  scheduled_time TIME, -- Optional time of day

  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id), -- Who completed (for kid tasks with parent approval)

  -- For kid tasks
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal completions/check-ins (daily progress entries)
CREATE TABLE IF NOT EXISTS goal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Completion details
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1, -- How many times completed that day

  -- Optional notes/reflection
  notes TEXT,

  -- For celebrations
  milestone_reached TEXT, -- '7_day_streak', '30_completions', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly reflections table
CREATE TABLE IF NOT EXISTS goal_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reflection period
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Reflection content
  what_went_well TEXT,
  what_was_hard TEXT,
  next_week_focus TEXT,

  -- Quick ratings (1-5)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One reflection per week per user
  UNIQUE(user_id, week_start)
);

-- Goal milestones/celebrations
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type TEXT NOT NULL, -- 'streak_7', 'streak_30', 'completed', 'halfway', etc.
  milestone_value INTEGER, -- The value achieved (e.g., 7 for 7-day streak)

  -- Celebration
  celebrated BOOLEAN DEFAULT FALSE,
  celebration_type TEXT, -- 'photo', 'memory', 'reward', etc.
  celebration_note TEXT,
  photo_url TEXT,

  -- Timestamps
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  celebrated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_family_goals_user_id ON family_goals(user_id);
CREATE INDEX idx_family_goals_member_type ON family_goals(member_type);
CREATE INDEX idx_family_goals_child_id ON family_goals(child_id);
CREATE INDEX idx_family_goals_status ON family_goals(status);
CREATE INDEX idx_family_goals_category ON family_goals(category);

CREATE INDEX idx_goal_tasks_goal_id ON goal_tasks(goal_id);
CREATE INDEX idx_goal_tasks_user_id ON goal_tasks(user_id);
CREATE INDEX idx_goal_tasks_scheduled_date ON goal_tasks(scheduled_date);

CREATE INDEX idx_goal_completions_goal_id ON goal_completions(goal_id);
CREATE INDEX idx_goal_completions_user_id ON goal_completions(user_id);
CREATE INDEX idx_goal_completions_date ON goal_completions(completion_date);

CREATE INDEX idx_goal_reflections_user_id ON goal_reflections(user_id);
CREATE INDEX idx_goal_reflections_week ON goal_reflections(week_start);

-- Row Level Security
ALTER TABLE family_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own goals"
  ON family_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON family_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON family_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON family_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Goal tasks policies
CREATE POLICY "Users can view own goal tasks"
  ON goal_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal tasks"
  ON goal_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal tasks"
  ON goal_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal tasks"
  ON goal_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Goal completions policies
CREATE POLICY "Users can view own goal completions"
  ON goal_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal completions"
  ON goal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal completions"
  ON goal_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal completions"
  ON goal_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Goal reflections policies
CREATE POLICY "Users can view own reflections"
  ON goal_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON goal_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON goal_reflections FOR UPDATE
  USING (auth.uid() = user_id);

-- Goal milestones policies
CREATE POLICY "Users can view own milestones"
  ON goal_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON goal_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON goal_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's current count
  UPDATE family_goals
  SET
    current_count = (
      SELECT COALESCE(SUM(count), 0)
      FROM goal_completions
      WHERE goal_id = NEW.goal_id
    ),
    updated_at = NOW()
  WHERE id = NEW.goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update goal progress on completion
CREATE TRIGGER on_goal_completion_insert
  AFTER INSERT ON goal_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();

-- Function to calculate streak for a goal
CREATE OR REPLACE FUNCTION calculate_goal_streak(p_goal_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  completion_exists BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM goal_completions
      WHERE goal_id = p_goal_id
      AND completion_date = check_date
    ) INTO completion_exists;

    IF completion_exists THEN
      streak := streak + 1;
      check_date := check_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_goals_updated_at
  BEFORE UPDATE ON family_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_tasks_updated_at
  BEFORE UPDATE ON goal_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_reflections_updated_at
  BEFORE UPDATE ON goal_reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
