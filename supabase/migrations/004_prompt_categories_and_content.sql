-- Add category column to daily_prompts for better organization
ALTER TABLE daily_prompts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'connection';

-- Add tags for additional filtering
ALTER TABLE daily_prompts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for faster category queries
CREATE INDEX IF NOT EXISTS idx_daily_prompts_category ON daily_prompts(category);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_age_categories ON daily_prompts USING GIN(age_categories);

-- Insert sample prompts for different age categories and challenges
-- These address the top pain points from user research: behavior, connection, routines
-- Using dates far in the future to avoid conflicts with existing prompts

-- INFANT PROMPTS (0-1 years)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Tummy Time Together',
  'Strengthen your baby''s muscles while creating joyful moments of connection.',
  'Get down on the floor at baby''s level. Make silly faces, sing songs, or use colorful toys to encourage them during tummy time. Your presence and encouragement makes all the difference!',
  'connection',
  ARRAY['infant'],
  ARRAY['physical development', 'bonding'],
  '2026-01-01'::DATE
),
(
  'Baby''s First Book',
  'Even tiny babies love the sound of your voice and colorful pictures.',
  'Choose a board book with high-contrast images. Hold baby close and read slowly, pointing to pictures. It''s okay if you only get through one page - you''re building a love of reading!',
  'learning',
  ARRAY['infant'],
  ARRAY['reading', 'language development'],
  '2026-01-02'::DATE
);

-- TODDLER PROMPTS (2-4 years)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Bedtime Wind-Down',
  'Make bedtime less of a battle with a calming routine.',
  'Create a simple 3-step routine: 1) Dim the lights 2) Read one short book together 3) Sing a lullaby or play soft music. Consistency is key - do the same routine every night.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['bedtime resistance', 'routines', 'sleep'],
  '2026-01-03'::DATE
),
(
  'Tantrum Timeout (For You!)',
  'When your toddler is melting down, take a breath before responding.',
  'When you feel frustration rising, take 3 deep breaths. Get down to their eye level. Say: "I see you''re upset. Let''s take a break together." Remember: their big feelings need your calm presence.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['tantrums', 'emotional regulation'],
  '2026-01-04'::DATE
),
(
  'Silly Dance Party',
  'Burn energy and create joy with 5 minutes of movement.',
  'Put on a favorite song and dance together. Follow their moves, add silly actions, and laugh together. No rules, just fun! This helps with emotional regulation and bonding.',
  'connection',
  ARRAY['toddler'],
  ARRAY['energy release', 'bonding', 'fun'],
  '2026-01-05'::DATE
),
(
  'Sharing Practice',
  'Help your toddler learn to share without forcing it.',
  'Set a timer for 2 minutes. Say "You can play with this toy until the timer beeps, then it''s brother/sister''s turn." Practice taking turns with something fun YOU want to share with them first.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['sibling rivalry', 'sharing', 'turn-taking'],
  '2026-01-06'::DATE
);

-- ELEMENTARY PROMPTS (5-11 years)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Screen Time Transition',
  'Make screen time endings smoother with a simple warning system.',
  'Before screen time starts, agree together: "You can watch/play for 20 minutes. I''ll give you a 5-minute warning." Set a timer where they can see it. When it beeps, follow through calmly and kindly.',
  'behavior',
  ARRAY['elementary'],
  ARRAY['screen time', 'transitions', 'boundaries'],
  '2026-01-07'::DATE
),
(
  'Homework Without the Fight',
  'Transform homework time from battle to teamwork.',
  'Ask: "What''s the hardest part about your homework today?" Listen fully. Then: "How can I help?" Sometimes they just need you nearby. Offer a snack and set a timer for focus bursts (20 min work, 5 min break).',
  'behavior',
  ARRAY['elementary'],
  ARRAY['homework', 'school', 'support'],
  '2026-01-08'::DATE
),
(
  'Sibling Rivalry Reset',
  'Stop the fighting by giving each child individual attention.',
  'Spend 5 minutes alone with ONE child. Ask: "What''s your favorite thing right now?" or "What made you laugh today?" This one-on-one time reduces sibling jealousy and fills their attention tank.',
  'connection',
  ARRAY['elementary', 'toddler'],
  ARRAY['sibling rivalry', 'one-on-one time', 'attention'],
  '2026-01-09'::DATE
),
(
  'The Listening Game',
  'Improve listening without nagging.',
  'Turn listening into a fun game. Say: "I''m going to give you 3 instructions. Let''s see if you can remember all 3!" Keep it light and fun. Celebrate when they succeed. (Example: Put your shoes on, grab your backpack, meet me at the door).',
  'behavior',
  ARRAY['elementary', 'toddler'],
  ARRAY['listening', 'following directions', 'cooperation'],
  '2026-01-10'::DATE
),
(
  'Question of the Day',
  'Build deeper connection through meaningful conversation.',
  'At dinner or bedtime, ask: "If you could have any superpower for just one day, what would it be and why?" Take turns answering. Really listen to their answer - don''t correct or judge, just be curious.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['conversation', 'bonding', 'communication'],
  '2026-01-11'::DATE
);

-- TEEN PROMPTS (12-17 years)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Drive-Time Connection',
  'Use car time to have real conversations without pressure.',
  'When driving together, ask one open-ended question: "What''s something that surprised you this week?" or "What are you looking forward to?" Side-by-side conversations are easier for teens than face-to-face.',
  'connection',
  ARRAY['teen'],
  ARRAY['communication', 'bonding', 'conversation'],
  '2026-01-12'::DATE
),
(
  'The Talking Back Pause',
  'Respond to attitude without escalating the conflict.',
  'When they talk back, pause. Take a breath. Say calmly: "I can see you''re upset, but that tone doesn''t work. Try again respectfully." Then give them a chance to rephrase. Model the respect you want to see.',
  'behavior',
  ARRAY['teen'],
  ARRAY['talking back', 'respect', 'boundaries'],
  '2026-01-13'::DATE
),
(
  'Screen-Free Snack',
  'Create a daily 10-minute tech-free connection point.',
  'Invite them to have a snack with you - no phones allowed. Don''t force conversation. Just be present. Sometimes they''ll open up about their day. Sometimes you''ll just eat together. Both matter.',
  'connection',
  ARRAY['teen', 'elementary'],
  ARRAY['screen time', 'quality time', 'presence'],
  '2026-01-14'::DATE
),
(
  'The Homework Boundary',
  'Support their independence while staying involved.',
  'Instead of "Is your homework done?" try: "How''s your workload this week? Anything you want help thinking through?" Shift from monitoring to mentoring. Let natural consequences teach when possible.',
  'behavior',
  ARRAY['teen'],
  ARRAY['homework', 'independence', 'responsibility'],
  '2026-01-15'::DATE
);

-- YOUNG ADULT PROMPTS (18+ years)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Check-In Text',
  'Stay connected without being overbearing.',
  'Send a simple text: "Thinking of you today. How are you doing?" Wait for their response. Don''t pepper them with questions. One genuine question shows you care without hovering.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['communication', 'independence', 'respect'],
  '2026-01-16'::DATE
),
(
  'Coffee Date Invitation',
  'Build adult-to-adult relationship with your grown child.',
  'Invite them to coffee or a meal. Ask about their interests, goals, or challenges. Listen like you would to a friend - with curiosity, not judgment. Your role is shifting from director to consultant.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['adult relationship', 'bonding', 'transition'],
  '2026-01-17'::DATE
);

-- MULTI-AGE PROMPTS (work for multiple age groups)
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Meal Prep Together',
  'Turn dinner prep into quality time and life skills practice.',
  'Choose one simple task they can help with based on age: washing vegetables, stirring, setting the table. Chat while you work. This is where the best conversations happen naturally.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['life skills', 'routines', 'quality time'],
  '2026-01-18'::DATE
),
(
  'Gratitude Before Bed',
  'End the day on a positive note, no matter how hard it was.',
  'At bedtime, share one thing you''re grateful for about today. Invite them to share too. Some days it''s "I''m grateful we all survived today!" That counts. Gratitude reframes hard days.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['gratitude', 'bedtime', 'positive parenting'],
  '2026-01-19'::DATE
),
(
  'The Calm-Down Corner',
  'Create a safe space for big emotions.',
  'Set up a cozy spot with pillows, books, and calming items. When emotions run high, offer: "Do you want to go to the calm-down corner together or alone?" It''s not punishment - it''s a tool for emotional regulation.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['emotional regulation', 'tantrums', 'safe space'],
  '2026-01-20'::DATE
),
(
  'Outside for 5',
  'Reset everyone''s mood with fresh air and movement.',
  'When tensions are high, step outside together for 5 minutes. Blow bubbles, kick a ball, or just walk to the mailbox. Nature and movement reset the nervous system for everyone.',
  'connection',
  ARRAY['infant', 'toddler', 'elementary'],
  ARRAY['outdoor play', 'reset', 'energy release'],
  '2026-01-21'::DATE
);

-- Add comment explaining the prompt system
COMMENT ON COLUMN daily_prompts.category IS 'Prompt category: connection, behavior, learning, mealtime, bedtime';
COMMENT ON COLUMN daily_prompts.age_categories IS 'Age groups this prompt is appropriate for: infant, toddler, elementary, teen, young_adult';
COMMENT ON COLUMN daily_prompts.tags IS 'Searchable tags for filtering by specific challenges or topics';
