"use client";

import { useEffect, useState, useRef } from "react";
import { useInView, useSpring } from "framer-motion";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function NumberTicker({
  value,
  suffix = "",
  duration = 2000, // in ms
  className = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <span ref={ref} className={className}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
