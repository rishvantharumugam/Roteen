import { redirect } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'edge';

type LoginRouteProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginRouteProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams?.next;
  
  if (session) {
    redirect(nextParam || appRoutes.dashboard);
  }
  
  const redirectTarget = nextParam
    ? `${appRoutes.home}?auth=signIn&next=${encodeURIComponent(nextParam)}`
    : `${appRoutes.home}?auth=signIn`;
    
  redirect(redirectTarget);
}


