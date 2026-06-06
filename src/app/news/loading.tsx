import React from "react";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <main className="px-6 md:px-12 py-10 max-w-[1200px] mx-auto">
        {/* News Header */}
        <div className="flex flex-col gap-2 mb-10 border-b border-[rgba(255,255,255,0.04)] pb-8">
           <Skeleton className="h-10 w-48 mb-2" />
           <Skeleton className="h-5 w-72" />
        </div>

        {/* Featured News Card */}
        <div className="mb-12">
           <SkeletonCard className="h-[400px] w-full p-8 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute inset-0 bg-[#1D1D1D] skeleton-shimmer" />
              <div className="relative z-10 w-full max-w-2xl p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                 <Skeleton className="h-6 w-32 mb-4" />
                 <SkeletonText lines={2} className="mb-4" />
                 <Skeleton className="h-4 w-24" />
              </div>
           </SkeletonCard>
        </div>

        {/* News List */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} className="flex p-5 gap-5 items-center">
              <div className="flex flex-col flex-1 gap-3">
                 <Skeleton className="h-6 w-3/4" />
                 <SkeletonText lines={2} />
                 <Skeleton className="h-4 w-24 mt-2" />
              </div>
              <div className="hidden sm:block">
                 <Skeleton className="w-[180px] h-[120px] rounded-xl" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </main>
    </div>
  );
}
