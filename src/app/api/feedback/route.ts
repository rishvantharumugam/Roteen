import {
  handleFeedbackGetRequest,
  handleFeedbackPostRequest,
} from "@/features/feedback/actions/feedbackController";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const GET = handleFeedbackGetRequest;

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      userId = user.id;
    }
  } catch (e) {
    console.warn("Failed to get auth session for feedback submission", e);
  }

  return handleFeedbackPostRequest(request, userId);
}
