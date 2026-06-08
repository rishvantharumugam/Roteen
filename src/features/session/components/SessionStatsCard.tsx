import type { SessionStat } from "@/features/session/components/sessionStore";
import { motion } from "framer-motion";

type SessionStatsCardProps = {
  stat: SessionStat;
};

export function SessionStatsCard({ stat }: SessionStatsCardProps) {
  return (
    <motion.article
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-[#121212] shadow-[0_14px_40px_rgba(0,0,0,.34)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,.14)_50%,transparent_70%)] before:translate-x-[-140%] before:transition-transform before:duration-700 hover:before:translate-x-[140%]"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={`h-[3px] bg-gradient-to-r ${stat.accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[15px] font-medium text-slate-300">{stat.label}</p>
            <p className="mt-3 text-[42px] font-bold leading-none text-white">{stat.value}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
