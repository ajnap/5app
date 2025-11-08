-- =====================================================
-- Enhanced Child Profiles for AI Personalization
-- Adds rich context fields for generating personalized prompts
-- =====================================================

-- Add new columns to child_profiles
ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS communication_style TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS developmental_goals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favorite_activities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS best_time_of_day TEXT,
  ADD COLUMN IF NOT EXISTS learning_style TEXT,
  ADD COLUMN IF NOT EXISTS connection_insights TEXT,
  ADD COLUMN IF NOT EXISTS special_considerations TEXT;

-- Add helpful comments
COMMENT ON COLUMN child_profiles.communication_style IS 'How child best receives love/connection (words of affirmation, physical touch, quality time, gifts, acts of service)';
COMMENT ON COLUMN child_profiles.strengths IS 'Child''s natural strengths and talents';
COMMENT ON COLUMN child_profiles.developmental_goals IS 'Current areas of growth/development focus';
COMMENT ON COLUMN child_profiles.favorite_activities IS 'Specific activities child loves doing with parent';
COMMENT ON COLUMN child_profiles.best_time_of_day IS 'When child is most engaged (morning, afternoon, evening, bedtime)';
COMMENT ON COLUMN child_profiles.learning_style IS 'How child learns best (visual, auditory, kinesthetic, reading/writing)';
COMMENT ON COLUMN child_profiles.connection_insights IS 'Parent notes on what works well for connection';
COMMENT ON COLUMN child_profiles.special_considerations IS 'Allergies, diagnoses, or other important context';
