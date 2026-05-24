"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();
let nowValue = Date.now();
let intervalId: number | null = null;

function startTimerIfNeeded() {
  if (intervalId !== null) {
    return;
  }

  intervalId = window.setInterval(() => {
    nowValue = Date.now();
    listeners.forEach((listener) => listener());
  }, 1000);
}

function stopTimerIfIdle() {
  if (listeners.size > 0 || intervalId === null) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = null;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  startTimerIfNeeded();

  return () => {
    listeners.delete(listener);
    stopTimerIfIdle();
  };
}

function getSnapshot() {
  return nowValue;
}

export function useSharedNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

