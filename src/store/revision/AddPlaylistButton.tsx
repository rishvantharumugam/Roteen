import React from 'react';
import { Plus } from 'lucide-react';
import { revisionStyles } from '@/styles/revisionStyles';

interface AddPlaylistButtonProps {
  onClick: () => void;
}

export const AddPlaylistButton: React.FC<AddPlaylistButtonProps> = ({ onClick }) => {
  return (
    <div className={revisionStyles.fab} onClick={onClick}>
      <Plus size={28} strokeWidth={2} />
    </div>
  );
};

