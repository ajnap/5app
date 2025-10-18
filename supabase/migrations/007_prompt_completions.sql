-- Create prompt_completions table to track when users complete activities
-- This enables streak tracking, progress visualization, and habit formation

CREATE TABLE IF NOT EXISTS prompt_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL, -- Optional: track which child this was done with
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Optional: let parents add a quick note about how it went
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a date column for easier querying and indexing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompt_completions' AND column_name = 'completion_date'
  ) THEN
    ALTER TABLE prompt_completions
    ADD COLUMN completion_date DATE GENERATED ALWAYS AS ((completed_at AT TIME ZONE 'UTC')::date) STORED;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE prompt_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own completions" ON prompt_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON prompt_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON prompt_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON prompt_completions;

-- RLS Policies: Users can only see and manage their own completions
CREATE POLICY "Users can view own completions"
  ON prompt_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON prompt_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON prompt_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON prompt_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_completions_user_id ON prompt_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_completed_at ON prompt_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON prompt_completions(user_id, completion_date);

-- Prevent duplicate completions on the same day for the same prompt
CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_unique_user_prompt_date
  ON prompt_completions(user_id, prompt_id, completion_date);

-- Function to get user's current streak
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE;
  has_completion BOOLEAN;
BEGIN
  -- Start from today and count backwards
  check_date := CURRENT_DATE;

  LOOP
    -- Check if user has any completion on this date
    SELECT EXISTS (
      SELECT 1 FROM prompt_completions
      WHERE user_id = p_user_id
      AND completion_date = check_date
    ) INTO has_completion;

    -- If no completion found, stop counting
    IF NOT has_completion THEN
      EXIT;
    END IF;

    -- Increment streak and check previous day
    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get total completions count
CREATE OR REPLACE FUNCTION get_total_completions(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT completion_date)
    FROM prompt_completions
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get completions this month
CREATE OR REPLACE FUNCTION get_month_completions(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT completion_date)
    FROM prompt_completions
    WHERE user_id = p_user_id
    AND completion_date >= DATE_TRUNC('month', CURRENT_DATE)::date
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user completed any prompt today
CREATE OR REPLACE FUNCTION completed_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM prompt_completions
    WHERE user_id = p_user_id
    AND completion_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments for documentation
COMMENT ON TABLE prompt_completions IS 'Tracks when users complete activities - enables streaks, progress tracking, and habit formation';

-- Only add column comments if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_completions' AND column_name = 'child_id') THEN
    COMMENT ON COLUMN prompt_completions.child_id IS 'Optional: track which child this activity was done with for personalized history';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_completions' AND column_name = 'notes') THEN
    COMMENT ON COLUMN prompt_completions.notes IS 'Optional: quick note about how the activity went';
  END IF;
END $$;

COMMENT ON FUNCTION get_current_streak IS 'Calculate consecutive days with at least one completion';
COMMENT ON FUNCTION get_total_completions IS 'Total number of unique days with completions';
COMMENT ON FUNCTION get_month_completions IS 'Number of days with completions this month';
