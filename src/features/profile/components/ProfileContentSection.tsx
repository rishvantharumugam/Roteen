import React from 'react';

export const ProfileContentSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};
