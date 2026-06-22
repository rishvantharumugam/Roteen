"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import { type QuestionMode } from "@/features/video/services/video";

interface TheoryContentProps {
  questionId: string | null;
  subjectId?: string | null;
  language: "English" | "Tamil";
  fullScreen?: boolean;
  type?: "theory" | "quick_revision";
  mode: QuestionMode;
}

const markdownCache = new Map<string, string>();

export default function TheoryContent({
  questionId,
  subjectId = null,
  language,
  fullScreen,
  type = "theory",
  mode,
}: TheoryContentProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contentVersion, setContentVersion] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const fetchTheory = async () => {
      if (questionId === null) {
        if (mounted) {
          setContent("");
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cacheKey = `${questionId}-${mode}-${type}-${language}`;
        let text = markdownCache.get(cacheKey);

        if (!text) {
          const params = new URLSearchParams({
            questionId,
            mode,
            language,
            type,
          });
          const response = await fetch(`/api/admin-notes/content?${params.toString()}`);

          if (!response.ok) {
            throw new Error("No notes available");
          }

          const payload = await response.json() as { content?: string };
          text = payload.content ?? "";

          if (!text.trim()) {
            throw new Error("No notes available");
          }

          markdownCache.set(cacheKey, text);
        }

        if (mounted) {
          setContent(text);
          setContentVersion((previous) => previous + 1);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No notes available";
        if (mounted) {
          setContent("");
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTheory();

    return () => { mounted = false; };
  }, [language, questionId, subjectId, type, mode]);

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
