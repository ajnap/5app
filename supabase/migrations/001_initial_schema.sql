-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create daily_prompts table
CREATE TABLE IF NOT EXISTS daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for daily_prompts
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;

-- Create policy: All authenticated users can read prompts
CREATE POLICY "Authenticated users can view prompts"
  ON daily_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample daily prompts
INSERT INTO daily_prompts (title, description, activity, date) VALUES
  (
    'Share a Gratitude',
    'Today, focus on expressing gratitude with your child. Gratitude builds positive connections and helps children develop appreciation.',
    'Ask your child: "What made you smile today?" Share your own answer too, and celebrate those moments together.',
    CURRENT_DATE
  ),
  (
    'The Question Game',
    'Strengthen your bond through curiosity and active listening. Kids love when parents are genuinely interested in their world.',
    'Take turns asking each other questions. Let your child ask you anything, and you do the same. No topic is off-limits!',
    CURRENT_DATE + INTERVAL '1 day'
  ),
  (
    'Compliment Time',
    'Genuine compliments boost confidence and strengthen relationships. Make your child feel seen and valued.',
    'Give your child a specific compliment about something they did today. Be genuine and detailed about what you noticed.',
    CURRENT_DATE + INTERVAL '2 days'
  );
