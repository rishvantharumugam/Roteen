import React from 'react';
import { Check } from 'lucide-react';

export const UserBadge: React.FC = () => {
  return (
    <div className="bg-[#7C3AED] rounded-full p-[2px] inline-flex items-center justify-center w-6 h-6">
      <Check size={14} className="text-white" strokeWidth={3} />
    </div>
  );
};
