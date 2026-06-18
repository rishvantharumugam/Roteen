-- =====================================================================
-- REFERRAL SYSTEM SUPABASE SETUP
-- =====================================================================

-- 1. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- 2. Trigger function to handle automatic referral count increment and validation
CREATE OR REPLACE FUNCTION public.handle_user_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if referred_by is being set (either on INSERT or updated from NULL/different value)
  IF (TG_OP = 'INSERT' AND NEW.referred_by IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by != NEW.referred_by)) THEN
    
    -- Prevent self-referral
    IF NEW.referred_by = NEW.id THEN
      RAISE EXCEPTION 'You cannot use your own referral code';
    END IF;

    -- Verify the referrer exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.referred_by) THEN
      RAISE EXCEPTION 'Invalid referral code';
    END IF;

    -- Increment the referrer's referral_count
    UPDATE public.users
    SET referral_count = COALESCE(referral_count, 0) + 1
    WHERE id = NEW.referred_by;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind trigger to the users table
DROP TRIGGER IF EXISTS trg_user_referral ON public.users;
CREATE TRIGGER trg_user_referral
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_referral();

-- 4. Sync referral counts for all existing users to ensure absolute accuracy
UPDATE public.users u
SET referral_count = (
  SELECT COUNT(*)
  FROM public.users
  WHERE referred_by = u.id
);
