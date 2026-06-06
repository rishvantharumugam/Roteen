-- Run this SQL in your Supabase SQL Editor to create the necessary table

CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Assuming user IDs are UUIDs from auth.users
  subject_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  topic_id TEXT,
  quiz_id TEXT,
  question_index INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure that each user only has one active learning progress state.
  -- This constraint is required for the upsert (onConflict: 'user_id') to work properly.
  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own progress
CREATE POLICY "Users can view their own learning progress" 
ON public.user_learning_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert/update their own progress
CREATE POLICY "Users can insert/update their own learning progress" 
ON public.user_learning_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
ON public.user_learning_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
