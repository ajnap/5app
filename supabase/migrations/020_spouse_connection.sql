-- Spouse Connection Features
-- Enables couples to strengthen their relationship through guided communication and shared activities

-- Spouse profiles with personality and preferences
CREATE TABLE IF NOT EXISTS spouse_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  partner_email TEXT, -- Email to invite/link spouse
  partner_user_id UUID REFERENCES auth.users(id), -- Linked partner account
  love_language TEXT CHECK (love_language IN ('words_of_affirmation', 'acts_of_service', 'receiving_gifts', 'quality_time', 'physical_touch')),
  communication_style TEXT, -- open-ended for personalization
  preferences JSONB DEFAULT '{}', -- flexible preferences storage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily conversation prompts/questions
CREATE TABLE IF NOT EXISTS conversation_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- 'daily', 'deep', 'fun', 'conflict', 'money', 'parenting'
  difficulty TEXT CHECK (difficulty IN ('light', 'medium', 'deep')),
  question TEXT NOT NULL,
  follow_up_questions TEXT[], -- Additional prompts to deepen conversation
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Connection activities log (date nights, check-ins, etc)
CREATE TABLE IF NOT EXISTS connection_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'date_night', 'check_in', 'conversation', 'service_act', 'quality_time'
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5), -- 1-5 scale
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relationship mood/connection check-ins
CREATE TABLE IF NOT EXISTS connection_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_rating INTEGER NOT NULL CHECK (connection_rating >= 1 AND connection_rating <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shared couple goals and action items
CREATE TABLE IF NOT EXISTS couple_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'date_night', 'communication', 'financial', 'intimacy', 'personal_growth'
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation starters used/saved
CREATE TABLE IF NOT EXISTS used_conversation_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES conversation_prompts(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- How helpful was this prompt?
  notes TEXT,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_spouse_profiles_user_id ON spouse_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_spouse_profiles_partner_user_id ON spouse_profiles(partner_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_activities_user_id ON connection_activities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_connection_checkins_user_id ON connection_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_couple_goals_user_id ON couple_goals(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_conversation_prompts_category ON conversation_prompts(category);

-- Row Level Security (RLS)
ALTER TABLE spouse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE used_conversation_prompts ENABLE ROW LEVEL SECURITY;

-- Spouse profiles policies
CREATE POLICY "Users can view own spouse profile"
  ON spouse_profiles FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

CREATE POLICY "Users can create own spouse profile"
  ON spouse_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spouse profile"
  ON spouse_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Connection activities policies
CREATE POLICY "Users can view own activities"
  ON connection_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activities"
  ON connection_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON connection_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own checkins"
  ON connection_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON connection_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON couple_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON couple_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON couple_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Used prompts policies
CREATE POLICY "Users can view own used prompts"
  ON used_conversation_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own used prompts"
  ON used_conversation_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Conversation prompts are public (read-only for all authenticated users)
ALTER TABLE conversation_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view prompts"
  ON conversation_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Seed some conversation prompts
INSERT INTO conversation_prompts (category, difficulty, question, follow_up_questions, tags) VALUES
  ('daily', 'light', 'What made you smile today?', ARRAY['What can I do to give you more moments like that?', 'How can we create that feeling together?'], ARRAY['gratitude', 'positivity']),
  ('daily', 'light', 'What''s one thing I did recently that made you feel loved?', ARRAY['How often would you like me to do that?', 'What else makes you feel that way?'], ARRAY['appreciation', 'love_languages']),
  ('deep', 'medium', 'What''s one dream you have for our family in the next 5 years?', ARRAY['What would it take to make that happen?', 'How can I support you in this?'], ARRAY['future', 'family', 'dreams']),
  ('deep', 'deep', 'When do you feel most connected to me?', ARRAY['What can we do more of to recreate that feeling?', 'Is there anything preventing us from connecting like that more often?'], ARRAY['connection', 'intimacy']),
  ('parenting', 'medium', 'How do you think we''re balancing the parenting workload?', ARRAY['What would help you feel more supported?', 'Are there tasks you''d like to trade or share differently?'], ARRAY['parenting', 'teamwork']),
  ('parenting', 'light', 'What''s something our kids did recently that amazed you?', ARRAY['How can we encourage more of that?', 'What does that tell us about who they''re becoming?'], ARRAY['children', 'gratitude', 'parenting']),
  ('fun', 'light', 'If we could have a date night anywhere this weekend, where would you want to go?', ARRAY['What would make it perfect?', 'Can we make that happen?'], ARRAY['date_night', 'planning']),
  ('fun', 'light', 'What''s one adventure you want us to go on together this year?', ARRAY['What''s stopping us?', 'Let''s pick a date!'], ARRAY['adventure', 'goals']),
  ('conflict', 'deep', 'What''s one thing we keep arguing about that we need to resolve?', ARRAY['What would a solution look like for you?', 'How can we both feel heard on this?'], ARRAY['conflict', 'communication']),
  ('money', 'medium', 'What financial goal would make you feel most secure?', ARRAY['What steps can we take this month toward that goal?', 'What trade-offs are you willing to make?'], ARRAY['finances', 'goals', 'security'])
ON CONFLICT DO NOTHING;
