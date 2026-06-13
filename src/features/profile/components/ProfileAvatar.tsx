import React from 'react';
import Image from 'next/image';

interface ProfileAvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ src, alt }) => {
  return (
    <div className="relative inline-block shrink-0 w-[90px] h-[90px] sm:w-[140px] sm:h-[140px]">
      <div 
        className="w-full h-full rounded-full p-[2px] bg-gradient-to-b from-[#8B5CF6] via-[#18181B] to-[#18181B]"
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#18181B] border-4 border-[#0A0A0A]">
          {src ? (
            <Image 
              src={src} 
              alt={alt} 
              fill
              sizes="(max-width: 640px) 90px, 140px"
              priority
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">👨🏻‍💻</span>
            </div>
          )}
        </div>
      </div>
      {/* Online indicator */}
      <div className="absolute bottom-1 right-1 sm:bottom-3 sm:right-3 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
    </div>
  );
};
