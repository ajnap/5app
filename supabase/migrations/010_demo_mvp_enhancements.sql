-- Migration: Demo MVP Enhancements
-- Description: Adds journal_entries table, profile enhancements (faith_mode, onboarding), and reflection notes
-- Date: 2025-10-21

-- =====================================================
-- 1. Add columns to profiles table
-- =====================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS faith_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.faith_mode IS 'Whether user wants faith-based reflection prompts';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed initial onboarding flow';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- =====================================================
-- 2. Add reflection_note column to prompt_completions
-- =====================================================

ALTER TABLE prompt_completions
  ADD COLUMN IF NOT EXISTS reflection_note TEXT CHECK (char_length(reflection_note) <= 500);

COMMENT ON COLUMN prompt_completions.reflection_note IS 'Optional reflection note after completing activity (max 500 chars)';

-- =====================================================
-- 3. Create journal_entries table
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  emoji_reactions TEXT[] DEFAULT '{}',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE journal_entries IS 'Quick memory journal entries for capturing special moments with children';
COMMENT ON COLUMN journal_entries.user_id IS 'Parent who created the entry';
COMMENT ON COLUMN journal_entries.child_id IS 'Child the memory is about';
COMMENT ON COLUMN journal_entries.content IS 'Memory text (1-500 characters)';
COMMENT ON COLUMN journal_entries.emoji_reactions IS 'Optional emoji reactions (❤️ 😊 🎉 🤗 ✨)';
COMMENT ON COLUMN journal_entries.entry_date IS 'Date of the memory (defaults to today)';

-- =====================================================
-- 4. Create indexes for journal_entries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id
  ON journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_child_id
  ON journal_entries(child_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date
  ON journal_entries(entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_child
  ON journal_entries(user_id, child_id, entry_date DESC);

-- =====================================================
-- 5. Enable RLS on journal_entries
-- =====================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own journal entries
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own journal entries
CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own journal entries
CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. Create updated_at trigger for journal_entries
-- =====================================================

CREATE OR REPLACE FUNCTION update_journal_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entries_updated_at();

-- =====================================================
-- 7. Create database functions for child-specific queries
-- =====================================================

-- Function: Get child's completions with details
CREATE OR REPLACE FUNCTION get_child_completions(p_child_id UUID)
RETURNS TABLE (
  prompt_id UUID,
  prompt_title TEXT,
  prompt_category TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_date DATE,
  reflection_note TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.prompt_id,
    dp.title,
    dp.category,
    pc.completed_at,
    pc.completion_date,
    pc.reflection_note
  FROM prompt_completions pc
  JOIN daily_prompts dp ON pc.prompt_id = dp.id
  WHERE pc.child_id = p_child_id
  ORDER BY pc.completed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_child_completions IS 'Get all completions for a specific child with prompt details';

-- Function: Get category breakdown for a child
CREATE OR REPLACE FUNCTION get_category_breakdown(p_child_id UUID)
RETURNS TABLE (
  category TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.category,
    COUNT(*) as count
  FROM prompt_completions pc
  JOIN daily_prompts dp ON pc.prompt_id = dp.id
  WHERE pc.child_id = p_child_id
  GROUP BY dp.category
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_category_breakdown IS 'Get activity distribution by category for a child';

-- Function: Get child streak (consecutive days of completions)
CREATE OR REPLACE FUNCTION get_child_streak(p_child_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  has_completion BOOLEAN;
BEGIN
  check_date := CURRENT_DATE;

  LOOP
    -- Check if there's a completion on this date
    SELECT EXISTS (
      SELECT 1 FROM prompt_completions
      WHERE child_id = p_child_id
      AND completion_date = check_date
    ) INTO has_completion;

    -- If no completion found, break the loop
    IF NOT has_completion THEN
      EXIT;
    END IF;

    -- Increment streak and move to previous day
    current_streak := current_streak + 1;
    check_date := check_date - INTERVAL '1 day';

    -- Safety limit to prevent infinite loop
    IF current_streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_child_streak IS 'Calculate consecutive days of completions for a child';

-- Function: Get recent journal entries for a child
CREATE OR REPLACE FUNCTION get_child_journal_entries(p_child_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  content TEXT,
  emoji_reactions TEXT[],
  entry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id,
    je.content,
    je.emoji_reactions,
    je.entry_date,
    je.created_at
  FROM journal_entries je
  WHERE je.child_id = p_child_id
  ORDER BY je.entry_date DESC, je.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_child_journal_entries IS 'Get recent journal entries for a child';

-- =====================================================
-- 8. Grant necessary permissions
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_child_completions TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION get_child_streak TO authenticated;
GRANT EXECUTE ON FUNCTION get_child_journal_entries TO authenticated;
