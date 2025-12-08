-- LDS-aligned family prompts for faith-based parenting
-- These prompts incorporate LDS values: family, service, scripture, prayer, temple, testimony
-- Each prompt is age-specific to provide truly personalized content

-- First, add more specific faith tags for filtering
-- Update existing faith prompts to include 'lds' tag alongside general faith tags

UPDATE daily_prompts
SET tags = array_append(tags, 'lds')
WHERE tags && ARRAY['faith', 'faith-based', 'christian'];

-- INFANT PROMPTS (0-1 years) - LDS Family Focus
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Lullaby of Love',
  'Sing a Primary song to your baby as part of your bonding routine.',
  'Hold your baby close and softly sing "I Am a Child of God," "Families Can Be Together Forever," or another favorite Primary song. Your voice teaches love and plants seeds of faith, even before they understand the words.',
  'connection',
  ARRAY['infant'],
  ARRAY['faith', 'lds', 'music', 'bonding', 'primary'],
  5,
  '2026-04-01'::DATE
),
(
  'Baby Blessing Moment',
  'Create a peaceful moment of spiritual connection with your little one.',
  'During a quiet moment, hold your baby and whisper simple blessings: "Heavenly Father loves you," "You are a precious spirit," "Our family is forever." This practice nurtures both your spirits.',
  'connection',
  ARRAY['infant'],
  ARRAY['faith', 'lds', 'blessing', 'bonding', 'spiritual'],
  5,
  '2026-04-02'::DATE
);

-- TODDLER PROMPTS (2-4 years) - LDS Values Foundation
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Picture Prayer',
  'Teach your toddler to pray using pictures and simple words.',
  'Sit together and look at a picture of Jesus or your family. Help them say a simple prayer: "Heavenly Father, thank you for [point to something]. Help me be kind. I love Thee. In Jesus'' name, Amen." Keep it short and sweet.',
  'connection',
  ARRAY['toddler'],
  ARRAY['faith', 'lds', 'prayer', 'teaching'],
  5,
  '2026-04-03'::DATE
),
(
  'Helping Hands',
  'Practice service together with a simple act of kindness.',
  'Ask: "What can we do to help someone today?" Pick something small together: make a card for grandma, pick up toys for a sibling, or put out food for birds. Say: "When we help others, we''re being like Jesus."',
  'connection',
  ARRAY['toddler'],
  ARRAY['faith', 'lds', 'service', 'kindness', 'teaching'],
  5,
  '2026-04-04'::DATE
),
(
  'Primary Song Time',
  'Sing and move together with a favorite Primary song.',
  'Choose an action song like "Popcorn Popping," "Head, Shoulders, Knees, and Toes" (church version), or "If You''re Happy and You Know It." Singing together creates joy and teaches gospel truths naturally.',
  'connection',
  ARRAY['toddler'],
  ARRAY['faith', 'lds', 'music', 'primary', 'movement'],
  5,
  '2026-04-05'::DATE
),
(
  'Toddler Testimony',
  'Help your little one express simple beliefs.',
  'Ask questions they can answer: "Who loves you?" (Heavenly Father, Jesus, Mommy, Daddy). "Who made the flowers/sun/trees?" Practice saying "I know..." statements together. Their simple words are powerful.',
  'connection',
  ARRAY['toddler'],
  ARRAY['faith', 'lds', 'testimony', 'teaching'],
  5,
  '2026-04-06'::DATE
);

-- ELEMENTARY PROMPTS (5-11 years) - Building Testimony
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Scripture Hero Story',
  'Share a Book of Mormon story at their level.',
  'Tell the story of Nephi building the ship, Abinadi''s courage, or the stripling warriors. Ask: "What would you do?" and "How can we be brave like them?" Stories teach principles better than lectures.',
  'learning',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'scripture', 'book of mormon', 'teaching'],
  5,
  '2026-04-07'::DATE
),
(
  'Secret Service Mission',
  'Plan a surprise act of kindness together.',
  'Ask: "Who could use some extra love today?" Plan a secret service together: leave a note for Dad, make a sibling''s bed, draw a picture for a neighbor. Keep it secret and talk about how it feels to serve.',
  'connection',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'service', 'kindness', 'family'],
  5,
  '2026-04-08'::DATE
),
(
  'Gospel Questions',
  'Create a safe space for their spiritual questions.',
  'Ask: "Is there anything about church or Heavenly Father you wonder about?" Listen without judgment. Say: "That''s a great question. Let''s learn about it together." Questions are signs of growing faith.',
  'connection',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'testimony', 'teaching', 'communication'],
  5,
  '2026-04-09'::DATE
),
(
  'Family Prayer Focus',
  'Make family prayer more meaningful tonight.',
  'Before prayer, ask each person: "What''s one thing you want to thank Heavenly Father for? One thing you need help with?" Include everyone''s answers in the prayer. This teaches them their voice matters to God.',
  'connection',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'prayer', 'family', 'gratitude'],
  5,
  '2026-04-10'::DATE
),
(
  'Temple Talk',
  'Share your feelings about the temple in age-appropriate ways.',
  'Look at a picture of the temple together. Share why it''s special to you. Ask what they notice about it. For baptized children: talk about doing baptisms for ancestors who are waiting.',
  'connection',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'temple', 'family history', 'teaching'],
  5,
  '2026-04-11'::DATE
),
(
  'FHE Mini Lesson',
  'Have a quick family home evening moment any night of the week.',
  'Pick one topic: kindness, honesty, forgiveness, or gratitude. Share a 1-minute thought, ask one question, and say a prayer together. FHE doesn''t have to be elaborate to be powerful.',
  'connection',
  ARRAY['elementary'],
  ARRAY['faith', 'lds', 'fhe', 'family', 'teaching'],
  5,
  '2026-04-12'::DATE
);

-- TEEN PROMPTS (12-17 years) - Testimony & Identity
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Come Follow Me Chat',
  'Connect scripture study to their real life.',
  'Ask: "What did you read in Come Follow Me this week? Did anything stand out?" If they haven''t read: "Want to read a few verses together?" Keep it casual - driving or doing dishes works great.',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'scripture', 'come follow me', 'teaching'],
  5,
  '2026-04-13'::DATE
),
(
  'Standards Support',
  'Talk about living gospel standards without lecturing.',
  'Ask: "How''s it going keeping your standards at school? Is anything hard right now?" Listen first. Share your own challenges at their age. End with: "I''m proud of you for trying."',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'standards', 'for the strength of youth', 'support'],
  5,
  '2026-04-14'::DATE
),
(
  'Priesthood/YW Purpose',
  'Talk about their church responsibilities and growth.',
  'Ask about their quorum or class: "What are you working on? How can I support you?" For young men: "How do you feel about holding the priesthood?" For young women: "What values are you focused on?"',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'youth', 'priesthood', 'young women'],
  5,
  '2026-04-15'::DATE
),
(
  'Mission Thoughts',
  'Have an open conversation about future service.',
  'Ask (without pressure): "Have you thought about serving a mission? What excites or worries you about it?" Listen without correcting. Share your own feelings or experiences with service.',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'mission', 'future', 'goals'],
  5,
  '2026-04-16'::DATE
),
(
  'Testimony Moment',
  'Share your testimony in a natural, personal way.',
  'Find a quiet moment and share something you believe: "I want you to know I really believe..." or "Something that helps me is..." Keep it simple and personal. Invite them to share if they want.',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'testimony', 'spiritual', 'bonding'],
  5,
  '2026-04-17'::DATE
),
(
  'Hard Questions Safe Space',
  'Create space for doubts and questions about faith.',
  'Say: "I know sometimes church stuff can be confusing. You can always ask me anything - even the hard questions." Don''t feel pressure to have all answers. Searching together builds faith.',
  'connection',
  ARRAY['teen'],
  ARRAY['faith', 'lds', 'questions', 'doubts', 'support'],
  5,
  '2026-04-18'::DATE
);

-- YOUNG ADULT PROMPTS (18+ years) - Adult Faith Transition
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Faith Journey Check-In',
  'Connect about their personal spiritual path.',
  'Ask: "How''s your relationship with Heavenly Father these days? What''s working for you spiritually?" Listen without fixing. Their faith journey is theirs - you''re a supportive companion, not a director.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['faith', 'lds', 'testimony', 'spiritual', 'adult relationship'],
  5,
  '2026-04-19'::DATE
),
(
  'Temple or Church Support',
  'Offer support without pressure.',
  'If they''re active: "Want to go to the temple together sometime?" If they''re less active: "I love you no matter what. Our relationship isn''t conditional on church attendance." Both need to hear your love.',
  'connection',
  ARRAY['young_adult'],
  ARRAY['faith', 'lds', 'temple', 'support', 'unconditional love'],
  5,
  '2026-04-20'::DATE
);

-- MULTI-AGE LDS PROMPTS - Family Focus
INSERT INTO daily_prompts (title, description, activity, category, age_categories, tags, estimated_minutes, date) VALUES
(
  'Gratitude Prayer',
  'Focus family prayer on gratitude tonight.',
  'Before prayer, go around and share one blessing each person is grateful for. Then offer a prayer focused on thanking Heavenly Father. Gratitude changes how we see our lives.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen'],
  ARRAY['faith', 'lds', 'prayer', 'gratitude', 'family'],
  5,
  '2026-04-21'::DATE
),
(
  'Sunday Family Time',
  'Make the Sabbath meaningful with a simple family activity.',
  'After church, do something that brings your family closer: bake treats for a neighbor, write in journals, call grandparents, or take a family walk. Sabbath is for family connection.',
  'connection',
  ARRAY['elementary', 'teen'],
  ARRAY['faith', 'lds', 'sabbath', 'family', 'quality time'],
  5,
  '2026-04-22'::DATE
),
(
  'Family History Moment',
  'Connect your children to their ancestors.',
  'Share one story about a grandparent, great-grandparent, or ancestor. Show a photo if you have one. Say: "You come from people who [quality]. That''s part of who you are."',
  'connection',
  ARRAY['elementary', 'teen', 'young_adult'],
  ARRAY['faith', 'lds', 'family history', 'ancestors', 'identity'],
  5,
  '2026-04-23'::DATE
),
(
  'Conference Highlight',
  'Discuss something from recent General Conference.',
  'Ask: "Did anything from Conference stick with you?" or share something that touched you. For younger kids: "A prophet taught us that..." Keep it to one simple message.',
  'connection',
  ARRAY['elementary', 'teen', 'young_adult'],
  ARRAY['faith', 'lds', 'general conference', 'prophet', 'teaching'],
  5,
  '2026-04-24'::DATE
),
(
  'Eternal Family Reminder',
  'Reinforce your forever family bond.',
  'During a calm moment, say: "I''m so grateful our family can be together forever. I love being your parent." Physical affection (hug, hand on shoulder) makes the words sink deeper.',
  'connection',
  ARRAY['toddler', 'elementary', 'teen', 'young_adult'],
  ARRAY['faith', 'lds', 'eternal family', 'sealing', 'love'],
  5,
  '2026-04-25'::DATE
);

-- Update faith_mode to better support LDS-specific content
-- Add a comment explaining the tag hierarchy
COMMENT ON COLUMN daily_prompts.tags IS 'Tags for filtering: General faith tags include "faith", "faith-based", "christian". LDS-specific prompts additionally include "lds" tag. Other tags describe topics like "prayer", "scripture", "service", etc.';

-- Create index for faster LDS tag queries
CREATE INDEX IF NOT EXISTS idx_daily_prompts_lds_tag ON daily_prompts USING GIN(tags) WHERE tags && ARRAY['lds'];
