"use client";

import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export function SkeletonLoader() {
  return (
    <div className="bg-black min-h-screen relative flex h-screen flex-col overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-16 w-full border-b border-zinc-800 bg-[#0a0a0a] px-6 flex items-center justify-between shrink-0">
        <Skeleton className="h-6 w-32 rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      <main className="relative min-h-0 flex-1 min-w-0 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid h-full w-full max-w-[1540px] grid-rows-[auto_minmax(0,1fr)] gap-4">
          
          {/* Hero Section Skeleton */}
          <SkeletonCard className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex flex-col gap-4 max-w-lg w-full">
              <SkeletonText lines={1} className="w-48" />
              <SkeletonText lines={2} lastLineShort={false} />
            </div>
            <div className="hidden md:block">
              <Skeleton className="w-48 h-32 rounded-xl" />
            </div>
          </SkeletonCard>

          <div className="grid min-h-0 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {/* Sidebar Skeleton */}
            <SkeletonCard className="hidden lg:flex flex-col p-4 overflow-hidden">
              <Skeleton className="h-6 w-32 mb-4 shrink-0" />
              <div className="flex flex-col gap-3 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full shrink-0 rounded-lg" />
                ))}
              </div>
            </SkeletonCard>

            {/* Content Section Skeleton */}
            <SkeletonCard className="flex flex-col p-4 overflow-hidden gap-4">
               <Skeleton className="w-full aspect-video rounded-xl shrink-0" />
               <SkeletonText lines={1} className="w-64 h-6" />
               <SkeletonText lines={4} lastLineShort={true} />
            </SkeletonCard>
          </div>
        </div>
      </main>
    </div>
  );
}
