import { redirect } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'edge';

type SignUpRouteProps = {
  searchParams?: Promise<{
    verified?: string;
    next?: string;
  }>;
};

export default async function SignUpRoute({ searchParams }: SignUpRouteProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams?.next;

  if (session) {
    redirect(nextParam || appRoutes.dashboard);
  }

  let redirectTarget =
    resolvedSearchParams?.verified === "1"
      ? `${appRoutes.home}?auth=signUp&step=3`
      : `${appRoutes.home}?auth=signUp`;

  if (nextParam) {
    redirectTarget += `&next=${encodeURIComponent(nextParam)}`;
  }

  redirect(redirectTarget);
}


