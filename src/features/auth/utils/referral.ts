import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generates a random alphanumeric string of the specified length.
 */
function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a new referral code in the format RTN-XXXXXXXX
 */
export function generateReferralCode(): string {
  return `RTN-${generateRandomAlphanumeric(8)}`;
}

/**
 * Assigns a unique referral code to the given user ID.
 * Implements a retry-loop that gracefully catches unique-constraint violations (race conditions)
 * to guarantee that the generated referral code is absolutely unique before returning.
 * 
 * @param userId - The ID of the user to assign the code to.
 * @param supabaseClient - The active Supabase client instance.
 * @returns The unique referral code that was assigned.
 */
export async function assignUniqueReferralCode(
  userId: string,
  supabaseClient: SupabaseClient
): Promise<string> {
  const MAX_RETRIES = 5;
  let attempts = 0;
  let uniqueCode = '';

  while (attempts < MAX_RETRIES) {
    const candidateCode = generateReferralCode();
    
    // Attempt to update the user with the new code
    const { error } = await supabaseClient
      .from('users')
      .update({ referral_code: candidateCode })
      .eq('id', userId);

    if (!error) {
      // Update succeeded, no unique constraint violation
      uniqueCode = candidateCode;
      break;
    }

    // Postgres unique_violation error code is '23505'
    // If the error is a unique constraint violation, we loop and try a new code.
    if (error.code === '23505' || error.message?.toLowerCase().includes('unique')) {
      attempts++;
      continue;
    }

    // If it's a different error (e.g. network failure), throw it immediately
    throw new Error(`Failed to assign referral code: ${error.message}`);
  }

  if (!uniqueCode) {
    throw new Error('Could not generate a unique referral code after multiple attempts. Please try again later.');
  }

  return uniqueCode;
}
