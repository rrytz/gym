-- 1. Create a table for Workouts
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  volume DECIMAL,
  sets INTEGER,
  exercises JSONB, -- Stores the exercise instances and sets
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create a table for Routines
CREATE TABLE routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  exercises TEXT[], -- Array of exercise names
  last_performed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
-- This ensures users can only see their own data
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own routines" ON routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON routines FOR DELETE USING (auth.uid() = user_id);

-- 5. Create a Profiles table to track users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger to create a profile entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 7. Create a table for Goals
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'weight', 'strength', 'frequency'
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- 8. Create a table for Weight Logs
CREATE TABLE weight_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  weight DECIMAL NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);
