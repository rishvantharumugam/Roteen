import React from "react";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <main className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[rgba(255,255,255,0.04)] pb-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          {/* Search */}
          <Skeleton className="h-12 w-full md:w-80 rounded-xl" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
           {/* Category Filters */}
           <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
              <Skeleton className="h-6 w-32 mb-2" />
              {Array.from({ length: 6 }).map((_, i) => (
                 <SkeletonButton key={i} className="w-full h-10 justify-start" />
              ))}
           </div>

           {/* Revision Cards Grid */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                 <SkeletonCard key={i} className="p-6 flex flex-col">
                    <div className="flex items-center gap-4 mb-5">
                       <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                       <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                       </div>
                    </div>
                    <SkeletonText lines={2} className="mb-6 flex-1" />
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                       <Skeleton className="h-4 w-16" />
                       <SkeletonButton className="w-24 h-8 rounded-md" />
                    </div>
                 </SkeletonCard>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
