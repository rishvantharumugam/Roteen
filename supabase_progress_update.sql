-- =====================================================================
-- SUPABASE MIGRATION & UTILITY SCRIPT
-- Target Table: public.user_questions_progress
-- Purpose: Remove watched_seconds column, clean up constraints, 
--          and update trigger to maintain status and timestamps.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DROP COLUMN watched_seconds AND OTHER DEPRECATED COLUMNS
-- ---------------------------------------------------------------------
ALTER TABLE public.user_questions_progress 
  DROP COLUMN IF EXISTS watched_seconds,
  DROP COLUMN IF EXISTS subject_id,
  DROP COLUMN IF EXISTS chapter_id;

-- ---------------------------------------------------------------------
-- 2. CREATE UNIQUE CONSTRAINT FOR (Users_ID, Questions_ID, videos_id)
-- ---------------------------------------------------------------------
ALTER TABLE public.user_questions_progress
  DROP CONSTRAINT IF EXISTS unique_user_question_video_progress,
  DROP CONSTRAINT IF EXISTS unique_user_question_progress,
  ADD CONSTRAINT unique_user_question_video_progress 
    UNIQUE NULLS NOT DISTINCT ("Users_ID", "Questions_ID", "videos_id");

-- ---------------------------------------------------------------------
-- 3. SET UP AUTO-UPDATE TRIGGERS & FUNCTIONS
-- Enforces business logic:
-- - status remains "In_Progress" unless video/question is completed.
-- - status cannot regress from 'Resolved' back to 'In_Progress'.
-- - completed_at is automatically set to now when status becomes 'Resolved'.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_process_user_questions_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at timestamp to now on any write operation
  NEW.updated_at := NOW();

  -- Handle updates (prevent regression of status)
  IF TG_OP = 'UPDATE' THEN
    -- If already Resolved, retain Resolved status and completed_at timestamp
    IF OLD.status = 'Resolved' THEN
      NEW.status := 'Resolved';
      IF OLD.completed_at IS NOT NULL THEN
        NEW.completed_at := OLD.completed_at;
      END IF;
    END IF;
  END IF;

  -- If status is manually set to 'Resolved', ensure completed_at is set
  IF NEW.status = 'Resolved' AND NEW.completed_at IS NULL THEN
    NEW.completed_at := NOW();
  END IF;

  -- Default status to 'In_Progress' if null
  IF NEW.status IS NULL THEN
    NEW.status := 'In_Progress';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger to the table
DROP TRIGGER IF EXISTS trg_user_questions_progress_process ON public.user_questions_progress;
CREATE TRIGGER trg_user_questions_progress_process
  BEFORE INSERT OR UPDATE ON public.user_questions_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_process_user_questions_progress();

-- ---------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_questions_progress_lookup 
  ON public.user_questions_progress ("Users_ID", "Questions_ID", "videos_id");

CREATE INDEX IF NOT EXISTS idx_user_questions_progress_status
  ON public.user_questions_progress ("Users_ID") 
  WHERE status = 'Resolved';
