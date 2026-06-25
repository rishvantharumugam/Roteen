import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveAuthenticatedUser } from "@/features/auth/services/AuthService";

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const isPopup = searchParams.get("popup") === "1";
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

  const respondWithError = (message: string) => {
    if (isPopup) {
      return new NextResponse(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_SIGN_IN_ERROR', error: '${message}' }, '*');
            window.close();
          }
        </script></body></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }
    return NextResponse.redirect(getRedirectUrl(`/auth/auth-code-error?message=${encodeURIComponent(message)}`));
  };

  if (!code) {
    return respondWithError("Missing OAuth code from provider.");
  }

  const supabase = await createServerSupabaseClient();
  const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);
  const session = exchangeData?.session;

  if (error) {
    return respondWithError(error.message);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return respondWithError(userError?.message ?? "Google sign-in did not return a user.");
  }

  const { data: resolution, error: profileError } = await resolveAuthenticatedUser(
    user,
    supabase,
  );

  if (profileError || !resolution) {
    return respondWithError(profileError?.message ?? "Unable to resolve your account.");
  }

  const isProfileComplete = resolution.route === "/" || resolution.route.startsWith("/dashboard");
  const finalRoute = isProfileComplete
    ? `/?google_success=1&next=${encodeURIComponent(resolution.route)}`
    : resolution.route;
    
  if (isPopup) {
    const sessionString = session ? JSON.stringify(session) : 'null';
    return new NextResponse(`
      <html><body><script>
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_SIGN_IN_SUCCESS', 
            url: '${finalRoute}',
            session: ${sessionString}
          }, window.location.origin);
          window.close();
        }
      </script></body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  return NextResponse.redirect(getRedirectUrl(finalRoute));
}

