-- Create prompt_completions table to track when users complete prompts
CREATE TABLE IF NOT EXISTS prompt_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES daily_prompts(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE prompt_completions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own completions
CREATE POLICY "Users can view own completions"
  ON prompt_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON prompt_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own completions
CREATE POLICY "Users can update own completions"
  ON prompt_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own completions
CREATE POLICY "Users can delete own completions"
  ON prompt_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_completions_user_id ON prompt_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_completions_prompt_id ON prompt_completions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_completions_completed_at ON prompt_completions(completed_at);
