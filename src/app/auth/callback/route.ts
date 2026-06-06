import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveAuthenticatedUser } from "@/features/auth/services/AuthService";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  const getRedirectUrl = (path: string) => {
    if (isLocalEnv) {
      return `${origin}${path}`;
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`;
    } else {
      return `${origin}${path}`;
    }
  };

  if (!code) {
    return NextResponse.redirect(
      getRedirectUrl(`/auth/auth-code-error?message=${encodeURIComponent("Missing OAuth code from provider.")}`)
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      getRedirectUrl(`/auth/auth-code-error?message=${encodeURIComponent(error.message)}`)
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      getRedirectUrl(`/auth/auth-code-error?message=${encodeURIComponent(
        userError?.message ?? "Google sign-in did not return a user."
      )}`)
    );
  }

  const { data: resolution, error: profileError } = await resolveAuthenticatedUser(
    user,
    supabase,
  );

  if (profileError || !resolution) {
    return NextResponse.redirect(
      getRedirectUrl(`/auth/auth-code-error?message=${encodeURIComponent(profileError?.message ?? "Unable to resolve your account.")}`)
    );
  }

  return NextResponse.redirect(getRedirectUrl(resolution.route));
}

