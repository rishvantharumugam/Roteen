"use client";

import { ReactNode } from "react";

type RevealBlockProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function RevealBlock({ children, className = "", delayMs = 0 }: RevealBlockProps) {
  return (
    <section
      className={className}
      style={{
        opacity: 1,
        transform: "translateY(0)",
        transition: delayMs > 0 ? `opacity 280ms ease ${delayMs}ms, transform 280ms ease ${delayMs}ms` : undefined,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </section>
  );
}
