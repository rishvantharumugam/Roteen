"use client";

import React from "react";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton, SkeletonAvatar } from "@/components/ui/Skeleton";

export function LoadingSkeleton() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <main className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto">
        
        {/* Feedback Header */}
        <div className="flex flex-col gap-2 mb-10 pb-4">
           <Skeleton className="h-10 w-48 mb-2" />
           <Skeleton className="h-5 w-72" />
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="p-6 flex flex-col gap-4">
                 <Skeleton className="h-8 w-8 rounded-md mb-2" />
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-8 w-20" />
              </SkeletonCard>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Feedback Form */}
           <div className="lg:col-span-2">
              <SkeletonCard className="p-8 flex flex-col gap-6">
                 <Skeleton className="h-6 w-48 mb-2" />
                 <div className="flex gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <Skeleton key={i} className="h-12 w-12 rounded-xl" />
                    ))}
                 </div>
                 
                 <div className="flex flex-col gap-2 mt-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                 </div>
                 
                 <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                 </div>

                 <SkeletonButton className="h-12 w-32 mt-4" />
              </SkeletonCard>
           </div>

           {/* Right Column: Rating Distribution & Featured Review */}
           <div className="flex flex-col gap-8">
              
              {/* Rating Distribution Panel */}
              <SkeletonCard className="p-6 flex flex-col gap-6">
                 <Skeleton className="h-6 w-48" />
                 <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-4 w-8 shrink-0" />
                          <Skeleton className="h-3 flex-1 rounded-full" />
                          <Skeleton className="h-4 w-8 shrink-0" />
                       </div>
                    ))}
                 </div>
              </SkeletonCard>

              {/* Featured Review Panel */}
              <SkeletonCard className="p-6 flex flex-col gap-4">
                 <Skeleton className="h-6 w-40 mb-2" />
                 <div className="flex gap-3 items-center">
                    <SkeletonAvatar className="h-10 w-10" />
                    <div className="flex flex-col gap-1">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-3 w-16" />
                    </div>
                 </div>
                 <div className="flex gap-1 my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                    ))}
                 </div>
                 <SkeletonText lines={3} />
              </SkeletonCard>
              
           </div>
        </div>

      </main>
    </div>
  );
}
