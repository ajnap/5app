-- Create favorites table to let parents bookmark prompts that work for their family
-- This addresses the "I loved that activity, where is it?" problem

CREATE TABLE IF NOT EXISTS prompt_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate favorites
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE prompt_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own favorites
CREATE POLICY "Users can view own favorites"
  ON prompt_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON prompt_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON prompt_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON prompt_favorites(prompt_id);

-- Helper function to check if a prompt is favorited
CREATE OR REPLACE FUNCTION is_favorited(p_user_id UUID, p_prompt_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM prompt_favorites
    WHERE user_id = p_user_id
    AND prompt_id = p_prompt_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to get favorite count for a prompt
CREATE OR REPLACE FUNCTION get_favorite_count(p_prompt_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM prompt_favorites
    WHERE prompt_id = p_prompt_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments for documentation
COMMENT ON TABLE prompt_favorites IS 'Stores user favorites - prompts that worked well for their family';
COMMENT ON FUNCTION is_favorited IS 'Check if a specific prompt is favorited by a user';
COMMENT ON FUNCTION get_favorite_count IS 'Get total number of users who favorited a prompt';
