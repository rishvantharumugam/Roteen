import React from 'react';
import { ChevronRight } from 'lucide-react';

interface UpdateButtonProps {
  onClick?: () => void;
}

export const UpdateButton: React.FC<UpdateButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-[#18181B] hover:bg-[#202024] text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-[rgba(255,255,255,0.05)] text-sm"
    >
      Update Information
      <ChevronRight size={16} className="text-[#A1A1AA]" />
    </button>
  );
};
