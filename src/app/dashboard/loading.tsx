import React from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { Skeleton, SkeletonText, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen dark h-screen overflow-y-auto overflow-x-hidden no-scrollbar text-slate-100">
      <DashboardHeader activeLabel="Dashboard" />
      <div className="mx-auto max-w-[1560px] px-4 py-8 lg:px-6 lg:py-10">
        
        {/* Ongoing Courses Section Skeleton */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <SkeletonText lines={2} lastLineShort={false} />
          </div>
          <div className="hidden sm:block">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <div className="relative w-full mb-12">
          <div className="flex gap-5 overflow-x-hidden pb-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-[320px] w-[85vw] sm:w-[280px] xl:w-[calc(20%-16px)] shrink-0 rounded-[24px]"
              />
            ))}
          </div>
        </div>

        {/* Explore Courses Section Skeleton */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2 w-full max-w-sm">
             <SkeletonText lines={2} lastLineShort={false} />
          </div>
          <div className="w-full max-w-[340px] sm:w-[340px]">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="relative w-full">
          <div className="flex gap-5 overflow-x-hidden pb-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-[380px] w-[85vw] sm:w-[280px] xl:w-[calc(20%-16px)] shrink-0 rounded-[24px]"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
