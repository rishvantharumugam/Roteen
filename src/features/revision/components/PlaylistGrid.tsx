import React from 'react';
import { Playlist } from '@/features/revision/components/revisionTypes';
import { PlaylistCard } from '@/features/revision/components/PlaylistCard';

interface PlaylistGridProps {
  playlists: Playlist[];
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete, onTogglePin, onOpen }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
      {playlists.map(playlist => (
        <PlaylistCard 
          key={playlist.id} 
          playlist={playlist} 
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};



