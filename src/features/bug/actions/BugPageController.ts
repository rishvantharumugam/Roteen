"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
import { supabase } from '@/lib/supabase/client';
import { ensureUserRecord } from "@/features/auth/services/AuthService";
import {
  BUG_TABLE,
  bugSelectColumns,
  defaultFormState,
  generateId,
  getBugStatus,
  getSafeFileName,
  readFileAsDataUrl,
  type BugFormState,
  type BugRecord,
} from "@/features/bug/services/BugPageService";

export function useBugPageController() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [bugs, setBugs] = useState<BugRecord[]>([]);
  const [form, setForm] = useState<BugFormState>(defaultFormState);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view">("create");
  const [selectedBug, setSelectedBug] = useState<BugRecord | null>(null);

  const openBugCount = bugs.filter((bug) => getBugStatus(bug.status) === "Not open").length;
  const inProgressBugCount = bugs.filter((bug) => getBugStatus(bug.status) === "In Progress").length;
  const resolvedBugCount = bugs.filter((bug) => getBugStatus(bug.status) === "Resolved").length;

  useEffect(() => {
    async function loadBugPage() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(appRoutes.home);
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
  }, [router]);

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
    const bugId = generateId();

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

  return {
    bugs,
    drawerMode,
    form,
    handleImageUpload,
    handleSubmit,
    inProgressBugCount,
    isDrawerOpen,
    isLoading,
    isPriorityOpen,
    isSubmitting,
    openBugCount,
    openCreateDrawer,
    openViewDrawer,
    resolvedBugCount,
    selectedBug,
    selectedImageName,
    setForm,
    setIsDrawerOpen,
    setIsPriorityOpen,
    setSubmitError,
    submitError,
  };
}
