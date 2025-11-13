-- =====================================================
-- Enhanced Child Profiles for AI Personalization
-- Adds rich context fields for generating personalized prompts
-- =====================================================

-- Add new columns to child_profiles
ALTER TABLE child_profiles
  -- Connection & Communication
  ADD COLUMN IF NOT EXISTS communication_style TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS best_time_of_day TEXT,
  ADD COLUMN IF NOT EXISTS connection_insights TEXT,

  -- Strengths & Challenges
  ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS challenges_weaknesses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS developmental_goals TEXT[] DEFAULT '{}',

  -- Interests & Preferences
  ADD COLUMN IF NOT EXISTS favorite_activities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learning_style TEXT,
  ADD COLUMN IF NOT EXISTS sensory_preferences TEXT,
  ADD COLUMN IF NOT EXISTS social_preferences TEXT,

  -- Behavior & Emotional Patterns
  ADD COLUMN IF NOT EXISTS motivators TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS triggers_stressors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS emotional_regulation TEXT,
  ADD COLUMN IF NOT EXISTS discipline_approach TEXT,
  ADD COLUMN IF NOT EXISTS energy_patterns TEXT,

  -- Parent Focus
  ADD COLUMN IF NOT EXISTS current_focus_areas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS special_considerations TEXT;

-- Add helpful comments
COMMENT ON COLUMN child_profiles.communication_style IS 'How child best receives love/connection (words of affirmation, physical touch, quality time, gifts, acts of service)';
COMMENT ON COLUMN child_profiles.best_time_of_day IS 'When child is most engaged (morning, afternoon, evening, bedtime)';
COMMENT ON COLUMN child_profiles.connection_insights IS 'Parent notes on what works well for connection';

COMMENT ON COLUMN child_profiles.strengths IS 'Child''s natural strengths and talents';
COMMENT ON COLUMN child_profiles.challenges_weaknesses IS 'Areas where child struggles or needs support';
COMMENT ON COLUMN child_profiles.developmental_goals IS 'Current areas of growth/development focus';

COMMENT ON COLUMN child_profiles.favorite_activities IS 'Specific activities child loves doing with parent';
COMMENT ON COLUMN child_profiles.learning_style IS 'How child learns best (visual, auditory, kinesthetic, reading/writing)';
COMMENT ON COLUMN child_profiles.sensory_preferences IS 'Sensory sensitivities, preferences (noise levels, textures, etc.)';
COMMENT ON COLUMN child_profiles.social_preferences IS 'Prefers one-on-one vs groups, introverted/extroverted tendencies';

COMMENT ON COLUMN child_profiles.motivators IS 'What excites, motivates, or rewards the child';
COMMENT ON COLUMN child_profiles.triggers_stressors IS 'What tends to upset, frustrate, or stress the child';
COMMENT ON COLUMN child_profiles.emotional_regulation IS 'How child handles big emotions, self-regulation abilities';
COMMENT ON COLUMN child_profiles.discipline_approach IS 'Discipline/correction methods that work (or don''t work) for this child';
COMMENT ON COLUMN child_profiles.energy_patterns IS 'Energy levels throughout the day, need for quiet time, etc.';

COMMENT ON COLUMN child_profiles.current_focus_areas IS 'What parent wants to work on right now with this child';
COMMENT ON COLUMN child_profiles.special_considerations IS 'Allergies, diagnoses, medications, or other important medical/developmental context';
