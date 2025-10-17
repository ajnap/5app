-- Add more realistic, practical, faith-friendly prompts
-- Focus: Simple 5-minute activities, not corny, appropriate for religious families
-- Dates continue from 005 migration (2026-01-22 onwards)

-- REMOVE coffee reference from existing prompt
UPDATE daily_prompts
SET title = 'One-on-One Time',
    description = 'Build an adult-to-adult relationship with your grown child.',
    activity = 'Invite them to a meal or a walk together. Ask about their interests, goals, or challenges. Listen like you would to a friend - with curiosity, not judgment. Your role is shifting from director to consultant.'
WHERE title = 'Coffee Date Invitation';

-- TODDLER & ELEMENTARY: More realistic daily activities
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Countdown to Calm',
  'Give a heads-up before transitions to reduce resistance.',
  'Before turning off the TV or leaving the park, say: "We have 5 more minutes." Set a timer they can see. When it goes off, follow through calmly. This simple warning prevents most meltdowns.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['transitions', 'screen time', 'routines'],
  '2026-01-22'::DATE
),
(
  'The Two-Choice Strategy',
  'Reduce power struggles by offering limited options.',
  'Instead of "Put your shoes on," try: "Do you want to wear your sneakers or your boots?" They feel in control, you get cooperation. Works for clothes, snacks, homework timing.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['cooperation', 'independence', 'listening'],
  '2026-01-23'::DATE
),
(
  'After-School Decompression',
  'Give them space before asking about their day.',
  'When they get home, offer a snack and 10 minutes of quiet. No interrogation. Some kids need to decompress before talking. After the break, they might open up naturally.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['school', 'communication', 'boundaries'],
  '2026-01-24'::DATE
),
(
  'Morning Connection Ritual',
  'Start the day with a moment of connection.',
  'Before the rush begins, spend 2 minutes together. Read one page of a book, do stretches together, or share one thing you''re each looking forward to today. Calm mornings set the tone.',
  'connection',
  ARRAY['toddler', 'elementary'],
  ARRAY['routines', 'morning', 'quality time'],
  '2026-01-25'::DATE
);

-- TEEN: Realistic connection without being pushy
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Car Conversation',
  'Side-by-side conversations feel less intense than face-to-face.',
  'When driving together, try one open question: "What''s one thing that surprised you this week?" or "Anything stressing you out?" Don''t push if they don''t want to talk. Your availability matters.',
  'connection',
  ARRAY['teen'],
  ARRAY['communication', 'quality time', 'trust'],
  '2026-01-26'::DATE
),
(
  'Text Check-In',
  'Meet them where they are - on their phone.',
  'Send a simple text: "How''s your day going?" or "Thinking of you." One message shows you care without hovering. Let them respond when they''re ready.',
  'connection',
  ARRAY['teen', 'young_adult'],
  ARRAY['communication', 'respect', 'independence'],
  '2026-01-27'::DATE
),
(
  'Respect Their Space',
  'Connection isn''t always talking - sometimes it''s just being available.',
  'Tonight, be in the same room doing your own thing. Read, fold laundry, work on a project. Don''t force conversation. Sometimes they''ll start talking when there''s no pressure.',
  'connection',
  ARRAY['teen'],
  ARRAY['presence', 'boundaries', 'trust'],
  '2026-01-28'::DATE
);

-- MULTI-AGE: Practical routines & life skills
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Chores as Connection',
  'Work alongside them instead of supervising from afar.',
  'Pick one chore and do it together: folding laundry, washing dishes, sorting mail. Chat while you work. Competence builds confidence, and parallel activities often lead to real conversations.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['life skills', 'quality time', 'responsibility'],
  '2026-01-29'::DATE
),
(
  'Apologize and Repair',
  'Model how to make things right after conflict.',
  'After losing your patience, wait until you''re both calm. Then say: "I''m sorry I yelled. You didn''t deserve that. Can we try again?" This teaches accountability and emotional repair.',
  'behavior',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['emotional regulation', 'respect', 'modeling'],
  '2026-01-30'::DATE
),
(
  'One-on-One Errands',
  'Turn necessary tasks into connection time.',
  'Take one child with you to the store, post office, or bank. Let them help navigate, carry items, or make small decisions. These ordinary moments often matter most.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['quality time', 'one-on-one', 'life skills'],
  '2026-01-31'::DATE
);

-- BEDTIME & MEALTIME: Realistic, pressure-free
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'No-Pressure Mealtime',
  'Family meals don''t have to be perfect to be meaningful.',
  'Tonight, eat together without devices for just 10 minutes. Don''t force conversation or "how was school." Sometimes just eating in the same space is enough.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['mealtime', 'family time', 'presence'],
  '2026-02-01'::DATE
),
(
  'The Simple Bedtime Routine',
  'Consistency matters more than complexity.',
  'Keep it simple: pajamas, teeth, one book (toddlers) or 5 minutes of chat (older kids), lights out. The routine itself is soothing - you don''t need elaborate rituals.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['bedtime', 'routines', 'sleep'],
  '2026-02-02'::DATE
),
(
  'Bedtime Boundaries',
  'Set a clear end time and stick to it.',
  'After routine, say: "It''s time for sleep. I''ll check on you in 10 minutes." Then do it. Checking in prevents anxiety, but boundaries prevent endless delays. Be boring but consistent.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['bedtime resistance', 'boundaries', 'consistency'],
  '2026-02-03'::DATE
);

-- FAITH-FRIENDLY: Gentle, inclusive spiritual connection
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Evening Gratitude',
  'End the day reflecting on the good.',
  'At bedtime, each share one thing you''re grateful for from today. No pressure to be profound - "grateful the sun was out" counts. Gratitude shifts perspective on hard days.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['gratitude', 'bedtime', 'faith', 'reflection'],
  '2026-02-04'::DATE
),
(
  'Service Together',
  'Show values through action, not just words.',
  'Do one small act of service together: bake cookies for a neighbor, write a thank-you note, help a sibling. Five minutes of kindness teaches character.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['service', 'values', 'character', 'faith'],
  '2026-02-05'::DATE
),
(
  'Morning Blessing',
  'Start the day with intention.',
  'Before leaving for school/work, place a hand on their shoulder and say: "Have a great day. I''m proud of you." Adjust the words to fit your family. Simple rituals create security.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['morning', 'faith', 'blessing', 'encouragement'],
  '2026-02-06'::DATE
);

-- BEHAVIOR: More realistic challenges
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Whining Response',
  'Respond to tone without engaging with content.',
  'When whining starts, calmly say: "I can''t understand you when you use that voice. Try again with your regular voice." Then wait. Don''t negotiate until the tone changes.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['whining', 'communication', 'boundaries'],
  '2026-02-07'::DATE
),
(
  'Catch Them Being Good',
  'Notice and name positive behavior.',
  'Instead of only correcting problems, catch them doing something right. "I noticed you shared with your brother. That was kind." Specific praise builds more good behavior.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['positive reinforcement', 'encouragement', 'attention'],
  '2026-02-08'::DATE
),
(
  'The Bored Breakthrough',
  'Let them be bored - creativity follows.',
  'When they say "I''m bored," resist the urge to entertain. Say: "Being bored is okay. Your brain will figure out what to do." Give it 10 minutes. They often surprise themselves.',
  'behavior',
  ARRAY['elementary', 'teen'],
  ARRAY['independence', 'creativity', 'screen time'],
  '2026-02-09'::DATE
),
(
  'Sibling Conflict Timeout',
  'Step back and let them work it out when possible.',
  'If no one is hurt, say: "You two work this out. I''ll be in the kitchen if you need help." Give them 3 minutes to solve it themselves. Resist rescuing too quickly.',
  'behavior',
  ARRAY['elementary', 'teen'],
  ARRAY['sibling rivalry', 'conflict resolution', 'independence'],
  '2026-02-10'::DATE
);

-- LEARNING & GROWTH
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Read One Page',
  'Lower the bar to build the habit.',
  'Tell yourself: "We''ll read just one page tonight." Often you''ll read more, but even one page builds the routine. Progress over perfection.',
  'learning',
  ARRAY['toddler', 'elementary'],
  ARRAY['reading', 'habits', 'routines'],
  '2026-02-11'::DATE
),
(
  'Ask One Real Question',
  'Show interest in what they''re learning.',
  'Instead of "How was school?" ask: "What''s one thing you learned today?" or "What was the hardest part of your day?" Specific questions get real answers.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['school', 'communication', 'learning'],
  '2026-02-12'::DATE
),
(
  'Let Them Teach You',
  'Flip the script - ask them to explain something.',
  'Ask them to teach you about something they know: a video game level, a TikTok trend, a science concept. Listening to them explain builds confidence and connection.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['learning', 'communication', 'respect'],
  '2026-02-13'::DATE
);

-- Comment on new prompt additions
COMMENT ON TABLE daily_prompts IS 'Simple 5-minute connection activities - realistic, practical, faith-friendly';
