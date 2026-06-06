import { handleNotificationsGetRequest } from "@/features/notification/actions/notificationController";
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return handleNotificationsGetRequest(user?.id);
}
