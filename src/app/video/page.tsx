import { Suspense } from "react";
import VideoClient from "./VideoClient";

export const runtime = 'edge';

export const metadata = {
  title: "Video - Roteen",
  description: "Watch and learn with Roteen videos",
};

export default function VideoPage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-zinc-500">Loading video workspace...</div>}>
      <VideoClient />
    </Suspense>
  );
}
