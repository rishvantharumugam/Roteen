"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { appRoutes } from "@/constants/AppRoutes";
import { supabase } from '@/lib/supabase/client';
import { ensureUserRecord } from "@/features/auth/services/AuthService";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useAuth } from "@/providers/AuthProvider";

const BUG_TABLE = "bugs";
const DEFAULT_BUG_STATUS = "Not open";

const bugCategories = ["Quiz", "Login Glitch", "Authentication", "UI / UX", "Video Not Clear", "Other"] as const;
const bugPriorities = ["Low", "Medium", "High"] as const;
const priorityDetails = {
  Low: { label: "Low - Small, harmless issues", colorClass: "text-green-500" },
  Medium: { label: "Medium - Affects usability", colorClass: "text-yellow-500" },
  High: { label: "High - Critical breakage", colorClass: "text-red-500" },
} as const;

type BugCategory = (typeof bugCategories)[number];
type BugPriority = (typeof bugPriorities)[number];

type BugRecord = {
  id: string;
  title: string | null;
  category: string | null;
  priority: string | null;
  description: string | null;
  image_url: string | null;
  status: string | null;
  reported_at: string | null;
};

type BugFormState = {
  title: string;
  category: BugCategory;
  priority: BugPriority;
  description: string;
};

type BugStatus = typeof DEFAULT_BUG_STATUS | "In Progress" | "Resolved";

const defaultFormState: BugFormState = {
  title: "",
  category: "Quiz",
  priority: "Low",
  description: "",
};

const bugSelectColumns = "id, title, category, priority, description, image_url, status, reported_at";

// --- SVG Icons ---
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  PlusSquare: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="12" x2="12" y1="8" y2="16" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  ),
  Bug: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4" />
      <path d="M8 14H4" />
      <path d="M20 14h-4" />
      <path d="M9 18l-3 3" />
      <path d="M15 18l3 3" />
    </svg>
  ),
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-slate-800 dark:text-white transition-colors">
      <path d="M9.1 4.4L13 2.1l7.8 4.5v9l-7.8 4.5-3.9-2.2v-4.5l-3.9 2.2L1.3 11V6.6l7.8-4.5zM13 5.4L6.5 9.1l3.9 2.2 6.5-3.8-3.9-2.1z" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Circle: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${color}`}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  CheckCircle: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${color}`}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-orange-500">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-500">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  MessageSquare: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-500">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
};

// --- Helpers ---
function formatBugCode(id: string) {
  return id.trim() || "Bug";
}

function generateBugId() {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `#RN-${randomPart}`;
}

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityColor(priority: string | null) {
  const p = priority?.toLowerCase();
  if (p === "high") return "text-red-500";
  if (p === "medium") return "text-yellow-500";
  return "text-green-500";
}

function getBugStatus(status: string | null): BugStatus {
  const normalized = status?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? "";

  if (normalized === "in progress") return "In Progress";
  if (normalized === "resolved") return "Resolved";
  if (normalized === "open" || normalized === "not open") return DEFAULT_BUG_STATUS;
  return DEFAULT_BUG_STATUS;
}

function getSafeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read screenshot."));
    reader.readAsDataURL(file);
  });
}

export function BugWorkspace() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [bugs, setBugs] = useState<BugRecord[]>([]);
  const [form, setForm] = useState<BugFormState>(defaultFormState);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view">("create");
  const [selectedBug, setSelectedBug] = useState<BugRecord | null>(null);
  const openBugCount = bugs.filter((bug) => getBugStatus(bug.status) === DEFAULT_BUG_STATUS).length;
  const inProgressBugCount = bugs.filter((bug) => getBugStatus(bug.status) === "In Progress").length;
  const resolvedBugCount = bugs.filter((bug) => getBugStatus(bug.status) === "Resolved").length;
  const filteredBugs = bugs.filter((bug) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return [bug.id, bug.title, bug.category, bug.priority, bug.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
  const statCards = [
    {
      label: "All bugs",
      value: bugs.length,
      icon: <Icons.Sun />,
      tone: "text-orange-400",
      ring: "border-orange-400/30 shadow-[0_0_30px_rgba(251,146,60,0.12)]",
    },
    {
      label: "In Progress",
      value: inProgressBugCount,
      icon: <Icons.Clock />,
      tone: "text-violet-400",
      ring: "border-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.12)]",
    },
    {
      label: "Not open",
      value: openBugCount,
      icon: <Icons.MessageSquare />,
      tone: "text-yellow-400",
      ring: "border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.12)]",
    },
    {
      label: "Resolved",
      value: resolvedBugCount,
      icon: <Icons.CheckCircle color="text-green-400" />,
      tone: "text-green-400",
      ring: "border-green-400/30 shadow-[0_0_30px_rgba(74,222,128,0.12)]",
    },
  ];

  useEffect(() => {
    async function loadBugPage() {
      if (isAuthLoading) {
        return;
      }

      if (!user) {
        setUserId(null);
        setBugs([]);
        setIsLoading(false);
        return;
      }

      const { profile, error: profileError } = await ensureUserRecord(user, supabase);
      if (profileError || !profile) {
        setSubmitError(profileError?.message ?? "Unable to load your profile for bug reports.");
        setIsLoading(false);
        return;
      }

      setUserId(profile.id);
      const { data, error } = await supabase
        .from(BUG_TABLE)
        .select(bugSelectColumns)
        .eq("user_id", profile.id)
        .order("reported_at", { ascending: false });

      if (!error) {
        setBugs((data as BugRecord[]) ?? []);
      }
      setIsLoading(false);
    }
    void loadBugPage();
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`bugs-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: BUG_TABLE,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBugs((current) => {
              const insertedBug = payload.new as BugRecord;
              if (current.some((bug) => bug.id === insertedBug.id)) return current;
              return [insertedBug, ...current];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            const updatedBug = payload.new as BugRecord;
            setBugs((current) => current.map((bug) => (bug.id === updatedBug.id ? updatedBug : bug)));
            setSelectedBug((current) => (current?.id === updatedBug.id ? updatedBug : current));
            return;
          }

          if (payload.eventType === "DELETE") {
            const deletedBug = payload.old as Pick<BugRecord, "id">;
            setBugs((current) => current.filter((bug) => bug.id !== deletedBug.id));
            setSelectedBug((current) => (current?.id === deletedBug.id ? null : current));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImageName("");
      setSelectedImageDataUrl("");
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setSubmitError("Please upload a PNG, JPG, or JPEG screenshot.");
      event.target.value = "";
      setSelectedImageName("");
      setSelectedImageDataUrl("");
      return;
    }
    if (file.size > 1024 * 1024) {
      setSubmitError("Screenshot must be smaller than 1 MB.");
      event.target.value = "";
      setSelectedImageName("");
      setSelectedImageDataUrl("");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file).catch((error: Error) => {
      setSubmitError(error.message);
      return "";
    });

    if (!dataUrl) {
      event.target.value = "";
      setSelectedImageName("");
      setSelectedImageDataUrl("");
      return;
    }

    setSubmitError("");
    setSelectedImageName(getSafeFileName(file.name));
    setSelectedImageDataUrl(dataUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setSubmitError("Please sign in again before reporting a bug.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    const bugId = generateBugId();

    const payload = {
      id: bugId,
      user_id: userId,
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      description: form.description.trim(),
      image_url: selectedImageDataUrl || null,
    };

    const { data, error } = await supabase.from(BUG_TABLE).insert(payload).select(bugSelectColumns).single();

    if (!error && data) {
      setBugs((current) => [data as BugRecord, ...current]);
      setForm(defaultFormState);
      setSelectedImageName("");
      setSelectedImageDataUrl("");
      setIsDrawerOpen(false);
    } else {
      setSubmitError(error?.message ?? "Unable to save the bug report. Please try again.");
    }
    setIsSubmitting(false);
  }

  function openCreateDrawer() {
    setForm(defaultFormState);
    setSelectedImageName("");
    setSelectedImageDataUrl("");
    setSubmitError("");
    setDrawerMode("create");
    setIsDrawerOpen(true);
  }

  function openViewDrawer(bug: BugRecord) {
    setSelectedBug(bug);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  }

  return (
    <div className="dark flex h-screen w-full flex-col !bg-[#030303] transition-colors duration-300">
      <DashboardHeader />
      <div className="bg-black flex min-h-0 flex-1 w-full overflow-hidden text-slate-300 transition-colors duration-300">

          {/* Main Content */}
          <main className="no-scrollbar flex-1 min-w-0 overflow-y-auto bg-[#030303] px-5 py-8 transition-colors duration-300 sm:px-8 lg:px-12">
            {!isAuthLoading && !user ? (
              <div className="flex flex-1 items-center justify-center px-8 py-12">
                <div className="w-full max-w-md rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,rgba(24,24,27,0.92),rgba(11,11,13,0.96))] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                  <h2 className="text-lg font-semibold text-white">Sign in required</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Please sign in to view and submit your bug reports.
                  </p>
                  <Link
                    href={appRoutes.signIn}
                    className="mt-4 inline-block rounded-xl border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 shadow-[0_0_24px_rgba(124,58,237,0.16)] transition hover:bg-violet-500/20"
                  >
                    Go to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-[1660px] flex-col gap-6">
                <section className="flex items-center justify-between rounded-[14px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(24,24,27,0.92),rgba(13,13,16,0.96))] px-8 py-7 shadow-[0_22px_90px_rgba(0,0,0,0.42)]">
                  <div className="flex items-center gap-6">
                    <div className="grid h-[74px] w-[74px] place-items-center rounded-[10px] border border-violet-500/45 bg-violet-500/10 text-violet-400 shadow-[0_0_40px_rgba(124,58,237,0.14)]">
                      <Icons.Bug />
                    </div>
                    <div>
                      <h1 className="text-[26px] font-bold tracking-tight text-white">Bug Dashboard</h1>
                      <p className="mt-2 text-[15px] text-slate-300">Track, manage and resolve bugs efficiently.</p>
                    </div>
                  </div>
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex h-[54px] items-center gap-3 rounded-[8px] border border-violet-500/55 bg-violet-500/10 px-6 text-[15px] font-semibold text-violet-300 shadow-[0_0_26px_rgba(124,58,237,0.13)] transition hover:border-violet-400 hover:bg-violet-500/20 hover:text-violet-100"
                  >
                    <Icons.PlusSquare />
                    Report new bug
                  </button>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="flex min-h-[138px] items-center gap-6 rounded-[14px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(24,24,27,0.88),rgba(13,13,16,0.94))] px-7 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.38)]"
                    >
                      <div className={`grid h-[78px] w-[78px] place-items-center rounded-full border bg-[#171719] ${card.ring}`}>
                        <div className={`grid h-[60px] w-[60px] place-items-center rounded-full bg-[#202024] ${card.tone}`}>
                          {card.icon}
                        </div>
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-slate-300">{card.label}</p>
                        <p className={`mt-2 text-[32px] font-extrabold leading-none ${card.tone}`}>{card.value}</p>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="rounded-[14px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(24,24,27,0.88),rgba(13,13,16,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.4)]">
                  <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-[15px] text-slate-300">Showing {filteredBugs.length} of {bugs.length} bugs</p>
                    <label className="relative block w-full md:w-[360px]">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-12 w-full rounded-[8px] border border-white/[0.08] bg-[#121216]/80 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
                        placeholder="Search bugs..."
                      />
                    </label>
                  </div>

                  <div className="overflow-hidden rounded-[12px] border border-white/[0.07] bg-[#141418]/75">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-white/[0.08] bg-white/[0.02] text-white">
                        <tr>
                          <th className="px-7 py-5 font-semibold">Id</th>
                          <th className="px-7 py-5 font-semibold">Title</th>
                          <th className="px-7 py-5 font-semibold">Category</th>
                          <th className="px-7 py-5 font-semibold">Priority</th>
                          <th className="px-7 py-5 font-semibold">Status</th>
                          <th className="px-7 py-5 font-semibold">Reported on</th>
                          <th className="px-7 py-5 font-semibold">Last updated</th>
                          <th className="px-7 py-5 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {isLoading ? null : filteredBugs.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-14">
                              <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                                <div className="relative grid h-[116px] w-[116px] place-items-center rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.28),rgba(39,39,42,0.94))] text-violet-300 shadow-[0_26px_80px_rgba(124,58,237,0.18)]">
                                  <span className="absolute -left-7 top-3 text-lg text-slate-400">✦</span>
                                  <span className="absolute -right-7 bottom-4 text-lg text-slate-400">✦</span>
                                  <Icons.Bug />
                                </div>
                                <h2 className="mt-6 text-2xl font-bold text-white">No bugs found</h2>
                                <p className="mt-3 text-[15px] text-slate-300">
                                  {bugs.length === 0 ? "There are no bugs to display at the moment." : "No bugs match your search."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredBugs.map((bug) => (
                            <tr key={bug.id} className="group transition hover:bg-white/[0.035]">
                              <td className="px-7 py-5 text-slate-400">{formatBugCode(bug.id)}</td>
                              <td className="px-7 py-5 font-medium text-slate-200">
                                {bug.title ? (bug.title.length > 24 ? `${bug.title.substring(0, 24)}...` : bug.title) : "Untitled"}
                              </td>
                              <td className="px-7 py-5 text-slate-400">{bug.category ?? "Quiz"}</td>
                              <td className="px-7 py-5">
                                <span className={`font-semibold ${getPriorityColor(bug.priority)}`}>
                                  {bug.priority ?? "Low"}
                                </span>
                              </td>
                              <td className="px-7 py-5 text-slate-400">{getBugStatus(bug.status)}</td>
                              <td className="px-7 py-5 text-slate-400">{formatDate(bug.reported_at)}</td>
                              <td className="px-7 py-5 text-slate-400">{formatDate(bug.reported_at)}</td>
                              <td className="px-7 py-5 text-right">
                                <button
                                  onClick={() => openViewDrawer(bug)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 opacity-0 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200 group-hover:opacity-100"
                                  aria-label="View bug"
                                >
                                  <Icons.Eye />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </main>

          {/* Slide-out Drawer */}
          <div 
            className={`fixed inset-y-0 right-0 z-50 w-[420px] transform bg-white dark:bg-[#181818] border-l border-slate-200 dark:border-[#262626] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.7)] transition-all duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] px-6 py-4 transition-colors duration-300">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">
                  {drawerMode === "create" ? "Report new bug" : "Bug View"}
                </h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#262626] hover:text-slate-900 dark:hover:text-white transition"
                >
                  <Icons.Close />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="no-scrollbar flex-1 overflow-y-auto p-6">
                {drawerMode === "create" ? (
                  <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-6">
                    <div>
                      <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Category</label>
                      <div className="relative">
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as BugCategory })}
                          className="w-full appearance-none rounded-md border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:shadow-[0_0_10px_rgba(249,115,22,0.15)] focus:outline-none transition-shadow duration-300"
                        >
                          {bugCategories.map(cat => (
                            <option key={cat} value={cat} className="text-slate-900 dark:text-white">{cat}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                          <Icons.ChevronDown />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Title</label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter your bug title here"
                        className="w-full rounded-md border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 focus:shadow-[0_0_10px_rgba(249,115,22,0.15)] focus:outline-none transition-shadow duration-300"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Description</label>
                      <textarea
                        required
                        rows={6}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter your bug description here"
                        className="w-full rounded-md border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 focus:shadow-[0_0_10px_rgba(249,115,22,0.15)] focus:outline-none resize-none transition-shadow duration-300"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Priority</label>
                      <div className="relative" onBlur={() => setIsPriorityOpen(false)}>
                        <button
                          type="button"
                          onClick={() => setIsPriorityOpen((current) => !current)}
                          className={`flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium focus:border-orange-500 focus:shadow-[0_0_10px_rgba(249,115,22,0.15)] focus:outline-none dark:border-[#333] dark:bg-[#222] ${priorityDetails[form.priority].colorClass}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {priorityDetails[form.priority].label}
                          </span>
                          <Icons.ChevronDown />
                        </button>
                        {isPriorityOpen && (
                          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-[#333] dark:bg-[#222]">
                            {bugPriorities.map((priority) => (
                              <button
                                key={priority}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setForm({ ...form, priority });
                                  setIsPriorityOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2a2a2a] ${priorityDetails[priority].colorClass}`}
                              >
                                <span className="h-2 w-2 rounded-full bg-current" />
                                {priorityDetails[priority].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Screenshots (optional, max 5)</label>
                      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 dark:border-[#444] bg-slate-50 dark:bg-[#222] py-8 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] transition duration-300">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Icons.Upload />
                          <span>Click to upload <span className="text-slate-400 dark:text-slate-500 text-xs">PNG, JPG or JPEG (&lt;1 mb)</span></span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      {selectedImageName && <p className="mt-2 text-xs text-orange-500">{selectedImageName}</p>}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-[#c2410c] py-3 text-sm font-medium text-white hover:bg-[#9a3412] disabled:opacity-50 transition shadow-sm"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                      {submitError && (
                        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                          {submitError}
                        </p>
                      )}
                      <p className="mt-4 text-center text-xs text-slate-500">
                        For instant support/feedback, just drop us a message on{" "}
                        <span className="text-green-500 hover:underline cursor-pointer">WhatsApp</span>
                      </p>
                    </div>
                  </form>
                ) : selectedBug ? (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                        {selectedBug.title || "Untitled bug"} <span className="text-slate-400 dark:text-slate-500 text-sm float-right">#{selectedBug.id}</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Last reported</p>
                          <p className="text-slate-700 dark:text-slate-300 transition-colors duration-300">{formatDate(selectedBug.reported_at)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Last updated</p>
                          <p className="text-slate-700 dark:text-slate-300 transition-colors duration-300">{formatDate(selectedBug.reported_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-500 mb-2 block">Status</label>
                        <div className="h-full rounded border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 flex justify-between items-center transition-colors duration-300">
                          <span className="truncate">{getBugStatus(selectedBug.status)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-500 mb-2 block">Priority</label>
                        <div className="h-full rounded border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 flex justify-between items-center transition-colors duration-300">
                          <span className={`flex items-center gap-2 truncate ${getPriorityColor(selectedBug.priority)}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
                            <span className="truncate">{selectedBug.priority || "High"}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-500 mb-2 block">Category</label>
                        <div className="h-full rounded border border-slate-300 dark:border-[#333] bg-white dark:bg-[#222] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 flex justify-between items-center transition-colors duration-300">
                          <span className="truncate">{selectedBug.category || "Quiz"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex border-b border-slate-200 dark:border-[#333] mb-4 transition-colors duration-300">
                        <button className="px-4 py-2 border-b-2 border-orange-500 text-sm font-medium text-orange-600 dark:text-orange-500">Comments</button>
                        <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Description</button>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-[#222] rounded-md p-4 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333] transition-colors duration-300">
                        <p className="text-slate-500 dark:text-slate-400 mb-4 text-xs">report, and we&apos;ll be happy to assist you further. Thank you for your understanding!</p>
                        
                        <div className="flex gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-medium shrink-0 shadow-sm">M</div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-slate-900 dark:text-slate-200">Me</span>
                              <span className="text-xs text-slate-500">July 21, 2025 at 10:00 AM</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 transition-colors duration-300">{selectedBug.description || "ok i stop using vpn thank you"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-slate-50 dark:bg-[#222] rounded-md border border-slate-200 dark:border-[#333] p-2 flex transition-colors duration-300">
                        <input 
                          type="text" 
                          placeholder="Type a comment..." 
                          className="bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-2 w-full outline-none"
                        />
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded bg-slate-200 dark:bg-[#333] transition-colors">
                            <Icons.Upload />
                          </button>
                          <button className="px-4 py-1.5 bg-[#c2410c] text-white text-sm font-medium rounded hover:bg-[#9a3412] shadow-sm transition-colors">
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Overlay for Drawer */}
          {isDrawerOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}
      </div>
    </div>
  );
}

