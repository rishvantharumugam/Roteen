import React from 'react';
import Image from 'next/image';

interface ProfileAvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ src, alt, size = 120 }) => {
  return (
    <div className="relative inline-block">
      <div 
        className="rounded-full p-[2px] bg-gradient-to-b from-[#8B5CF6] via-[#18181B] to-[#18181B]"
        style={{ width: size, height: size }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#18181B] border-4 border-[#0A0A0A]">
          {src ? (
            <Image 
              src={src} 
              alt={alt} 
              fill
              sizes={`${size}px`}
              priority
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-4xl">👨🏻‍💻</span>
            </div>
          )}
        </div>
      </div>
      {/* Online indicator */}
      <div className="absolute bottom-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
    </div>
  );
};
