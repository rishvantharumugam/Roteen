import React from 'react';
import { Shield } from 'lucide-react';
import { UpdateButton } from './UpdateButton';

export const UpdateProfileSection: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  return (
    <div className="bg-[#141414] border border-[#202024] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center border border-[rgba(124,58,237,0.2)]">
          <Shield size={32} className="text-[#8B5CF6]" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-lg font-bold tracking-wide">Keep your profile updated</h3>
          <p className="text-[#A1A1AA] text-sm">
            This helps us personalize your learning experience and provide better recommendations.
          </p>
        </div>
      </div>
      <UpdateButton onClick={onUpdate} />
    </div>
  );
};
