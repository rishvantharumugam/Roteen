export type SessionStatus = "completed" | "active" | "pending" | "upcoming";

export interface SessionStat {
  id: "total" | "active" | "completed" | "pending";
  label: string;
  value: number;
  detail: string;
  accent: string;
}

export interface SessionTimelineItem {
  id: string;
  title: string;
  time: string;
  status: "Completed" | "In Progress" | "Upcoming";
  progress: number;
}

export interface SessionActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "green" | "blue" | "amber" | "rose";
}

export interface SessionQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface SessionRouteLink {
  label: string;
  href: string;
  isPrimary?: boolean;
}

export interface SessionRecord {
  id: string;
  instructor_name: string | null;
  title: string | null;
  status: string | null;
  session_date: string | null;
  start_time: string | null;
  thumbnail_url: string | null;
  thumb_url?: string | null;
  video_url?: string | null;
  video?: string | null;
  video_link?: string | null;
  video_file?: string | null;
  video_path?: string | null;
  recorded_url?: string | null;
  recording_url?: string | null;
  recording?: string | null;
  recording_link?: string | null;
  session_video_url?: string | null;
  media_url?: string | null;
  seat_limit?: number | null;
  Seat_Limit?: number | null;
  type?: string | null;
}

export interface SessionDashboardState {
  userName: string;
  title: string;
  subtitle: string;
  weeklyProgress: number;
  weeklySummary: string;
  motivation: string;
  stats: SessionStat[];
  timeline: SessionTimelineItem[];
  activities: SessionActivityItem[];
  quickActions: SessionQuickAction[];
}

export const sessionDashboardState: SessionDashboardState = {
  userName: "Aarav",
  title: "Session Command Center",
  subtitle: "Track live sessions, prep upcoming work, and keep follow-ups moving.",
  weeklyProgress: 76,
  weeklySummary: "19 of 25 planned sessions are already complete this week.",
  motivation: "Strong rhythm today. Keep each session crisp, documented, and easy to hand off.",
  stats: [
    {
      id: "total",
      label: "Total Sessions",
      value: 42,
      detail: "+8 scheduled this week",
      accent: "from-slate-900 to-purple-700",
    },
    {
      id: "active",
      label: "Active Sessions",
      value: 7,
      detail: "3 need moderator attention",
      accent: "from-emerald-600 to-teal-500",
    },
    {
      id: "completed",
      label: "Completed Sessions",
      value: 28,
      detail: "92% notes submitted",
      accent: "from-indigo-600 to-violet-500",
    },
    {
      id: "pending",
      label: "Upcoming Sessions",
      value: 7,
      detail: "2 awaiting confirmation",
      accent: "from-amber-500 to-rose-500",
    },
  ],
  timeline: [
    {
      id: "kickoff",
      title: "Morning Research Standup",
      time: "09:30 AM",
      status: "Completed",
      progress: 100,
    },
    {
      id: "review",
      title: "Product Discovery Review",
      time: "12:15 PM",
      status: "In Progress",
      progress: 58,
    },
    {
      id: "workshop",
      title: "Client Enablement Workshop",
      time: "03:00 PM",
      status: "Upcoming",
      progress: 0,
    },
  ],
  activities: [
    {
      id: "notes",
      title: "Notes uploaded",
      description: "Discovery notes were attached to Product Discovery Review.",
      timestamp: "10 min ago",
      tone: "green",
    },
    {
      id: "speaker",
      title: "Speaker confirmed",
      description: "Priya accepted the invite for Client Enablement Workshop.",
      timestamp: "28 min ago",
      tone: "blue",
    },
    {
      id: "report",
      title: "Report queued",
      description: "Weekly session report is ready for generation.",
      timestamp: "52 min ago",
      tone: "amber",
    },
    {
      id: "conflict",
      title: "Schedule conflict",
      description: "A facilitator overlap was detected for tomorrow morning.",
      timestamp: "1 hr ago",
      tone: "rose",
    },
  ],
  quickActions: [
    {
      id: "start",
      label: "Start Session",
      description: "Open the next live room",
      icon: "Play",
    },
    {
      id: "upload",
      label: "Upload Notes",
      description: "Attach summaries and files",
      icon: "Upload",
    },
    {
      id: "join",
      label: "Join Meeting",
      description: "Enter the active call",
      icon: "Video",
    },
    {
      id: "report",
      label: "Generate Report",
      description: "Create weekly insights",
      icon: "Chart",
    },
  ],
};
