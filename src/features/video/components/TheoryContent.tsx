"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { supabase } from '@/lib/supabase/client';


interface TheoryContentProps {
  questionId: string | null;
  subjectId?: string | null;
  language: "English" | "Tamil";
  fullScreen?: boolean;
  type?: "theory" | "quick_revision";
}

export default function TheoryContent({
  questionId,
  subjectId = null,
  language,
  fullScreen,
  type = "theory",
}: TheoryContentProps) {
  const currentCacheKey = questionId ? `roteen_${type}_${subjectId ?? "unknown"}_${questionId}_${language}` : null;

  const cachedContent = typeof window !== "undefined" && currentCacheKey ? localStorage.getItem(currentCacheKey) : null;

  const [content, setContent] = useState<string>(cachedContent || "");
  const [loading, setLoading] = useState<boolean>(!cachedContent);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<boolean>(!cachedContent);
  const [contentVersion, setContentVersion] = useState<number>(0);



  useEffect(() => {
    let mounted = true;

    const fetchTheory = async () => {
      if (questionId === null) {
         if (mounted) {
           setContent("");
           setError(null);
           setLoading(false);
           setTransitioning(false);
         }
         return;
      }

      if (!currentCacheKey) return;
      const cached = localStorage.getItem(currentCacheKey);

      if (cached) {
        if (mounted) {
          setContent(cached);
          setContentVersion((v) => v + 1);
          setLoading(false);
          setTransitioning(false);
        }
        return; // Already have cached content, no need to fetch again in this session
      }

      setLoading(true);
      setError(null);
      setTransitioning(true);

      try {
        let notesQuery = supabase
          .from("admin_notes")
          .select("note_url, path, answer_type")
          .eq("question_id", questionId);

        if (subjectId) {
          notesQuery = notesQuery.eq("subject_id", subjectId);
        }

        let { data: notesData, error: dbError } = await notesQuery;

        if (dbError && subjectId && (dbError.code === "PGRST204" || dbError.code === "42703")) {
          const fallbackResult = await supabase
            .from("admin_notes")
            .select("note_url, path, answer_type")
            .eq("question_id", questionId);
          notesData = fallbackResult.data;
          dbError = fallbackResult.error;
        }

        if (dbError) throw dbError;
        if (!notesData || notesData.length === 0) {
          throw new Error(`No ${type === "quick_revision" ? "quick revision" : "theory"} available`);
        }

        let matchedNote;
        if (type === "quick_revision") {
          const targetAnswerType = language === "English" ? "Eng quick_recall" : "Tam quick_recall";
          matchedNote = notesData.find((note: any) => note.answer_type === targetAnswerType);
        } else {
          const prefix = language === "English" ? "/E_" : "/T_";
          matchedNote = notesData.find(note => 
            note.path && note.path.includes(prefix)
          );
        }

        if (!matchedNote) {
          throw new Error(`No ${type === "quick_revision" ? "quick revision" : "theory"} available in ${language}`);
        }

        const rawUrl = matchedNote.note_url.replace("github.com", "raw.githubusercontent.com");
        const finalUrl = rawUrl.replace("/blob/", "/");

        const response = await fetch(finalUrl);
        if (!response.ok) {
           throw new Error("Failed to load content");
        }
        
        const text = await response.text();
        
        localStorage.setItem(currentCacheKey, text);

        if (mounted) {
          setContent(text);
          setContentVersion((previous) => previous + 1);
          setTransitioning(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load content";
        if (mounted) {
          setError(
            message.includes("No")
              ? message
              : "Failed to load content"
          );
          setTransitioning(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTheory();

    return () => { mounted = false; };
  }, [currentCacheKey, language, questionId, subjectId, type]);

  if (questionId === null) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a question to view its {type === "quick_revision" ? "quick revision" : "theory"}.
      </div>
    );
  }

  if (loading && !content) {
    return null;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        {error}
      </div>
    );
  }

  const markdownClasses = [
    "prose prose-invert prose-zinc max-w-none break-words",
    fullScreen ? "prose-lg" : "prose-base",
    transitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0 transition-all duration-200 ease-out",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      key={`${questionId}-${language}-${contentVersion}`}
      className={markdownClasses}
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  );
}
