-- Create personal records table
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(50),
  max_weight DECIMAL(10,2) NOT NULL,
  max_reps INTEGER NOT NULL,
  max_est_1rm DECIMAL(10,2) NOT NULL,
  achieved_date DATE NOT NULL,
  workout_title TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_muscle ON public.personal_records(muscle_group);
CREATE INDEX IF NOT EXISTS idx_personal_records_active ON public.personal_records(is_active);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON public.personal_records(achieved_date DESC);

-- Enable Row Level Security
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Create policies for personal records
CREATE POLICY "Users can view own personal records" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personal records" ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personal records" ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own personal records" ON public.personal_records FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_personal_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_personal_records_updated_at ON public.personal_records;
CREATE TRIGGER trg_personal_records_updated_at BEFORE UPDATE ON public.personal_records
FOR EACH ROW EXECUTE FUNCTION public.handle_personal_records_updated_at();
