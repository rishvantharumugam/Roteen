import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables.");
}

export function getSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return siteUrl ?? "http://localhost:3000";
}

export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);

