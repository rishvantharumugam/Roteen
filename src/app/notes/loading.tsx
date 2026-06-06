import React from "react";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function NotesLoading() {
  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden">
      {/* Navbar Skeleton */}
      <div className="flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.04)] px-6">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="px-8 md:px-16 py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-full md:w-64 rounded-xl" />
        </div>

        {/* Note Cards Grid Skeleton */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
          <SkeletonCard className="h-[280px] w-full max-w-[240px] flex flex-col justify-center items-center gap-3 border-dashed border-zinc-700 bg-transparent">
             <Skeleton className="h-12 w-12 rounded-full" />
             <Skeleton className="h-4 w-24" />
          </SkeletonCard>
          
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} className="h-[280px] w-full max-w-[240px] flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <SkeletonText lines={4} className="flex-1" />
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </main>
    </div>
  );
}
