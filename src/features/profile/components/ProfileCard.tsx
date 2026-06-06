import React from 'react';

interface ProfileCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`$"bg-[linear-gradient(180deg,#18181B_0%,#101010_100%)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out hover:-translate-y-1" ${className}`}>
      {children}
    </div>
  );
};
