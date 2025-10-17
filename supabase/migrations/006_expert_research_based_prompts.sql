-- Research-backed prompts based on attachment theory, neuroscience, and faith-based parenting
-- Drawing from: Dr. Becky Kennedy, Siegel & Bryson, Hand in Hand Parenting, Kim John Payne
-- Focus: Practical application of proven concepts in 5-minute increments

-- ATTACHMENT & EMOTIONAL CO-REGULATION
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Repair Conversation',
  'Rupture and repair builds resilience - perfection doesn''t.',
  'After a hard moment, find them when calm. Say: "Earlier when I raised my voice, that wasn''t okay. You deserved better. I''m working on it." Kids don''t need perfect parents - they need parents who repair.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['repair', 'modeling', 'emotional regulation', 'attachment'],
  '2026-02-14'::DATE
),
(
  'Name It to Tame It',
  'Help them understand and regulate big emotions.',
  'When emotions are high, get to their level and say: "You seem really frustrated right now. Is that what you''re feeling?" Naming the emotion activates the thinking brain and calms the reactive brain.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['emotional regulation', 'tantrums', 'neuroscience', 'validation'],
  '2026-02-15'::DATE
),
(
  'StayListening',
  'Sometimes they need to cry with you, not have you fix it.',
  'When they''re upset, resist the urge to fix or distract. Instead, stay close and say: "I''m right here. You''re safe." Let them release the feeling. Your calm presence is the healing.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['emotional regulation', 'attachment', 'listening', 'presence'],
  '2026-02-16'::DATE
);

-- SPECIAL TIME / QUALITY ATTENTION
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Undivided Attention',
  'Five minutes of full focus fills their emotional tank.',
  'Set a timer for 5 minutes. Put your phone away. Let them choose the activity. Say: "For the next 5 minutes, I''m all yours." This predictable one-on-one time prevents attention-seeking behavior.',
  'connection',
  ARRAY['toddler', 'elementary'],
  ARRAY['special time', 'one-on-one', 'attachment', 'attention'],
  '2026-02-17'::DATE
),
(
  'Floor Time',
  'Get down to their physical level - it changes everything.',
  'Sit on the floor where they play. Don''t direct - just be present. Narrate what you see: "You''re building a tall tower!" Your proximity and attention is the gift, not the activity.',
  'connection',
  ARRAY['infant', 'toddler', 'elementary'],
  ARRAY['play', 'presence', 'attachment', 'connection'],
  '2026-02-18'::DATE
);

-- BRAIN DEVELOPMENT & LEARNING
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Power of Yet',
  'Reframe failure as part of learning.',
  'When they say "I can''t do it," add one word: "YET. You can''t do it yet." This growth mindset language builds resilience. Struggle is how the brain grows, not a sign of weakness.',
  'learning',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['growth mindset', 'resilience', 'encouragement', 'learning'],
  '2026-02-19'::DATE
),
(
  'Narrate the Process',
  'Talk through your thinking to build their problem-solving skills.',
  'When doing a task, speak your thoughts aloud: "Hmm, the door is stuck. Let me try pulling instead of pushing." You''re teaching them how to think through problems, not just solve them.',
  'learning',
  ARRAY['toddler', 'elementary'],
  ARRAY['problem solving', 'modeling', 'learning', 'executive function'],
  '2026-02-20'::DATE
),
(
  'Mistakes Are Information',
  'Normalize failure as part of growth.',
  'When something goes wrong, say: "Interesting! That didn''t work. What can we learn from this?" Frame mistakes as data, not disasters. This builds a brain that takes healthy risks.',
  'learning',
  ARRAY['elementary', 'teen'],
  ARRAY['growth mindset', 'resilience', 'learning', 'failure'],
  '2026-02-21'::DATE
);

-- SIMPLICITY & SLOWING DOWN
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Slow Morning',
  'Add 5 minutes of buffer time to reduce rushing.',
  'Tomorrow, wake up 5 minutes earlier. Use that time to sit together quietly before the rush. No agenda - just calm presence. Rushing creates stress; margin creates connection.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['morning', 'routines', 'simplicity', 'pace'],
  '2026-02-22'::DATE
),
(
  'One Thing at a Time',
  'Reduce overscheduling with intentional pauses.',
  'Today, cancel one activity. Use that time for nothing: sit together, play in the yard, or just rest. Busy isn''t better. Presence is.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['simplicity', 'overscheduling', 'rest', 'presence'],
  '2026-02-23'::DATE
),
(
  'The Toy Pause',
  'Less toys = more creativity and focus.',
  'Put half the toys away for a month. Watch what happens. Often, fewer choices leads to deeper play. Simplicity creates space for imagination.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['simplicity', 'play', 'creativity', 'declutter'],
  '2026-02-24'::DATE
);

-- FAITH & CHARACTER
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Blessing Ritual',
  'Speak identity and value over them daily.',
  'Place your hand on their head or shoulder. Say: "You are loved. You are capable. You are exactly who you''re meant to be." Short blessings shape identity more than long lectures.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['faith', 'blessing', 'identity', 'affirmation'],
  '2026-02-25'::DATE
),
(
  'Prayer at Transitions',
  'Anchor hard moments with spiritual practice.',
  'Before tests, games, or stressful events, say a simple prayer together: "God, be with [name] today. Give them courage and peace." Acknowledging our limits builds humility and trust.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['faith', 'prayer', 'anxiety', 'support'],
  '2026-02-26'::DATE
),
(
  'Notice and Name Virtues',
  'Catch character in action.',
  'When you see kindness, courage, or honesty, name it: "I saw you share with your friend. That''s generosity." Specific affirmation builds character more than vague praise.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['character', 'virtues', 'faith', 'encouragement'],
  '2026-02-27'::DATE
),
(
  'Sabbath Moments',
  'Practice rest as resistance to hustle culture.',
  'Tonight, declare a 30-minute Sabbath: no work, no screens, no productivity. Light a candle, read, or just sit together. Rest isn''t earned - it''s essential.',
  'connection',
  ARRAY['elementary', 'teen', 'young_adult'],
  ARRAY['faith', 'rest', 'sabbath', 'simplicity'],
  '2026-02-28'::DATE
);

-- BOUNDARIES & DISCIPLINE
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Connection Before Correction',
  'Address behavior after you''ve connected emotionally.',
  'Before addressing misbehavior, get down to eye level, take a breath together, or offer a hug. A connected child is a cooperative child. Discipline without relationship breeds resentment.',
  'behavior',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['discipline', 'connection', 'boundaries', 'attachment'],
  '2026-03-01'::DATE
),
(
  'The Calm-Down Together',
  'Co-regulate instead of isolating them.',
  'When emotions escalate, say: "Let''s take a break together." Sit nearby, breathe slowly, wait. Time-in (with you) teaches regulation. Time-out (alone) can feel like abandonment.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['emotional regulation', 'discipline', 'tantrums', 'co-regulation'],
  '2026-03-02'::DATE
),
(
  'The Boundary Script',
  'Set limits with empathy, not anger.',
  'Say: "I know you want [X]. That''s hard. The answer is still no." Validate the want, hold the boundary. Feelings are always okay; behaviors have limits.',
  'behavior',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['boundaries', 'empathy', 'discipline', 'limits'],
  '2026-03-03'::DATE
);

-- NEURODIVERGENCE & DIFFERENCES
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'Sensory Check-In',
  'Notice what their body needs.',
  'Ask: "Does your body need something right now? More movement? Quiet? A snack?" Teaching body awareness prevents meltdowns. Not all behavior is defiance - sometimes it''s dysregulation.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['sensory', 'neurodivergence', 'self-awareness', 'regulation'],
  '2026-03-04'::DATE
),
(
  'Different, Not Defiant',
  'Curiosity about behavior prevents shame.',
  'When behavior is confusing, ask: "I wonder what''s hard for you right now?" Instead of "Why did you do that?" Investigation builds connection; interrogation builds walls.',
  'behavior',
  ARRAY['elementary', 'teen'],
  ARRAY['neurodivergence', 'empathy', 'connection', 'curiosity'],
  '2026-03-05'::DATE
);

-- TRANSITIONS & ROUTINES
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Transition Song',
  'Make changes predictable and playful.',
  'Create a 30-second song for transitions: "Now it''s time to clean up, clean up, clean up!" Singing activates different brain pathways than nagging. Rhythm reduces resistance.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['transitions', 'routines', 'cooperation', 'play'],
  '2026-03-06'::DATE
),
(
  'Visual Routine Charts',
  'Help them see what''s next.',
  'Take photos of each step of a routine (breakfast, dressed, teeth, shoes). Post them where they can see. Visual cues reduce power struggles - they know what''s expected.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['routines', 'visual supports', 'independence', 'cooperation'],
  '2026-03-07'::DATE
);

-- ADOLESCENCE & IDENTITY
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Identity Mirror',
  'Reflect back who they''re becoming.',
  'Notice something true about who they are: "You really care about fairness" or "You think deeply about things." Teens are forming identity - your observations help them see themselves.',
  'connection',
  ARRAY['teen'],
  ARRAY['identity', 'affirmation', 'adolescence', 'character'],
  '2026-03-08'::DATE
),
(
  'Expect Disrespect, Respond with Respect',
  'Their brain is reorganizing - cut them some slack.',
  'Teen brains are under construction. Disrespect isn''t personal - it''s developmental. Model the tone you want to see, even when they can''t reciprocate yet. This phase ends.',
  'behavior',
  ARRAY['teen'],
  ARRAY['adolescence', 'respect', 'brain development', 'boundaries'],
  '2026-03-09'::DATE
);

-- REAL-LIFE CHALLENGES
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, date) VALUES
(
  'The Snack Before the Talk',
  'Low blood sugar looks like bad behavior.',
  'When they''re grumpy, try food first, questions second. "You seem upset. Want a snack while we talk?" Sometimes a handful of crackers prevents a meltdown.',
  'behavior',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['basic needs', 'self-care', 'practical', 'regulation'],
  '2026-03-10'::DATE
),
(
  'The Early Bedtime Reset',
  'When everything falls apart, try more sleep.',
  'If today was a disaster, try bedtime 30 minutes earlier tonight. Most behavior problems improve with more rest. Sleep is the foundation everything else is built on.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['sleep', 'self-care', 'reset', 'basic needs'],
  '2026-03-11'::DATE
),
(
  'Your Calm is Contagious',
  'You set the emotional temperature of your home.',
  'Before responding to chaos, pause and breathe. Count to 5. Your nervous system regulates theirs. If you escalate, they escalate. If you stay calm, they can find calm.',
  'behavior',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['co-regulation', 'self-care', 'emotional regulation', 'modeling'],
  '2026-03-12'::DATE
);

-- Comment on research-based approach
COMMENT ON TABLE daily_prompts IS 'Research-backed 5-minute parenting activities grounded in attachment theory, neuroscience, and faith-based wisdom';
