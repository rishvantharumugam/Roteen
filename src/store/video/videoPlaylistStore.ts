"use client";

import { useSyncExternalStore } from "react";

export type VideoPlaylistContext = {
  playlistId: string;
  playlistTitle: string;
  questionIds: string[];
  subjectId: string | null;
  subjectTitle: string | null;
  subjectStandard: string | null;
};

let playlistContext: VideoPlaylistContext | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setVideoPlaylistContext(nextContext: VideoPlaylistContext | null): void {
  playlistContext = nextContext;
  notify();
}

export function getVideoPlaylistContext(): VideoPlaylistContext | null {
  return playlistContext;
}

export function subscribeVideoPlaylistContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useVideoPlaylistContext(): VideoPlaylistContext | null {
  return useSyncExternalStore(
    subscribeVideoPlaylistContext,
    getVideoPlaylistContext,
    () => null,
  );
}
