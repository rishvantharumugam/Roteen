import type { SessionRecord } from "@/features/session/components/sessionStore";

const liveStatuses = ["on live", "live", "active", "in progress", "ongoing"];
const finishedStatuses = ["finished", "completed", "complete"];

export type SessionActionType = "join" | "enroll" | "finished" | "enrolled" | "cannot_join";

export function normalizeSessionStatus(status: string | null) {
  return status?.trim().toLowerCase() ?? "";
}

export function isLiveSession(status: string | null) {
  return liveStatuses.includes(normalizeSessionStatus(status));
}

export function isFinishedSession(status: string | null) {
  return finishedStatuses.includes(normalizeSessionStatus(status));
}

export function getSessionStatusClass(status: string | null) {
  if (isFinishedSession(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (isLiveSession(status)) {
    return "bg-zinc-800 text-zinc-300 ring-zinc-700";
  }

  return "bg-amber-50 text-amber-700 ring-amber-200";
}

export function getSessionAction(status: string | null, isEnrolled: boolean): {
  label: string;
  type: SessionActionType;
} {
  if (isLiveSession(status)) {
    if (isEnrolled) {
      return {
        label: "Join Now",
        type: "join",
      };
    } else {
      return {
        label: "Not Enrolled (Cannot Join)",
        type: "cannot_join",
      };
    }
  }

  if (isFinishedSession(status)) {
    return {
      label: "Finished",
      type: "finished",
    };
  }

  if (isEnrolled) {
    return {
      label: "Enrolled",
      type: "enrolled",
    };
  }

  return {
    label: "Enroll Now",
    type: "enroll",
  };
}

export function formatSessionDate(date: string | null) {
  if (!date) {
    return "Not scheduled";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function formatSessionStartTime(time: string | null) {
  if (!time) {
    return "Not available";
  }

  const parsedDateTime = new Date(time);

  if (!Number.isNaN(parsedDateTime.getTime())) {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(parsedDateTime);
  }

  const [hours, minutes] = time.split(":");
  const parsedDate = new Date();
  parsedDate.setHours(Number(hours), Number(minutes), 0, 0);

  if (Number.isNaN(parsedDate.getTime())) {
    return time;
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

export function isDirectVideoUrl(url: string | null) {
  return Boolean(url?.match(/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i));
}

export function getYouTubeEmbedUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtube.com" || host === "m.youtube.com") {
      videoId = parsedUrl.searchParams.get("v");

      if (!videoId && parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/")[2] ?? null;
      }

      if (!videoId && parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2] ?? null;
      }
    }

    if (host === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function getSessionVideoUrl(session: SessionRecord) {
  return (
    session.video_url ??
    session.session_video_url ??
    session.recorded_url ??
    session.recording_url ??
    session.recording_link ??
    session.video_link ??
    session.video_file ??
    session.video_path ??
    session.media_url ??
    session.recording ??
    session.video ??
    (isDirectVideoUrl(session.thumbnail_url) ? session.thumbnail_url : null) ??
    null
  );
}
