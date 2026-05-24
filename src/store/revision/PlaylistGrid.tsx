import React from 'react';
import { Playlist } from '@/store/revision/revisionTypes';
import { PlaylistCard } from '@/store/revision/PlaylistCard';
import { revisionStyles } from '@/styles/revisionStyles';

interface PlaylistGridProps {
  playlists: Playlist[];
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete, onTogglePin, onOpen }) => {
  return (
    <div className={revisionStyles.grid}>
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



