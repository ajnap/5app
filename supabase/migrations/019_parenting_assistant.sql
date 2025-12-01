-- Parenting Assistant Chat Tables
-- Stores conversation history between parents and the AI assistant

-- Chat sessions for organizing conversations
CREATE TABLE IF NOT EXISTS assistant_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assistant_sessions_user_id
  ON assistant_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_session_id
  ON assistant_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_user_id
  ON assistant_messages(user_id, created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON assistant_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON assistant_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON assistant_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON assistant_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only see their own messages
CREATE POLICY "Users can view own messages"
  ON assistant_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON assistant_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON assistant_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update session timestamp when messages are added
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assistant_sessions
  SET updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session timestamp
CREATE TRIGGER update_session_on_new_message
  AFTER INSERT ON assistant_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_timestamp();
