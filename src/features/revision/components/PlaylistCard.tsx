import React from 'react';
import { Trash2, Pin, Video, Calendar, ClipboardList, Laptop, Atom, Dna, BarChart3, Brain, Globe, FlaskConical, BookOpen, Shuffle } from 'lucide-react';
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
  const iconString = playlist.icon || getRandomItem(ICONS, playlist.id);
  const IconComponent = ICON_MAP[iconString] || Dna;

  return (
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
            onDelete(playlist.id);
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
  );
};

