import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ 
  icon: Icon, 
  variant = 'secondary', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm";
  
  const variants = {
    primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
    secondary: "bg-[#18181B] hover:bg-[#202024] text-white border border-[#27272A]",
    ghost: "bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-[#A1A1AA] hover:text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};
