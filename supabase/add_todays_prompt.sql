-- Add today's prompt if it doesn't exist
INSERT INTO daily_prompts (title, description, activity, date)
VALUES (
  'Share a Gratitude',
  'Today, focus on expressing gratitude with your child. Gratitude builds positive connections and helps children develop appreciation.',
  'Ask your child: "What made you smile today?" Share your own answer too, and celebrate those moments together.',
  CURRENT_DATE
)
ON CONFLICT (date) DO NOTHING;

-- Also add next 2 days
INSERT INTO daily_prompts (title, description, activity, date)
VALUES (
  'The Question Game',
  'Strengthen your bond through curiosity and active listening. Kids love when parents are genuinely interested in their world.',
  'Take turns asking each other questions. Let your child ask you anything, and you do the same. No topic is off-limits!',
  CURRENT_DATE + INTERVAL '1 day'
)
ON CONFLICT (date) DO NOTHING;

INSERT INTO daily_prompts (title, description, activity, date)
VALUES (
  'Compliment Time',
  'Genuine compliments boost confidence and strengthen relationships. Make your child feel seen and valued.',
  'Give your child a specific compliment about something they did today. Be genuine and detailed about what you noticed.',
  CURRENT_DATE + INTERVAL '2 days'
)
ON CONFLICT (date) DO NOTHING;
