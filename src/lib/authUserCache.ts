import { supabase } from "@/lib/supabase";

const USER_CACHE_TTL_MS = 60_000;

let cachedUserId: string | null = null;
let cacheExpiresAt = 0;
let inFlightUserIdPromise: Promise<string> | null = null;
let authSubscriptionInitialized = false;

function clearUserCache() {
  cachedUserId = null;
  cacheExpiresAt = 0;
  inFlightUserIdPromise = null;
}

function initAuthCacheSubscription() {
  if (authSubscriptionInitialized || typeof window === "undefined") {
    return;
  }

  authSubscriptionInitialized = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUserId = session?.user?.id ?? null;
    cacheExpiresAt = Date.now() + USER_CACHE_TTL_MS;
    inFlightUserIdPromise = null;
  });
}

export async function getCachedAuthenticatedUserId(): Promise<string> {
  initAuthCacheSubscription();

  const now = Date.now();
  if (cachedUserId && cacheExpiresAt > now) {
    return cachedUserId;
  }

  if (inFlightUserIdPromise) {
    return inFlightUserIdPromise;
  }

  inFlightUserIdPromise = (async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      clearUserCache();
      throw new Error(`Failed to resolve authenticated user: ${sessionError.message}`);
    }

    const userId = session?.user?.id ?? null;
    if (!userId) {
      clearUserCache();
      throw new Error("No authenticated user found.");
    }

    cachedUserId = userId;
    cacheExpiresAt = Date.now() + USER_CACHE_TTL_MS;
    return userId;
  })();

  try {
    return await inFlightUserIdPromise;
  } finally {
    inFlightUserIdPromise = null;
  }
}

