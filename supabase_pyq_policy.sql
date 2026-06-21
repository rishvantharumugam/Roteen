-- Run this SQL in your Supabase SQL Editor to enable read access for the previous_year_questions table
-- This allows the client application to fetch previous year questions.

-- Enable Row Level Security (RLS)
ALTER TABLE public.previous_year_questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public select access
CREATE POLICY "Allow public read access to previous_year_questions"
ON public.previous_year_questions
FOR SELECT
TO public
USING (true);
