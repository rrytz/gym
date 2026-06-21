-- Create meals table for nutrition tracking
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories DECIMAL(10,2) NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
  fat DECIMAL(10,2) NOT NULL DEFAULT 0,
  meal_time TIME NOT NULL,
  meal_date DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON public.meals(meal_date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_meal_time ON public.meals(meal_time);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

-- Create policies for meals with permissive access
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own meals" ON public.meals FOR UPDATE USING (true);
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE USING (true);

-- Create daily nutrition goals table
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calories INTEGER NOT NULL DEFAULT 2200,
  daily_protein DECIMAL(10,2) NOT NULL DEFAULT 150,
  daily_carbs DECIMAL(10,2) NOT NULL DEFAULT 220,
  daily_fat DECIMAL(10,2) NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own nutrition goals" ON public.nutrition_goals;
DROP POLICY IF EXISTS "Users can insert own nutrition goals" ON public.nutrition_goals;
DROP POLICY IF EXISTS "Users can update own nutrition goals" ON public.nutrition_goals;

-- Create policies for nutrition goals with permissive access
CREATE POLICY "Users can view own nutrition goals" ON public.nutrition_goals FOR SELECT USING (true);
CREATE POLICY "Users can insert own nutrition goals" ON public.nutrition_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own nutrition goals" ON public.nutrition_goals FOR UPDATE USING (true);
