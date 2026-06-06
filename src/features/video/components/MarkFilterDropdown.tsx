"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface MarkFilterDropdownProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export default function MarkFilterDropdown({ options, selected, onChange }: MarkFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={containerRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-[#060810]/80 px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_4px_rgba(255,255,255,0.05)] backdrop-blur-md transition-all hover:border-purple-500/50 hover:text-white"
        whileTap={{ scale: 0.96 }}
      >
        <span className="relative z-10">{selected === "All" ? "All Marks" : selected}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10"
        >
          <ChevronDown className="h-3.5 w-3.5 text-purple-400/80 group-hover:text-purple-300" />
        </motion.div>
        
        {/* Subtle hover glow on trigger */}
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-purple-500/10 group-hover:to-violet-500/10" />
      </motion.button>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-white/10 bg-[#090c15]/90 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(124,58,237,0.15)] backdrop-blur-xl"
          >
            {/* Soft neon border gradient via pseudo-element wrapper */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-br from-purple-500/30 to-violet-500/30 [mask-composite:exclude] [mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] [-webkit-mask-clip:content-box,border-box]" />

            <div className="flex flex-col gap-1 relative z-10">
              {options.map((option, index) => {
                const isSelected = selected === option;

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleSelect(option)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {/* Selected state background and glow */}
                    {isSelected && (
                      <motion.div
                        layoutId="selectedMarkBackground"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-600/80 to-violet-600/80 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        {/* Flowing shimmer for selected item */}
                        <motion.div
                          className="absolute inset-0 w-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "150%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      </motion.div>
                    )}

                    <motion.span
                      animate={{ scale: isSelected ? 1.05 : 1 }}
                      className="relative z-10 drop-shadow-sm"
                    >
                      {option === "All" ? "All Marks" : option}
                    </motion.span>

                    {/* Tiny glowing spark indicator when selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
