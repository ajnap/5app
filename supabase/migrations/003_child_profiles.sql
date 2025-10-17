-- Create child_profiles table for storing information about each child
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  interests TEXT[], -- Array of interests (sports, reading, art, etc.)
  personality_traits TEXT[], -- Array of traits (shy, energetic, curious, etc.)
  current_challenges TEXT[], -- Array of challenges (tantrums, screen time, homework, etc.)
  photo_url TEXT, -- Optional profile photo
  notes TEXT, -- Any additional notes about the child
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own children's profiles
CREATE POLICY "Users can view own children profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own children's profiles
CREATE POLICY "Users can insert own children profiles"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own children's profiles
CREATE POLICY "Users can update own children profiles"
  ON child_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own children's profiles
CREATE POLICY "Users can delete own children profiles"
  ON child_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);

-- Function to calculate age from birth_date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get age category for prompt filtering
CREATE OR REPLACE FUNCTION get_age_category(birth_date DATE)
RETURNS TEXT AS $$
DECLARE
  age INTEGER;
BEGIN
  age := calculate_age(birth_date);

  IF age < 2 THEN
    RETURN 'infant'; -- 0-1 years
  ELSIF age < 5 THEN
    RETURN 'toddler'; -- 2-4 years
  ELSIF age < 12 THEN
    RETURN 'elementary'; -- 5-11 years
  ELSIF age < 18 THEN
    RETURN 'teen'; -- 12-17 years
  ELSE
    RETURN 'young_adult'; -- 18+ years
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_child_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER on_child_profile_updated
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_child_profile_updated_at();

-- Add age_category column to daily_prompts for filtering
ALTER TABLE daily_prompts ADD COLUMN IF NOT EXISTS age_categories TEXT[] DEFAULT ARRAY['all'];

-- Update existing prompts to work for all ages (can customize later)
UPDATE daily_prompts SET age_categories = ARRAY['all'] WHERE age_categories IS NULL;

COMMENT ON TABLE child_profiles IS 'Stores profile information for each child to enable personalized prompts';
COMMENT ON COLUMN child_profiles.interests IS 'Array of child interests for prompt personalization';
COMMENT ON COLUMN child_profiles.personality_traits IS 'Array of personality traits to tailor communication';
COMMENT ON COLUMN child_profiles.current_challenges IS 'Current parenting challenges to address';
COMMENT ON FUNCTION calculate_age IS 'Calculate age in years from birth date';
COMMENT ON FUNCTION get_age_category IS 'Get age category (infant, toddler, elementary, teen, young_adult) for prompt filtering';
