import React from 'react';
import { Playlist } from '@/features/revision/components/revisionTypes';
import { PlaylistCard } from '@/features/revision/components/PlaylistCard';
import { BookOpen } from 'lucide-react';

interface PlaylistGridProps {
  playlists: Playlist[];
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
  onAddPlaylist?: () => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete, onTogglePin, onOpen, onAddPlaylist }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
      {playlists.length === 0 ? (
        <div 
          className="group flex h-full min-h-[220px] w-full max-w-[240px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#121212] opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onAddPlaylist}
        >
          <div className="flex items-center justify-between p-4 pb-0">
            <div className="h-[7px] w-[7px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          </div>
          <div className="flex flex-1 items-center justify-center p-6 text-white opacity-50">
            <BookOpen size={42} strokeWidth={1.2} />
          </div>
          <div className="flex items-start justify-between px-4 pb-4">
            <h3 className="line-clamp-2 pr-2 text-[15px] font-bold tracking-wide text-white">Sample Playlist</h3>
          </div>
          <div className="mt-auto border-t border-zinc-800 p-3 px-4">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-violet-400">
              <span>0 Videos</span>
              <div className="h-3 w-px bg-zinc-800" />
              <span className="truncate ml-1">Create Playlist</span>
            </div>
          </div>
        </div>
      ) : (
        playlists.map(playlist => (
          <PlaylistCard 
            key={playlist.id} 
            playlist={playlist} 
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onOpen={onOpen}
          />
        ))
      )}
    </div>
  );
};



