import React from 'react';

interface ProfileInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex bg-[#141414] border border-[#202024] rounded-xl p-4 items-center gap-4 hover:border-[rgba(255,255,255,0.08)] transition-colors duration-200">
      <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex shrink-0 items-center justify-center text-[#A855F7]">
        {icon}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[#A1A1AA] text-xs font-medium mb-1">{label}</span>
        <span className="text-white text-sm font-semibold truncate" title={value}>{value || '-'}</span>
      </div>
    </div>
  );
};
