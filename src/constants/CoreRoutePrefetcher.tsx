"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { prefetchCoreRoutes } from "@/constants/prefetch";

export function CoreRoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    prefetchCoreRoutes(router);
  }, [router]);

  return null;
}

