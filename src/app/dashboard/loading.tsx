import React from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { Skeleton, SkeletonText, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen dark h-screen overflow-y-auto overflow-x-hidden no-scrollbar text-slate-100">
      <DashboardHeader activeLabel="Dashboard" />
      <div className="mx-auto max-w-[1560px] px-4 pt-3 pb-8 lg:px-6 lg:pt-4 lg:pb-10">
        {/* Today's Learning Skeleton */}
        <div className="mb-8 rounded-[20px] border border-zinc-800 bg-[#121212] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-pulse">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48 rounded-md bg-zinc-800" />
              <Skeleton className="h-4 w-72 rounded-md bg-zinc-800" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <Skeleton className="h-32 w-32 rounded-full shrink-0 bg-zinc-800" />
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex flex-col gap-2 w-24">
                    <Skeleton className="h-4 w-16 rounded-md bg-zinc-800" />
                    <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-2 w-24">
                    <Skeleton className="h-4 w-16 rounded-md bg-zinc-800" />
                    <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-2 w-24">
                    <Skeleton className="h-4 w-16 rounded-md bg-zinc-800" />
                    <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full rounded-full bg-zinc-800" />
                <Skeleton className="h-4 w-60 rounded-md bg-zinc-800" />
              </div>
            </div>
          </div>
          <div className="shrink-0 self-center">
            <Skeleton className="h-10 w-28 rounded-lg bg-zinc-800" />
          </div>
        </div>

        {/* Ongoing Courses Section Skeleton */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <SkeletonText lines={2} lastLineShort={false} />
          </div>
          <div className="hidden sm:block">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <div className="relative w-full mb-6">
          <div className="flex gap-5 overflow-x-hidden pb-3">
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
          <div className="flex gap-5 overflow-x-hidden pb-3">
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
