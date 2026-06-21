-- Create water intake logs table
CREATE TABLE IF NOT EXISTS public.water_intake_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  log_time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_water_intake_user_id ON public.water_intake_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_log_date ON public.water_intake_logs(log_date DESC);

-- Enable Row Level Security
ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for water intake logs
CREATE POLICY "Users can view own water intake logs" ON public.water_intake_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake logs" ON public.water_intake_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own water intake logs" ON public.water_intake_logs FOR DELETE USING (auth.uid() = user_id);

-- Create water goals table
CREATE TABLE IF NOT EXISTS public.water_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_goal_ml INTEGER NOT NULL DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.water_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for water goals
CREATE POLICY "Users can view own water goals" ON public.water_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water goals" ON public.water_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water goals" ON public.water_goals FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at on water_goals
CREATE OR REPLACE FUNCTION public.handle_water_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_water_goals_updated_at ON public.water_goals;
CREATE TRIGGER trg_water_goals_updated_at BEFORE UPDATE ON public.water_goals
FOR EACH ROW EXECUTE FUNCTION public.handle_water_goals_updated_at();
