-- Migration: Activity Duration Tracking
-- Adds duration tracking fields to support activity timer feature
-- and estimated duration to prompts for better user experience

-- Add duration tracking to prompt completions
ALTER TABLE prompt_completions
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER CHECK (duration_seconds >= 0 AND duration_seconds <= 7200),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN prompt_completions.duration_seconds IS 'Actual time spent on activity in seconds (max 2 hours)';
COMMENT ON COLUMN prompt_completions.started_at IS 'When user started the activity (for timer persistence)';

-- Add estimated duration to daily prompts
ALTER TABLE daily_prompts
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 5 CHECK (estimated_minutes IN (5, 10, 15, 20, 30));

COMMENT ON COLUMN daily_prompts.estimated_minutes IS 'Estimated time to complete activity (5, 10, 15, 20, or 30 minutes)';

-- Update existing prompts with estimated durations based on category
-- Quick activities: 5 minutes
UPDATE daily_prompts
SET estimated_minutes = 5
WHERE category IN ('quick_question', 'affirmation', 'gratitude')
AND estimated_minutes IS NULL;

-- Standard activities: 10 minutes (most prompts)
UPDATE daily_prompts
SET estimated_minutes = 10
WHERE category IN ('connection', 'play', 'conversation', 'physical', 'emotional')
AND estimated_minutes IS NULL;

-- Deep activities: 15 minutes
UPDATE daily_prompts
SET estimated_minutes = 15
WHERE category IN ('spiritual', 'creative', 'learning', 'storytelling', 'service')
AND estimated_minutes IS NULL;

-- Default any remaining to 10 minutes
UPDATE daily_prompts
SET estimated_minutes = 10
WHERE estimated_minutes IS NULL;

-- Create function to get time statistics
CREATE OR REPLACE FUNCTION get_time_stats(
  p_user_id UUID,
  p_period TEXT DEFAULT 'week' -- 'week', 'month', 'all'
)
RETURNS TABLE (
  total_seconds INTEGER,
  total_minutes INTEGER,
  avg_duration_seconds INTEGER,
  completion_count INTEGER
) AS $$
DECLARE
  v_start_date DATE;
BEGIN
  -- Determine start date based on period
  CASE p_period
    WHEN 'week' THEN
      v_start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN
      v_start_date := CURRENT_DATE - INTERVAL '30 days';
    ELSE
      v_start_date := '1900-01-01'; -- All time
  END CASE;

  RETURN QUERY
  SELECT
    COALESCE(SUM(duration_seconds), 0)::INTEGER AS total_seconds,
    COALESCE(SUM(duration_seconds) / 60, 0)::INTEGER AS total_minutes,
    COALESCE(AVG(duration_seconds), 0)::INTEGER AS avg_duration_seconds,
    COUNT(*)::INTEGER AS completion_count
  FROM prompt_completions
  WHERE user_id = p_user_id
    AND completion_date >= v_start_date
    AND duration_seconds IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_time_stats(UUID, TEXT) TO authenticated;

-- Create index for faster time stats queries
CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_date_duration
  ON prompt_completions(user_id, completion_date, duration_seconds)
  WHERE duration_seconds IS NOT NULL;

-- Add comment
COMMENT ON FUNCTION get_time_stats IS 'Calculate time statistics for user activity completions by period';
