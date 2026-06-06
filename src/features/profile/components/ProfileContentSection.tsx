import React from 'react';

export const ProfileContentSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6">
      {children}
    </div>
  );
};
