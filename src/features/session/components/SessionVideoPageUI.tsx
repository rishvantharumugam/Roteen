"use client";

import Link from "next/link";
import { getSessionRoute } from "@/features/session/constants/session";
import type { SessionRecord } from "@/features/session/components/sessionStore";
import { getSessionVideoUrl, getYouTubeEmbedUrl } from "@/features/session/components/sessionUtils";

type SessionVideoPageUIProps = {
  record: SessionRecord | null;
  isLoading: boolean;
  errorMessage: string;
};

export function SessionVideoPageUI({ record, isLoading, errorMessage }: SessionVideoPageUIProps) {
  if (isLoading) {
    return (
      <main className="bg-black min-h-screen  px-4 py-6 text-slate-950 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <div className={`"rounded-lg border border-white/10 bg-[#0e1226] p-5 text-sm text-slate-400 lg:col-span-2" lg:col-span-1`}>Loading session video...</div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="bg-black min-h-screen  px-4 py-6 text-slate-950 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <div className="pt-5 text-sm font-medium text-rose-700">{errorMessage}</div>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="bg-black min-h-screen  px-4 py-6 text-slate-950 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <div className="rounded-lg border border-white/10 bg-[#0e1226] p-5 text-sm text-slate-400 lg:col-span-2">Session not found.</div>
        </div>
      </main>
    );
  }

  const videoUrl = getSessionVideoUrl(record);
  const youTubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <main className="bg-black min-h-screen  px-4 py-6 text-slate-950 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-medium text-teal-700 transition hover:text-teal-900" href={getSessionRoute()}>
              Back to sessions
            </Link>
            <h1 className="mt-2 text-3xl font-semibold capitalize tracking-normal">{record.title ?? "Untitled session"}</h1>
            <p className="mt-2 text-sm text-slate-600">Session video and details from Supabase.</p>
          </div>
          <span className="w-fit rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200">{record.status ?? "pending"}</span>
        </div>

        <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.4fr_0.6fr]">
          <div className="bg-slate-950 p-4">
            <div className="relative aspect-video overflow-hidden rounded-md border border-white/10 bg-slate-900">
              {youTubeEmbedUrl ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full bg-black"
                  src={youTubeEmbedUrl}
                  title={record.title ?? "Session video"}
                />
              ) : videoUrl ? (
                <video
                  className="h-full w-full bg-black object-contain"
                  controls
                  poster={record.thumbnail_url ?? undefined}
                  preload="metadata"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.32),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#134e4a)] text-center text-white">
                  <p className="text-lg font-semibold">No Video Available</p>
                </div>
              )}
            </div>
          </div>

          <aside className="grid gap-5 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instructor</p>
              <p className="mt-1 text-xl font-semibold capitalize">{record.instructor_name ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</p>
              <p className="mt-1 text-slate-700">{record.title ?? "Untitled session"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session Date</p>
              <p className="mt-1 text-slate-700">{record.session_date ?? "Not scheduled"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start Time</p>
              <p className="mt-1 text-slate-700">{record.start_time ?? "Not available"}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
