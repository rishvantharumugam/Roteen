"use client";

import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonButton } from "@/components/ui/Skeleton";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <main className="px-6 md:px-12 py-10 max-w-[1200px] mx-auto">
        
        {/* Profile Header & Avatar */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b border-[rgba(255,255,255,0.04)] pb-10">
           <SkeletonAvatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-black shrink-0" />
           <div className="flex flex-col items-center md:items-start gap-3 w-full">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-40 mb-2" />
              <div className="flex gap-4">
                 <SkeletonButton className="h-10 w-32" />
                 <SkeletonButton className="h-10 w-32" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Left Column: Statistics & Settings */}
           <div className="flex flex-col gap-8">
              
              {/* Statistics */}
              <SkeletonCard className="p-6">
                 <Skeleton className="h-6 w-32 mb-6" />
                 <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                       <div key={i} className="flex flex-col gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-4 w-24" />
                       </div>
                    ))}
                 </div>
              </SkeletonCard>

              {/* Settings Cards */}
              <SkeletonCard className="p-6">
                 <Skeleton className="h-6 w-32 mb-6" />
                 <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Skeleton className="h-8 w-8 rounded-md" />
                             <Skeleton className="h-5 w-32" />
                          </div>
                          <Skeleton className="h-6 w-10 rounded-full" />
                       </div>
                    ))}
                 </div>
              </SkeletonCard>
           </div>

           {/* Right Column: Activity Timeline */}
           <div className="lg:col-span-2">
              <SkeletonCard className="p-6 md:p-8 h-full">
                 <Skeleton className="h-6 w-48 mb-8" />
                 
                 <div className="flex flex-col gap-8 relative">
                    <div className="absolute left-6 top-2 bottom-2 w-px bg-zinc-800" />
                    
                    {Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex gap-6 relative">
                          <Skeleton className="h-12 w-12 rounded-full border-4 border-[#1A1A1A] shrink-0 relative z-10" />
                          <div className="flex flex-col gap-2 flex-1 pt-2">
                             <div className="flex justify-between items-center">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-24" />
                             </div>
                             <SkeletonText lines={2} className="w-3/4" />
                          </div>
                       </div>
                    ))}
                 </div>
              </SkeletonCard>
           </div>

        </div>

      </main>
    </div>
  );
};
