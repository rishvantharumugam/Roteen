import React, { useState } from 'react';
import { Trash2, Pin, Video, Calendar, ClipboardList, Laptop, Atom, Dna, BarChart3, Brain, Globe, FlaskConical, BookOpen, Shuffle, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Playlist, GRADIENTS, ICONS } from '@/features/revision/components/revisionTypes';

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
}

const getRandomItem = (arr: string[], id: string) => {
  const index = id.charCodeAt(0) % arr.length;
  return arr[index];
};

const ICON_MAP: Record<string, any> = {
  "📋": ClipboardList,
  "💻": Laptop,
  "⚛️": Atom,
  "🧬": Dna,
  "📊": BarChart3,
  "🧠": Brain,
  "🌍": Globe,
  "🧪": FlaskConical,
  "📖": BookOpen,
  "🔀": Shuffle,
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onDelete, onTogglePin, onOpen }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const iconString = playlist.icon || getRandomItem(ICONS, playlist.id);
  const IconComponent = ICON_MAP[iconString] || Dna;

  return (
    <>
      <div
      className="group flex h-full min-h-[220px] w-full max-w-[240px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#121212] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(playlist.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(playlist.id);
        }
      }}
    >
      {/* Top Header: Dot & Actions */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="h-[7px] w-[7px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
        <div className="flex items-center gap-3">
          <Pin
            className={playlist.isPinned ? "h-[15px] w-[15px] cursor-pointer text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "h-[15px] w-[15px] cursor-pointer text-zinc-500 transition-colors hover:text-white"}
            fill={playlist.isPinned ? 'currentColor' : 'none'}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(playlist.id);
            }}
          />
        </div>
      </div>

      {/* Big Center Icon */}
      <div className="flex flex-1 items-center justify-center p-6 text-white transition-transform duration-300 group-hover:scale-105">
        <IconComponent size={42} strokeWidth={1.2} />
      </div>

      {/* Title & Trash */}
      <div className="flex items-start justify-between px-4 pb-4">
        <h3 className="line-clamp-2 pr-2 text-[15px] font-bold tracking-wide text-white">{playlist.title}</h3>
        <Trash2
          className="h-4 w-4 shrink-0 cursor-pointer text-red-500 transition-colors hover:text-red-400"
          onClick={(event) => {
            event.stopPropagation();
            setShowConfirmDelete(true);
          }}
        />
      </div>

      {/* Footer Details */}
      <div className="mt-auto border-t border-zinc-800 p-3 px-4">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-violet-400">
          <div className="flex items-center gap-1.5">
            <Video size={14} strokeWidth={2.2} />
            <span>{playlist.videoCount} Videos</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <Calendar size={14} strokeWidth={2.2} />
            <span>{playlist.date}</span>
          </div>
        </div>
      </div>
      </div>

      {showConfirmDelete ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }} role="presentation">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[440px] rounded-[16px] border border-white/10 bg-[#131313] p-5 md:p-6 shadow-[0_28px_80px_rgba(0,0,0,.6)] text-slate-100"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-2.5 rounded-full border border-white/10 bg-transparent">
                  <Trash2 size={18} className="text-gray-300" />
                </div>
                <h3 className="text-[19px] font-bold text-white tracking-wide">Delete Playlist</h3>
              </div>
              <button className="p-1.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition" onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <p className="text-[14px] text-gray-300 leading-relaxed">
                Are you sure you want to delete the playlist <br /><strong className="text-white text-[15px] mt-1 inline-block">{playlist.title}?</strong>
              </p>
              
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-300 leading-snug">
                  You will lose access to all videos saved in this playlist. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center w-full py-2.5 rounded-lg border border-white/10 bg-transparent text-[13px] font-bold text-white hover:bg-white/5 transition"
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }}
                type="button"
              >
                Go Back
              </button>
              <button
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-transparent bg-[#dc2626] hover:bg-[#b91c1c] text-[13px] font-bold text-white transition shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(false);
                  onDelete(playlist.id);
                }}
                type="button"
              >
                Yes, Delete Playlist
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
};

