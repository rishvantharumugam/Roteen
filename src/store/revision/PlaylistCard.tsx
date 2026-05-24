import React from 'react';
import { Trash2, Pin, Video, Calendar } from 'lucide-react';
import { Playlist, GRADIENTS, ICONS } from '@/store/revision/revisionTypes';
import { revisionStyles } from '@/styles/revisionStyles';

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

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onDelete, onTogglePin, onOpen }) => {
  const gradient = playlist.gradient || getRandomItem(GRADIENTS, playlist.id);
  const icon = playlist.icon || getRandomItem(ICONS, playlist.id);

  return (
    <div
      className={revisionStyles.card}
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
      {/* Gradient Background with Icon */}
      <div
        className={revisionStyles.cardGradientBg}
        style={{ backgroundImage: gradient }}
      >
        {/* Centered Icon */}
        <div className={revisionStyles.cardIconContainer}>
          <div className={revisionStyles.cardIcon}>{icon}</div>
        </div>
      </div>

      {/* Card Content */}
      <div className={revisionStyles.cardContent}>
        <div className={revisionStyles.cardHeader}>
          <h3 className={revisionStyles.cardTitle}>{playlist.title}</h3>
          <div className={revisionStyles.cardIcons}>
            <Trash2
              className={revisionStyles.cardIconAction}
              size={16}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(playlist.id);
              }}
            />
            <Pin
              className={playlist.isPinned ? revisionStyles.pinIconActive : revisionStyles.pinIconInactive}
              size={16}
              fill={playlist.isPinned ? 'currentColor' : 'none'}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin(playlist.id);
              }}
            />
          </div>
        </div>

        {/* Footer with Video Count and Date */}
        <div className={revisionStyles.cardFooter}>
          <div className={revisionStyles.cardFooterRow}>
            <Video size={14} />
            <span>{playlist.videoCount} Videos</span>
          </div>
          <div className={revisionStyles.cardFooterRow}>
            <Calendar size={14} />
            <span>{playlist.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
