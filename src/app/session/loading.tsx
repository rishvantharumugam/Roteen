import React from "react";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton, SkeletonAvatar } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <main className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[rgba(255,255,255,0.04)] pb-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <SkeletonButton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Session Cards */}
           <div className="lg:col-span-2 flex flex-col gap-6">
              <Skeleton className="h-6 w-40 mb-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                 <SkeletonCard key={i} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl p-4 w-24 shrink-0 skeleton-shimmer">
                       <Skeleton className="h-6 w-12 mb-1 bg-[#242424]" />
                       <Skeleton className="h-8 w-16 bg-[#242424]" />
                    </div>
                    <div className="flex-1 w-full">
                       <Skeleton className="h-6 w-3/4 mb-3" />
                       <SkeletonText lines={2} className="mb-4" />
                       <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                             <SkeletonAvatar className="w-8 h-8 border-2 border-black" />
                             <SkeletonAvatar className="w-8 h-8 border-2 border-black" />
                             <SkeletonAvatar className="w-8 h-8 border-2 border-black" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                       </div>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 flex flex-col gap-3">
                       <SkeletonButton className="w-full sm:w-32" />
                    </div>
                 </SkeletonCard>
              ))}
           </div>

           {/* Right Column: Calendar & Upcoming */}
           <div className="flex flex-col gap-8">
              {/* Calendar Panel */}
              <div className="flex flex-col gap-4">
                 <Skeleton className="h-6 w-32" />
                 <SkeletonCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                       <Skeleton className="h-6 w-32" />
                       <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                       </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                       {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full rounded" />
                       ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                       {Array.from({ length: 35 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full rounded-md" />
                       ))}
                    </div>
                 </SkeletonCard>
              </div>

              {/* Upcoming Sessions Mini List */}
              <div className="flex flex-col gap-4 mt-4">
                 <Skeleton className="h-6 w-48" />
                 <SkeletonCard className="p-5 flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="flex gap-4 items-center">
                          <div className="w-2 h-10 rounded-full bg-[#1D1D1D] skeleton-shimmer" />
                          <div className="flex-1">
                             <Skeleton className="h-5 w-3/4 mb-1" />
                             <Skeleton className="h-3 w-1/2" />
                          </div>
                       </div>
                    ))}
                 </SkeletonCard>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
