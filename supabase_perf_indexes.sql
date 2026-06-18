-- Performance Indexes for Roteen Database
-- Run this in your Supabase SQL Editor to speed up database queries under 100ms.

-- 1. Users Table Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 2. Subjects Table Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_standard ON public.subjects(standard);

-- 3. Chapters Table Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_no ON public.chapters(chapter_no);

-- 4. Questions Table Indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_mode ON public.questions(mode);

-- 5. User Questions Progress Table Indexes (Columns are case-sensitive Users_ID / Questions_ID)
CREATE INDEX IF NOT EXISTS idx_uqp_users_id ON public.user_questions_progress("Users_ID");
CREATE INDEX IF NOT EXISTS idx_uqp_questions_id ON public.user_questions_progress("Questions_ID");

-- 6. User Quiz Progress Table Indexes (Column is users_id)
CREATE INDEX IF NOT EXISTS idx_uqzp_users_id ON public.user_quiz_progress(users_id);
