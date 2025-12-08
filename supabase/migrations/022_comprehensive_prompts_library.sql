-- Comprehensive 5-minute connection prompts library
-- Research-based activities grounded in attachment theory, positive parenting, and developmental psychology
-- Appropriate for all families including religious households
-- Focus: Quick, actionable, daily connection moments

-- =====================================================
-- INFANT PROMPTS (0-1 years) - Building Secure Attachment
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
-- Connection & Bonding
(
  'Mirror Play',
  'Babies love seeing faces - especially yours.',
  'Hold baby in front of a mirror together. Point to their reflection: "Who''s that? That''s YOU!" Make silly faces together. Watch their eyes track movement. This builds self-recognition and joy.',
  'connection',
  ARRAY['infant'],
  ARRAY['bonding', 'development', 'play'],
  5,
  '2026-05-01'::DATE
),
(
  'Narrate Your Day',
  'Your voice is your baby''s favorite sound.',
  'As you do simple tasks, narrate everything: "Now we''re opening the fridge. Brrr, it''s cold! Let''s get some milk." This builds language pathways and keeps baby connected to you.',
  'connection',
  ARRAY['infant'],
  ARRAY['language', 'bonding', 'development'],
  5,
  '2026-05-02'::DATE
),
(
  'Skin-to-Skin Time',
  'Physical closeness regulates baby''s nervous system.',
  'Remove baby''s clothes (except diaper) and hold them against your bare chest. Cover with a blanket. Breathe slowly. This calms both of you and strengthens attachment bonds.',
  'connection',
  ARRAY['infant'],
  ARRAY['bonding', 'attachment', 'calm'],
  5,
  '2026-05-03'::DATE
),
(
  'Follow Their Gaze',
  'Enter your baby''s world of wonder.',
  'Watch where baby looks and follow their gaze. "Oh, you see the light! Yes, that''s bright!" This teaches them their interests matter to you - the foundation of feeling seen.',
  'connection',
  ARRAY['infant'],
  ARRAY['bonding', 'attention', 'responsiveness'],
  5,
  '2026-05-04'::DATE
),
(
  'Gentle Massage',
  'Touch communicates love before words can.',
  'After bath or diaper change, gently massage baby''s legs, arms, and tummy with lotion. Talk softly as you go. This releases oxytocin for both of you.',
  'connection',
  ARRAY['infant'],
  ARRAY['bonding', 'touch', 'calm'],
  5,
  '2026-05-05'::DATE
),
(
  'Peek-a-Boo Variations',
  'The classic game builds trust and joy.',
  'Play peek-a-boo with different objects: hide behind a blanket, a book, your hands, or around a corner. Each reveal brings delight and teaches object permanence.',
  'connection',
  ARRAY['infant'],
  ARRAY['play', 'bonding', 'development'],
  5,
  '2026-05-06'::DATE
),
(
  'Dance Together',
  'Movement and music create joy.',
  'Hold baby securely and sway to music - any music you love. Sing along. They feel your heartbeat, hear your voice, and sense your happiness.',
  'connection',
  ARRAY['infant'],
  ARRAY['music', 'movement', 'bonding'],
  5,
  '2026-05-07'::DATE
),
(
  'Face-to-Face Time',
  'Your face is the most interesting thing in their world.',
  'Lie down with baby on your chest, face to face. Make expressions slowly: smile, surprise, silly. Give them time to study and respond. This is baby''s favorite TV show.',
  'connection',
  ARRAY['infant'],
  ARRAY['bonding', 'development', 'attention'],
  5,
  '2026-05-08'::DATE
);

-- =====================================================
-- TODDLER PROMPTS (2-4 years) - Building Independence & Connection
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
-- Connection Activities
(
  'The Yes Game',
  'Say yes to everything safe for 5 minutes.',
  '"Can we jump on the bed?" YES! "Can we eat crackers in the living room?" YES! "Can we roar like lions?" YES! This fills their need for autonomy and creates pure joy together.',
  'connection',
  ARRAY['toddler'],
  ARRAY['play', 'autonomy', 'fun'],
  5,
  '2026-05-09'::DATE
),
(
  'Build a Fort',
  'Create a cozy world together.',
  'Drape a blanket over chairs or a table. Crawl inside together with a flashlight and a book. This small adventure creates big memories.',
  'connection',
  ARRAY['toddler'],
  ARRAY['play', 'creativity', 'bonding'],
  5,
  '2026-05-10'::DATE
),
(
  'Animal Walk Race',
  'Move your bodies and giggle together.',
  'Race across the room walking like different animals: waddle like penguins, hop like frogs, stomp like elephants. Physical play releases energy and connects you.',
  'connection',
  ARRAY['toddler'],
  ARRAY['movement', 'play', 'energy release'],
  5,
  '2026-05-11'::DATE
),
(
  'Color Hunt',
  'Turn observation into a game.',
  'Pick a color: "Let''s find everything BLUE!" Walk through the house or yard together pointing out blue things. Celebrate each discovery. This builds focus and teamwork.',
  'connection',
  ARRAY['toddler'],
  ARRAY['learning', 'play', 'observation'],
  5,
  '2026-05-12'::DATE
),
(
  'Kitchen Helper',
  'Include them in real life.',
  'Let them help with one simple task: washing vegetables, stirring batter, putting napkins on the table. It takes longer, but competence and connection are worth it.',
  'connection',
  ARRAY['toddler'],
  ARRAY['life skills', 'inclusion', 'competence'],
  5,
  '2026-05-13'::DATE
),
(
  'Story Swap',
  'Let them "read" to you.',
  'Hand them a familiar book and say: "Your turn to read to me!" Listen as they tell the story their way. Ask questions. Their version might be better.',
  'connection',
  ARRAY['toddler'],
  ARRAY['reading', 'imagination', 'confidence'],
  5,
  '2026-05-14'::DATE
),
(
  'Feelings Check',
  'Name emotions to tame them.',
  'At a calm moment, look at pictures of faces (in books or on your phone). Name the feelings: "She looks happy! He looks sad." Ask: "How do you feel right now?"',
  'connection',
  ARRAY['toddler'],
  ARRAY['emotions', 'vocabulary', 'awareness'],
  5,
  '2026-05-15'::DATE
),
(
  'I Spy in the House',
  'Make home an adventure.',
  '"I spy something... round!" Take turns giving clues and guessing. This builds observation, patience, and turn-taking - all while laughing together.',
  'connection',
  ARRAY['toddler'],
  ARRAY['play', 'observation', 'language'],
  5,
  '2026-05-16'::DATE
),
-- Behavior Support
(
  'The When/Then Deal',
  'Structure creates cooperation.',
  'Instead of bribes, use when/then: "WHEN you put on shoes, THEN we can go outside." "WHEN we clean up blocks, THEN we''ll read a book." Predictability reduces resistance.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['cooperation', 'structure', 'transitions'],
  5,
  '2026-05-17'::DATE
),
(
  'Big Feelings Corner',
  'Create a regulation spot together.',
  'Set up a cozy corner with soft items: pillows, stuffed animals, books about feelings. Say: "When feelings get too big, this is our calm-down spot. Let''s try it together."',
  'behavior',
  ARRAY['toddler'],
  ARRAY['emotions', 'regulation', 'tools'],
  5,
  '2026-05-18'::DATE
),
(
  'First/Then Board',
  'Visual routines reduce battles.',
  'Draw or print simple pictures for morning routine: potty, clothes, breakfast. Post them where they can see. Let them move/check off each step. Visuals work better than words.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['routines', 'visual', 'cooperation'],
  5,
  '2026-05-19'::DATE
),
(
  'The Choices Game',
  'Autonomy prevents power struggles.',
  'Offer two acceptable choices: "Red cup or blue cup?" "Walk to the car or hop to the car?" "Brush teeth first or wash face first?" They control the HOW, you control the WHAT.',
  'behavior',
  ARRAY['toddler'],
  ARRAY['autonomy', 'cooperation', 'choices'],
  5,
  '2026-05-20'::DATE
);

-- =====================================================
-- ELEMENTARY PROMPTS (5-11 years) - Building Confidence & Connection
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
-- Connection Activities
(
  'Would You Rather',
  'Silly questions spark real conversation.',
  'Take turns asking "Would you rather..." questions: "Would you rather fly or be invisible?" "Would you rather eat only pizza or only tacos forever?" Laughter leads to deeper talks.',
  'connection',
  ARRAY['elementary'],
  ARRAY['conversation', 'fun', 'bonding'],
  5,
  '2026-05-21'::DATE
),
(
  'High/Low/Hero',
  'A better way to debrief the day.',
  'At dinner or bedtime, each person shares: HIGH (best part), LOW (hardest part), HERO (someone who helped you). This creates emotional vocabulary and genuine sharing.',
  'connection',
  ARRAY['elementary'],
  ARRAY['conversation', 'emotions', 'sharing'],
  5,
  '2026-05-22'::DATE
),
(
  'Secret Handshake',
  'Create something only you two share.',
  'Work together to invent a special handshake with multiple moves: fist bump, snap, high five, wiggle fingers. Practice until it''s smooth. Use it as your special greeting.',
  'connection',
  ARRAY['elementary'],
  ARRAY['bonding', 'fun', 'ritual'],
  5,
  '2026-05-23'::DATE
),
(
  'Teach Me Something',
  'Let them be the expert.',
  'Ask: "What''s something you know that I don''t? Teach me!" It could be a video game trick, a sports move, a fact about dinosaurs. Your genuine curiosity builds their confidence.',
  'connection',
  ARRAY['elementary'],
  ARRAY['confidence', 'respect', 'learning'],
  5,
  '2026-05-24'::DATE
),
(
  'Memory Lane',
  'Reminisce together.',
  'Look at old photos together - baby pictures, past vacations, younger birthdays. Tell stories: "Remember when you..." Shared history strengthens bonds.',
  'connection',
  ARRAY['elementary'],
  ARRAY['memories', 'bonding', 'identity'],
  5,
  '2026-05-25'::DATE
),
(
  'Walk and Talk',
  'Movement opens mouths.',
  'Take a short walk around the block together. Side-by-side movement makes talking easier. No agenda - just walk and see what comes up.',
  'connection',
  ARRAY['elementary'],
  ARRAY['conversation', 'movement', 'one-on-one'],
  5,
  '2026-05-26'::DATE
),
(
  'Compliment Catch',
  'Positive words wrapped in play.',
  'Toss a ball back and forth. Each catch comes with a compliment: "You''re a good friend." "You try hard at school." "You make me laugh." Fill their bucket with truth.',
  'connection',
  ARRAY['elementary'],
  ARRAY['affirmation', 'play', 'encouragement'],
  5,
  '2026-05-27'::DATE
),
(
  'The Dream Question',
  'Show interest in their inner world.',
  'Ask: "If you could do anything tomorrow - no rules, no limits - what would you do?" Listen without editing. Their dreams reveal their hearts.',
  'connection',
  ARRAY['elementary'],
  ARRAY['conversation', 'dreams', 'listening'],
  5,
  '2026-05-28'::DATE
),
(
  'Card Game Challenge',
  'Simple games build connection.',
  'Play one quick round of Go Fish, War, or Uno. The game matters less than the time together. Laugh, compete gently, enjoy each other.',
  'connection',
  ARRAY['elementary'],
  ARRAY['play', 'games', 'fun'],
  5,
  '2026-05-29'::DATE
),
(
  'Joke Time',
  'Laughter is connection medicine.',
  'Share jokes back and forth. Look up kid jokes if you need them. Even terrible jokes create joy. "Why did the cookie go to the doctor? Because it was feeling crummy!"',
  'connection',
  ARRAY['elementary'],
  ARRAY['humor', 'bonding', 'joy'],
  5,
  '2026-05-30'::DATE
),
-- Learning & Growth
(
  'Struggle Story',
  'Normalize difficulty.',
  'Tell them about something YOU struggled to learn: riding a bike, math, a work skill. Show that struggle is part of growth. Ask about something they''re working hard on.',
  'learning',
  ARRAY['elementary'],
  ARRAY['growth mindset', 'vulnerability', 'connection'],
  5,
  '2026-05-31'::DATE
),
(
  'Curiosity Question',
  'Wonder together.',
  'Ask: "What''s something you wonder about?" Then wonder with them: "I wonder that too! Let''s find out someday." Or: "What do YOU think the answer is?" Curiosity beats answers.',
  'learning',
  ARRAY['elementary'],
  ARRAY['curiosity', 'conversation', 'wonder'],
  5,
  '2026-06-01'::DATE
),
-- Behavior Support
(
  'Problem-Solving Partner',
  'Help them think through challenges.',
  'When they have a problem, ask: "What have you tried? What could you try next?" Resist solving it for them. Your confidence in their ability builds their confidence.',
  'behavior',
  ARRAY['elementary'],
  ARRAY['problem solving', 'confidence', 'support'],
  5,
  '2026-06-02'::DATE
),
(
  'Responsibility Check-In',
  'Celebrate what they''re handling.',
  'Notice something they''re doing independently: making their bed, remembering homework, being kind to siblings. Say: "I noticed you [specific thing]. That''s responsible."',
  'behavior',
  ARRAY['elementary'],
  ARRAY['responsibility', 'affirmation', 'growth'],
  5,
  '2026-06-03'::DATE
),
(
  'The Do-Over Offer',
  'Give second chances gracefully.',
  'After a rough moment, say: "That didn''t go great. Want a do-over?" Let them try the situation again. Practice builds skill better than punishment.',
  'behavior',
  ARRAY['elementary'],
  ARRAY['grace', 'practice', 'behavior'],
  5,
  '2026-06-04'::DATE
);

-- =====================================================
-- TEEN PROMPTS (12-17 years) - Maintaining Connection Through Change
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
-- Connection Activities
(
  'Ask Their Opinion',
  'Treat them like the emerging adult they are.',
  'Ask about something real: "What do you think about [news topic]?" "How would you handle [situation]?" Listen without correcting. Their opinions are forming - be part of that.',
  'connection',
  ARRAY['teen'],
  ARRAY['respect', 'conversation', 'opinions'],
  5,
  '2026-06-05'::DATE
),
(
  'Music Share',
  'Enter their world through their ears.',
  'Ask them to play you a song they like. Really listen. Ask what they like about it. Then share one of yours. Music bridges generations.',
  'connection',
  ARRAY['teen'],
  ARRAY['music', 'interests', 'sharing'],
  5,
  '2026-06-06'::DATE
),
(
  'The Stress Check',
  'Acknowledge their real pressures.',
  'Say: "Being a teenager seems really hard sometimes. What''s stressing you out lately?" Don''t minimize or fix - just witness. Feeling understood matters more than solutions.',
  'connection',
  ARRAY['teen'],
  ARRAY['stress', 'empathy', 'support'],
  5,
  '2026-06-07'::DATE
),
(
  'Parallel Activity',
  'Be together without agenda.',
  'Do something near each other: you read while they scroll, you cook while they do homework. Proximity without pressure. Sometimes they''ll start talking when there''s no expectation to.',
  'connection',
  ARRAY['teen'],
  ARRAY['presence', 'availability', 'low pressure'],
  5,
  '2026-06-08'::DATE
),
(
  'Future Dreams',
  'Talk about what''s ahead.',
  'Ask: "What are you excited about for the future? What worries you about it?" Listen to both. Your presence in their future planning says you believe in them.',
  'connection',
  ARRAY['teen'],
  ARRAY['future', 'hopes', 'conversation'],
  5,
  '2026-06-09'::DATE
),
(
  'Genuine Compliment',
  'Name what you see in them.',
  'Give one specific, genuine compliment about their character: "I noticed how you handled that conflict with your friend. You were really mature." Specific beats generic.',
  'connection',
  ARRAY['teen'],
  ARRAY['affirmation', 'character', 'encouragement'],
  5,
  '2026-06-10'::DATE
),
(
  'Friendship Check',
  'Show interest in their social world.',
  'Ask about their friends - not interrogating, but curious: "How''s [friend name] doing?" "Who do you eat lunch with?" "Anyone new you''ve been hanging out with?"',
  'connection',
  ARRAY['teen'],
  ARRAY['friends', 'social', 'interest'],
  5,
  '2026-06-11'::DATE
),
(
  'The Apology',
  'Model accountability.',
  'If you''ve been too harsh, too busy, or unfair lately, apologize specifically: "I''m sorry I''ve been short with you this week. You deserve better. I''m working on it."',
  'connection',
  ARRAY['teen'],
  ARRAY['modeling', 'repair', 'humility'],
  5,
  '2026-06-12'::DATE
),
(
  'Send a Text',
  'Meet them on their turf.',
  'Send a random text during the day: "Just thinking about you. Hope your day is going okay." Not asking for anything, just connecting. They might not reply, but they''ll read it.',
  'connection',
  ARRAY['teen'],
  ARRAY['communication', 'technology', 'presence'],
  5,
  '2026-06-13'::DATE
),
(
  'Car Time',
  'Use the drive.',
  'Car rides are golden - no eye contact pressure, no escape, natural time limit. Ask one question and let silence be okay. Some of the best talks happen in transit.',
  'connection',
  ARRAY['teen'],
  ARRAY['conversation', 'opportunity', 'one-on-one'],
  5,
  '2026-06-14'::DATE
),
-- Support & Guidance
(
  'Decision Consult',
  'Ask before advising.',
  'When they share a problem, ask: "Do you want me to just listen, or do you want suggestions?" Respecting their preference teaches them to ask for what they need.',
  'connection',
  ARRAY['teen'],
  ARRAY['respect', 'support', 'autonomy'],
  5,
  '2026-06-15'::DATE
),
(
  'Identity Affirmation',
  'Reflect who they''re becoming.',
  'Notice something about who they are: "You''re someone who really cares about fairness." "You think deeply about things." Help them see their emerging identity.',
  'connection',
  ARRAY['teen'],
  ARRAY['identity', 'affirmation', 'character'],
  5,
  '2026-06-16'::DATE
),
(
  'Boundary Conversation',
  'Talk about limits with respect.',
  'When setting a boundary, explain your WHY: "I''m saying no to the late party because your safety matters more to me than your happiness in this moment. I know that''s frustrating."',
  'behavior',
  ARRAY['teen'],
  ARRAY['boundaries', 'communication', 'respect'],
  5,
  '2026-06-17'::DATE
);

-- =====================================================
-- YOUNG ADULT PROMPTS (18+ years) - Transitioning Relationship
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Advisor Mode',
  'Offer wisdom only when invited.',
  'Ask: "Would you like my thoughts on this, or do you just need to vent?" Their answer tells you what they need. Respect it. Your opinion isn''t always wanted - and that''s healthy.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['respect', 'boundaries', 'support'],
  5,
  '2026-06-18'::DATE
),
(
  'Life Update',
  'Share your life too.',
  'Don''t just ask about them - share something from your own life. Adult relationships are mutual. Let them into your world as you enter theirs.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['mutuality', 'sharing', 'adult relationship'],
  5,
  '2026-06-19'::DATE
),
(
  'Celebrate Adulting',
  'Notice their growth.',
  'Acknowledge something adult they''re handling: paying bills, managing conflict, making hard decisions. "I''m proud of how you''re handling [specific thing]."',
  'connection',
  ARRAY['young_adult'],
  ARRAY['affirmation', 'growth', 'pride'],
  5,
  '2026-06-20'::DATE
),
(
  'The Standing Invitation',
  'Keep the door open.',
  'Say: "You''re always welcome - for dinner, to crash, to talk, whatever. No judgment." Young adults need to know they can come back without shame.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['safety', 'availability', 'unconditional'],
  5,
  '2026-06-21'::DATE
);

-- =====================================================
-- MULTI-AGE PROMPTS - Work Across Age Groups
-- =====================================================

INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
-- Daily Rituals
(
  'The Goodbye Ritual',
  'Make departures meaningful.',
  'Before they leave (school, activity, bed), give a hug and say something specific: "Have fun at practice!" or "I''ll be thinking about your test." Rituals create security.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['ritual', 'transitions', 'security'],
  5,
  '2026-06-22'::DATE
),
(
  'The Welcome Home',
  'Make returns meaningful too.',
  'When they come home, pause what you''re doing. Look at them. Smile. "Hey! I''m glad you''re home." Ten seconds of full attention beats distracted hours.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['ritual', 'attention', 'welcome'],
  5,
  '2026-06-23'::DATE
),
(
  'Bedtime Connection',
  'End every day connected.',
  'Whatever the day held, end it with love: a hug, an "I love you," a moment of presence. Kids shouldn''t fall asleep wondering where they stand with you.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['bedtime', 'ritual', 'love'],
  5,
  '2026-06-24'::DATE
),
(
  'The Three Blessings',
  'End the day with gratitude.',
  'At bedtime, each share three good things from today - tiny or huge. "My sandwich was good." "I made a goal." "You picked me up on time." Gratitude rewires brains.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['gratitude', 'bedtime', 'positive'],
  5,
  '2026-06-25'::DATE
),
-- Physical Connection
(
  '20-Second Hug',
  'A real hug releases oxytocin.',
  'Give them a hug and hold it for 20 seconds (count silently). It might feel awkward at first, but the hormone release is real. Bodies remember safety.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['touch', 'bonding', 'comfort'],
  5,
  '2026-06-26'::DATE
),
(
  'Shoulder Pat',
  'Physical presence in passing.',
  'As you pass them today, give a quick shoulder squeeze, back pat, or hair tousle. Brief physical touch communicates connection without interrupting what they''re doing.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['touch', 'presence', 'brief'],
  5,
  '2026-06-27'::DATE
),
-- Quality Time
(
  'Five Minutes of Whatever',
  'Let them choose the activity.',
  'Say: "You have my full attention for 5 minutes. What do you want to do together?" Then do it - fully present, no phone, no multi-tasking.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['choice', 'attention', 'presence'],
  5,
  '2026-06-28'::DATE
),
(
  'One-on-One Date',
  'Individual attention matters.',
  'If you have multiple kids, spend 5 minutes alone with just one today. Do something they choose. Undivided attention fills their tank.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['one-on-one', 'attention', 'sibling'],
  5,
  '2026-06-29'::DATE
),
-- Emotional Support
(
  'The Witness',
  'Sometimes presence is enough.',
  'When they''re upset, resist fixing. Say: "I''m here" and sit with them. You don''t need to solve their problem. Your calm presence IS the help.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['emotions', 'presence', 'support'],
  5,
  '2026-06-30'::DATE
),
(
  'Name the Feeling',
  'Help them identify emotions.',
  'When you notice a mood, gently name it: "You seem frustrated" or "That looks like disappointment." If you''re wrong, they''ll correct you - and that''s still connection.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['emotions', 'vocabulary', 'attunement'],
  5,
  '2026-07-01'::DATE
),
(
  'The Validation',
  'Feelings are always valid.',
  'When they share something hard, say: "That sounds really tough" or "I understand why you feel that way." Validation doesn''t mean agreement - it means seeing them.',
  'connection',
  ARRAY['elementary', 'teen', 'young_adult'],
  ARRAY['validation', 'emotions', 'listening'],
  5,
  '2026-07-02'::DATE
),
-- Everyday Moments
(
  'Meal Together',
  'Eat at the same table, no screens.',
  'Have one meal together with devices away. It doesn''t have to be dinner. It doesn''t have to be long. Presence over perfection.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['mealtime', 'presence', 'family'],
  5,
  '2026-07-03'::DATE
),
(
  'Car Karaoke',
  'Sing together on the drive.',
  'Put on music everyone knows and sing together - badly, loudly, joyfully. Shared silliness is bonding glue.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['music', 'fun', 'car'],
  5,
  '2026-07-04'::DATE
),
(
  'Nature Moment',
  'Step outside together.',
  'Go outside for 5 minutes. Notice something in nature together: clouds, birds, a bug, the wind. Slow observation creates shared wonder.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['nature', 'observation', 'calm'],
  5,
  '2026-07-05'::DATE
),
-- Affirmation & Encouragement
(
  'The Note',
  'Write what you might not say.',
  'Write a short note and leave it where they''ll find it: lunchbox, pillow, backpack. "I''m proud of you." "You matter." "Have a great day." Written words last.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['affirmation', 'surprise', 'written'],
  5,
  '2026-07-06'::DATE
),
(
  'Specific Praise',
  'Notice the details.',
  'Give one piece of specific praise: not "Good job!" but "I noticed how patient you were with your sister." Specific praise builds specific confidence.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['praise', 'encouragement', 'specific'],
  5,
  '2026-07-07'::DATE
),
(
  'Character Callout',
  'Name their good qualities.',
  'Tell them something true about who they are: "You''re brave." "You''re creative." "You''re kind." Identity statements shape identity.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['identity', 'character', 'affirmation'],
  5,
  '2026-07-08'::DATE
),
(
  'The I Love You',
  'Say it. Out loud. Today.',
  'Tell them "I love you" today - not in passing, but looking at them, meaning it. Some families say it often; some rarely. Either way, say it today.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen', 'young_adult'],
  ARRAY['love', 'verbal', 'affirmation'],
  5,
  '2026-07-09'::DATE
),
-- Co-Regulation & Support
(
  'The Calm Down Together',
  'Regulate with them, not at them.',
  'When they''re escalated, don''t send them away. Say: "Let''s breathe together" and take slow breaths. Your calm is contagious. Co-regulation teaches self-regulation.',
  'behavior',
  ARRAY['toddler', 'elementary'],
  ARRAY['co-regulation', 'calm', 'emotions'],
  5,
  '2026-07-10'::DATE
),
(
  'After the Storm',
  'Reconnect after conflict.',
  'After a hard moment, circle back when everyone''s calm. "That was rough. Are we okay?" Repair matters more than the rupture.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['repair', 'conflict', 'reconnection'],
  5,
  '2026-07-11'::DATE
);

-- Add more variety tags for better filtering
UPDATE daily_prompts SET estimated_minutes = 5 WHERE estimated_minutes IS NULL;

-- Add comment explaining the prompt philosophy
COMMENT ON TABLE daily_prompts IS 'Research-based 5-minute connection activities. Philosophy: Small, consistent connection moments matter more than grand gestures. Every child needs to feel seen, heard, and loved daily.';
