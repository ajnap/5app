# Parenting Assistant Setup

## 🎯 Quick Start

The AI Parenting Assistant is ready to use! Just need to apply the database migration.

## 📦 What's Included

- **ChatGPT-style Interface** at `/assistant`
- **Personalized Context**: Knows about all your children (ages, interests, challenges)
- **Activity Awareness**: References recent completed activities
- **Streaming Responses**: Real-time AI responses
- **Conversation History**: Saves chat sessions

## 🗄️ Database Setup

### Option 1: Supabase Dashboard (Recommended - 2 minutes)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of:
   ```
   supabase/migrations/019_parenting_assistant.sql
   ```
5. Click **Run** to execute

### Option 2: Verify It Worked

After running the migration, go to **Table Editor** and verify you see:
- `assistant_sessions`
- `assistant_messages`

## 🚀 Using the Assistant

1. Navigate to the dashboard
2. Click **✨ Assistant** in the top navigation
3. Start chatting!

### Example Prompts

- "What's a quick activity I can do with [child name] today?"
- "My child is having trouble with transitions. Any advice?"
- "I only have 5 minutes before bed. What can we do?"
- "How can I make dinnertime more connected?"

## 🔧 Technical Details

- **AI Model**: GPT-4o-mini (cost-effective)
- **Streaming**: Server-Sent Events (SSE)
- **Context**: Includes all child profiles + last 10 activities
- **Security**: Row Level Security (RLS) enabled
- **Max Tokens**: 500 per response
- **Temperature**: 0.7 (balanced creativity)

## 💰 Cost Estimate

With your $5 OpenAI budget:
- ~$0.002 per message
- ~2,500 messages total
- ~250-500 conversations

Perfect for demo and initial testing!

## 🐛 Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in
- Check that auth session is valid

### "Failed to send message"
- Verify OpenAI API key is set in `.env.local`
- Check Supabase tables exist
- Look at browser console for errors

### Migration Issues
- Ensure `uuid_generate_v4()` extension is enabled in Supabase
- Check RLS is enabled on your project
- Verify service role key permissions

## 📱 Mobile Responsive

The chat interface is fully responsive and works great on mobile devices!

## Next Steps

Once the assistant is working, we can add:
- Session management (multiple conversations)
- Export chat history
- Activity recommendations directly in chat
- Voice input support
