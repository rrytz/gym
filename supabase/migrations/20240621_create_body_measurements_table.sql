-- Create body measurements table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  waist DECIMAL(5,2),
  chest DECIMAL(5,2),
  arms DECIMAL(5,2),
  forearms DECIMAL(5,2),
  shoulders DECIMAL(5,2),
  thighs DECIMAL(5,2),
  calves DECIMAL(5,2),
  neck DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  measurement_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON public.body_measurements(measurement_date DESC);

-- Enable Row Level Security
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for body measurements
CREATE POLICY "Users can view own body measurements" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body measurements" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body measurements" ON public.body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body measurements" ON public.body_measurements FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_body_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_body_measurements_updated_at ON public.body_measurements;
CREATE TRIGGER trg_body_measurements_updated_at BEFORE UPDATE ON public.body_measurements
FOR EACH ROW EXECUTE FUNCTION public.handle_body_measurements_updated_at();
