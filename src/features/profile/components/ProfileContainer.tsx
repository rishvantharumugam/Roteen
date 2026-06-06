import React from 'react';

export const ProfileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-black min-h-screen  font-sans pb-20 selection: selection:text-white">
      {children}
    </div>
  );
};
