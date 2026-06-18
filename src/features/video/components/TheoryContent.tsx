"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/lib/supabase/client';


interface TheoryContentProps {
  questionId: string | null;
  subjectId?: string | null;
  language: "English" | "Tamil";
  fullScreen?: boolean;
  type?: "theory" | "quick_revision";
}

const notesMetadataCache = new Map<string, any[]>();
const markdownCache = new Map<string, string>();

export default function TheoryContent({
  questionId,
  subjectId = null,
  language,
  fullScreen,
  type = "theory",
}: TheoryContentProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<boolean>(true);
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

      setLoading(true);
      setError(null);
      setTransitioning(true);

      try {
        const cacheKey = `${questionId}-${subjectId || 'no-subject'}`;
        let notesData = notesMetadataCache.get(cacheKey);

        if (!notesData) {
          let notesQuery = supabase
            .from("admin_notes")
            .select("note_url, path, answer_type")
            .eq("question_id", questionId);

          if (subjectId) {
            notesQuery = notesQuery.eq("subject_id", subjectId);
          }

          let { data, error: dbError } = await notesQuery;

          if (dbError && subjectId && (dbError.code === "PGRST204" || dbError.code === "42703")) {
            const fallbackResult = await supabase
              .from("admin_notes")
              .select("note_url, path, answer_type")
              .eq("question_id", questionId);
            data = fallbackResult.data;
            dbError = fallbackResult.error;
          }

          if (dbError) throw dbError;
          if (!data || data.length === 0) {
            throw new Error(`No ${type === "quick_revision" ? "quick revision" : "theory"} available`);
          }
          
          notesData = data;
          notesMetadataCache.set(cacheKey, data);
        }

        let matchedNote;
        if (type === "quick_revision") {
          const targetAnswerType = language === "English" ? "Eng quick_recall" : "Tam quick_recall";
          matchedNote = notesData.find((note: any) => note.answer_type === targetAnswerType);
        } else {
          const prefix = language === "English" ? "/E_" : "/T_";
          matchedNote = notesData.find(note => 
            note.path && note.path.includes(prefix) &&
            !(note.answer_type && note.answer_type.includes("quick_recall"))
          );
        }

        if (!matchedNote) {
          throw new Error(`No ${type === "quick_revision" ? "quick revision" : "theory"} available in ${language}`);
        }

        const rawUrl = matchedNote.note_url.replace("github.com", "raw.githubusercontent.com");
        const finalUrl = rawUrl.replace("/blob/", "/");

        let text = markdownCache.get(finalUrl);
        if (!text) {
          const response = await fetch(finalUrl);
          if (!response.ok) {
             throw new Error("Failed to load content");
          }
          text = await response.text();
          markdownCache.set(finalUrl, text);
        }
        
        if (mounted) {
          setContent(text);
          setContentVersion((previous) => previous + 1);
          setTransitioning(false);

          // Background prefetching of other related notes for instant toggling
          setTimeout(() => {
            notesData?.forEach((note: any) => {
              if (note && note.note_url) {
                const rUrl = note.note_url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
                if (rUrl && !markdownCache.has(rUrl)) {
                  fetch(rUrl)
                    .then(res => res.text())
                    .then(fetchedText => {
                      markdownCache.set(rUrl, fetchedText);
                    })
                    .catch(() => {});
                }
              }
            });
          }, 300);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load content";
        if (mounted) {
          setContent("");
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
  }, [language, questionId, subjectId, type]);

  if (questionId === null) {
    return (
      <div className="flex flex-1 h-full min-h-[350px] items-center justify-center text-base md:text-lg text-zinc-500">
        Select a question to view its {type === "quick_revision" ? "quick revision" : "theory"}.
      </div>
    );
  }

  if (loading && !content) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-1 h-full min-h-[350px] items-center justify-center text-base md:text-lg text-zinc-500">
        {error}
      </div>
    );
  }

  const markdownClasses = [
    "prose prose-invert prose-zinc max-w-none break-words w-full flex-1",
    fullScreen ? "prose-lg" : "prose-base",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${questionId}-${language}-${contentVersion}-${fullScreen}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={markdownClasses}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </motion.div>
    </AnimatePresence>
  );
}
