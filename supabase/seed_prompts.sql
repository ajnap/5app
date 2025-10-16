-- Clear existing prompts (optional - comment out if you want to keep existing ones)
-- DELETE FROM daily_prompts;

-- Insert 30+ high-quality parenting connection prompts
INSERT INTO daily_prompts (title, description, activity, date) VALUES
-- Week 1: Gratitude & Appreciation
('Share a Gratitude', 'Today, focus on expressing gratitude with your child. Gratitude builds positive connections and helps children develop appreciation.', 'Ask your child: "What made you smile today?" Share your own answer too, and celebrate those moments together.', CURRENT_DATE),

('The Compliment Game', 'Genuine compliments boost confidence and strengthen relationships. Make your child feel truly seen and valued.', 'Give your child a specific compliment about something they did today. Be genuine and detailed about what you noticed.', CURRENT_DATE + INTERVAL '1 day'),

('Thank You Notes', 'Expressing appreciation together creates a culture of gratitude in your family.', 'Together, write or draw a thank you note to someone who helped you this week. Talk about why gratitude matters.', CURRENT_DATE + INTERVAL '2 days'),

('Favorite Memory Share', 'Reminiscing together strengthens bonds and creates a sense of belonging.', 'Share a favorite memory you have with your child. Ask them to share one too. What made those moments special?', CURRENT_DATE + INTERVAL '3 days'),

('Appreciation Circle', 'Everyone needs to feel appreciated. This activity makes it fun and memorable.', 'Go around and have each family member say one thing they appreciate about the person next to them.', CURRENT_DATE + INTERVAL '4 days'),

('Superpower Spotlight', 'Every child has unique strengths. Help them recognize and celebrate their own.', 'Ask your child: "If you could have any superpower, what would it be?" Then tell them what superpower you think they already have.', CURRENT_DATE + INTERVAL '5 days'),

('The Best Part', 'End the day on a positive note by focusing on the good moments.', 'At bedtime, ask: "What was the best part of your day?" Share yours too, and try to find the silver lining even in tough days.', CURRENT_DATE + INTERVAL '6 days'),

-- Week 2: Curiosity & Questions
('The Question Game', 'Strengthen your bond through curiosity and active listening. Kids love when parents are genuinely interested in their world.', 'Take turns asking each other questions. Let your child ask you anything, and you do the same. No topic is off-limits!', CURRENT_DATE + INTERVAL '7 days'),

('Dream Big', 'Understanding your child''s dreams helps you support their aspirations.', 'Ask your child: "If you could be anything when you grow up, what would you choose?" Listen without judgment and ask follow-up questions.', CURRENT_DATE + INTERVAL '8 days'),

('The Why Game', 'Curiosity is the foundation of learning. Encourage it today.', 'Let your child ask "why" about anything 5 times in a row. Answer each question thoughtfully, and ask them "why" questions too.', CURRENT_DATE + INTERVAL '9 days'),

('Interview Time', 'Being interviewed makes kids feel important and heard.', 'Pretend to be a reporter interviewing your child about their day, their interests, or their opinions. Use a pretend microphone!', CURRENT_DATE + INTERVAL '10 days'),

('Would You Rather', 'Silly questions can lead to meaningful conversations and lots of laughter.', 'Play "Would You Rather" with age-appropriate choices. Example: "Would you rather fly or be invisible?" Ask why after each answer.', CURRENT_DATE + INTERVAL '11 days'),

('Curiosity Box', 'Create a ritual of wonder and learning together.', 'Find something interesting (a leaf, rock, toy) and explore it together. Ask: What is it? Where did it come from? What could we do with it?', CURRENT_DATE + INTERVAL '12 days'),

('Story Starters', 'Collaborative storytelling sparks creativity and connection.', 'Start a story with "Once upon a time..." and take turns adding one sentence each. See where the story goes!', CURRENT_DATE + INTERVAL '13 days'),

-- Week 3: Emotions & Understanding
('Feelings Check-In', 'Emotional awareness is a crucial life skill. Practice it together.', 'Ask your child to point to how they''re feeling on a scale of 1-10. Ask what would make it a 10. Share your own number too.', CURRENT_DATE + INTERVAL '14 days'),

('The Emotion Game', 'Learning to identify emotions in others builds empathy.', 'Make silly faces showing different emotions (happy, sad, surprised, angry). Have your child guess the emotion and share a time they felt that way.', CURRENT_DATE + INTERVAL '15 days'),

('Comfort Toolkit', 'Help your child develop healthy coping strategies.', 'Ask: "When you feel sad or angry, what helps you feel better?" Create a list together of their personal comfort strategies.', CURRENT_DATE + INTERVAL '16 days'),

('The Listening Game', 'Active listening is a gift. Practice it together.', 'Have your child talk for 2 minutes about anything they want. Your only job: listen without interrupting. Then switch roles.', CURRENT_DATE + INTERVAL '17 days'),

('Worry Box', 'Externalizing worries helps children process them.', 'If your child has worries, write or draw them on paper. Put them in a real or imaginary "worry box" and talk about each one together.', CURRENT_DATE + INTERVAL '18 days'),

('Happy Memories Jar', 'Creating positive anchors helps during difficult times.', 'Write down a happy moment from today on a slip of paper. Keep it in a jar to read when someone needs cheering up.', CURRENT_DATE + INTERVAL '19 days'),

('Feelings Color', 'Abstract expression can help kids understand complex emotions.', 'Ask: "If your feelings today were a color, what would it be?" Use crayons or imagination to express emotions through color.', CURRENT_DATE + INTERVAL '20 days'),

-- Week 4: Connection & Play
('Silly Dance Party', 'Physical play and laughter reduce stress and increase bonding.', 'Put on your child''s favorite song and have a 5-minute dance party. Be silly, laugh, and let loose together!', CURRENT_DATE + INTERVAL '21 days'),

('Special Handshake', 'Creating unique rituals builds intimacy and belonging.', 'Invent a special handshake or high-five that''s just between you two. Use it as your unique greeting.', CURRENT_DATE + INTERVAL '22 days'),

('Build Together', 'Collaborative creation teaches teamwork and problem-solving.', 'Build something together: blocks, pillows, blankets, Legos. Work as a team and celebrate what you create.', CURRENT_DATE + INTERVAL '23 days'),

('Treasure Hunt', 'Adventure and discovery create lasting memories.', 'Hide a small treat or note somewhere in the house. Give your child clues to find it. Make it fun and age-appropriate.', CURRENT_DATE + INTERVAL '24 days'),

('Fort Building', 'Creating a special space together is pure magic for kids.', 'Build a blanket fort together. Sit inside and share stories, read books, or just talk about your day in your special space.', CURRENT_DATE + INTERVAL '25 days'),

('Outside Adventure', 'Nature exploration creates wonder and learning opportunities.', 'Go outside and find 5 interesting things together: a unique leaf, a funny-shaped cloud, an interesting sound. Discuss each discovery.', CURRENT_DATE + INTERVAL '26 days'),

('Role Reversal', 'Seeing the world from each other''s perspective builds empathy.', 'Pretend to switch places for 5 minutes. You''re the kid, they''re the parent. What would they do differently? What did they notice?', CURRENT_DATE + INTERVAL '27 days'),

-- Week 5: Creativity & Expression
('Draw Together', 'Art is a powerful way to express feelings and connect.', 'Each grab paper and crayons. Draw your day, your feelings, or anything you want. Share your drawings and talk about them.', CURRENT_DATE + INTERVAL '28 days'),

('Made-Up Song', 'Creating together is joyful and builds confidence.', 'Make up a silly song about your day or your family. Use a familiar tune or create your own. Sing it together!', CURRENT_DATE + INTERVAL '29 days'),

('Photo Memories', 'Looking at photos together sparks stories and connection.', 'Look through old photos together. Tell stories about when your child was younger. Let them ask questions about the memories.', CURRENT_DATE + INTERVAL '30 days'),

('Letter to Future Self', 'This creates a beautiful time capsule of who your child is today.', 'Help your child write or draw a letter to their future self. What do they want to remember about being this age?', CURRENT_DATE + INTERVAL '31 days'),

('Imagination Journey', 'Guided imagination is calming and creative.', 'Close your eyes together and take an imagination journey. "We''re on a beach..." Take turns adding details to the imaginary adventure.', CURRENT_DATE + INTERVAL '32 days'),

('The Invention Game', 'Creativity and problem-solving are valuable life skills.', 'Ask: "If you could invent anything to help people, what would it be?" Draw it together and talk about how it would work.', CURRENT_DATE + INTERVAL '33 days'),

('Talent Show', 'Everyone loves to perform for an appreciative audience.', 'Let your child put on a talent show. They can sing, dance, do tricks, or showcase any skill. Be their enthusiastic audience!', CURRENT_DATE + INTERVAL '34 days')

ON CONFLICT (date) DO NOTHING;
