"use client";

import Link from "next/link";
import { sessionStyles } from "@/style/session";
import { getSessionRoute } from "@/navigation/session";
import type { SessionRecord } from "@/store/session/sessionStore";
import { getSessionVideoUrl, getYouTubeEmbedUrl } from "@/store/session/sessionUtils";

type SessionVideoPageUIProps = {
  record: SessionRecord | null;
  isLoading: boolean;
  errorMessage: string;
};

export function SessionVideoPageUI({ record, isLoading, errorMessage }: SessionVideoPageUIProps) {
  if (isLoading) {
    return (
      <main className={sessionStyles.detailPage}>
        <div className={sessionStyles.detailShell}>
          <div className={`${sessionStyles.emptyState} lg:col-span-1`}>Loading session video...</div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className={sessionStyles.detailPage}>
        <div className={sessionStyles.detailShell}>
          <div className={sessionStyles.errorText}>{errorMessage}</div>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className={sessionStyles.detailPage}>
        <div className={sessionStyles.detailShell}>
          <div className={sessionStyles.emptyState}>Session not found.</div>
        </div>
      </main>
    );
  }

  const videoUrl = getSessionVideoUrl(record);
  const youTubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <main className={sessionStyles.detailPage}>
      <div className={sessionStyles.detailShell}>
        <div className={sessionStyles.detailHead}>
          <div>
            <Link className={sessionStyles.detailBackLink} href={getSessionRoute()}>
              Back to sessions
            </Link>
            <h1 className={sessionStyles.detailTitle}>{record.title ?? "Untitled session"}</h1>
            <p className={sessionStyles.detailSubtitle}>Session video and details from Supabase.</p>
          </div>
          <span className={sessionStyles.detailStatus}>{record.status ?? "pending"}</span>
        </div>

        <section className={sessionStyles.detailGrid}>
          <div className={sessionStyles.detailVideoWrap}>
            <div className={sessionStyles.detailVideoFrame}>
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
                  className={sessionStyles.detailVideo}
                  controls
                  poster={record.thumbnail_url ?? undefined}
                  preload="metadata"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className={sessionStyles.detailEmptyVideo}>
                  <p className="text-lg font-semibold">No Video Available</p>
                </div>
              )}
            </div>
          </div>

          <aside className={sessionStyles.detailSidebar}>
            <div>
              <p className={sessionStyles.detailFieldLabel}>Instructor</p>
              <p className="mt-1 text-xl font-semibold capitalize">{record.instructor_name ?? "Unassigned"}</p>
            </div>
            <div>
              <p className={sessionStyles.detailFieldLabel}>Topic</p>
              <p className={sessionStyles.detailFieldValue}>{record.title ?? "Untitled session"}</p>
            </div>
            <div>
              <p className={sessionStyles.detailFieldLabel}>Session Date</p>
              <p className={sessionStyles.detailFieldValue}>{record.session_date ?? "Not scheduled"}</p>
            </div>
            <div>
              <p className={sessionStyles.detailFieldLabel}>Start Time</p>
              <p className={sessionStyles.detailFieldValue}>{record.start_time ?? "Not available"}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
