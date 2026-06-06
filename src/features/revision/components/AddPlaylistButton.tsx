import React from 'react';
import { Plus } from 'lucide-react';

interface AddPlaylistButtonProps {
  onClick: () => void;
}

export const AddPlaylistButton: React.FC<AddPlaylistButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-10 right-10 w-[56px] h-[56px] rounded-full border-[1.5px] border-white/20 bg-transparent flex items-center justify-center text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]" onClick={onClick}>
      <Plus size={28} strokeWidth={2} />
    </div>
  );
};

