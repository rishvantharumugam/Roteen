import React from "react";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-black text-zinc-200 min-h-screen relative flex h-screen flex-col overflow-hidden text-slate-100">
      <main className="relative flex-1 min-h-0 min-w-0 px-2 py-2 sm:px-4 sm:py-4">
        <div className="mx-auto flex h-full max-w-[1920px] gap-4">
          
          {/* Left Sidebar Skeleton (SubjectBar) */}
          <div className="hidden w-[340px] shrink-0 xl:block h-full">
            <SkeletonCard className="flex h-full w-full flex-col p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <Skeleton className="h-10 w-full rounded-lg mb-4" />
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex flex-col gap-3 overflow-hidden">
                 {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                 ))}
              </div>
            </SkeletonCard>
          </div>

          {/* Center Column Skeleton (Video + Notes) */}
          <div className="flex min-w-0 flex-1 flex-col h-full">
            <div className="h-1/2 min-h-0 pr-1 pb-2">
               <SkeletonCard className="h-full w-full flex-col shadow-[0_18px_36px_rgba(0,0,0,0.42)]">
                  <div className="flex items-center justify-between border-b border-zinc-800 p-3 shrink-0">
                     <Skeleton className="h-6 w-64" />
                     <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                     </div>
                  </div>
                  <div className="m-3 flex-1 overflow-hidden rounded-2xl border border-zinc-800">
                    <Skeleton className="h-full w-full aspect-video rounded-none" />
                  </div>
               </SkeletonCard>
            </div>

            <div className="h-1/2 min-h-0 pr-1 pt-2">
               <SkeletonCard className="h-full w-full shadow-[0_18px_36px_rgba(0,0,0,0.42)] flex flex-col">
                  <div className="flex items-center border-b border-zinc-800 px-4 h-12 shrink-0 gap-6">
                     <Skeleton className="h-4 w-16" />
                     <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex-1 p-4">
                     <SkeletonText lines={4} />
                  </div>
               </SkeletonCard>
            </div>
          </div>

          {/* Right Column Skeleton (Theory Panel) */}
          <div className="hidden w-[360px] shrink-0 2xl:block h-full">
            <SkeletonCard className="flex h-full w-full flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
               <div className="flex items-center border-b border-zinc-800 px-4 h-14 shrink-0 gap-4">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
               </div>
               <div className="flex-1 p-5">
                  <SkeletonText lines={1} className="w-32 h-6 mb-4" />
                  <SkeletonText lines={6} />
                  <br />
                  <SkeletonText lines={4} />
               </div>
            </SkeletonCard>
          </div>

        </div>
      </main>
    </div>
  );
}
