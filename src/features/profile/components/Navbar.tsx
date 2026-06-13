'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Moon, Bell, User, TrendingUp, Megaphone, Bug, MessageSquare, BookOpen, FileText, LogOut } from 'lucide-react';
import Link from 'next/link';
import { appRoutes } from '@/constants/AppRoutes';
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useAuth } from "@/providers/AuthProvider";

export const Navbar = () => {
  const { signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#000000]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center font-bold text-white text-xl">
          R
        </div>
        <span className="text-white font-bold text-xl tracking-wide">Roteen</span>
      </div>

      <div className="flex items-center gap-8 text-sm font-medium">
        <Link href={appRoutes.home} className="text-[#A1A1AA] hover:text-white transition-colors">Home</Link>
        <Link href={appRoutes.dashboard} className="bg-[#7C3AED] text-white px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)]">Dashboard</Link>
        <Link href={appRoutes.notes} className="text-[#A1A1AA] hover:text-white transition-colors">Notes</Link>
        <Link href={appRoutes.revision} className="text-[#A1A1AA] hover:text-white transition-colors">Revision</Link>
        <Link href={appRoutes.sessions} className="text-[#A1A1AA] hover:text-white transition-colors">Sessions</Link>
      </div>

      <div className="flex items-center gap-6 text-[#A1A1AA]">
        <button className="hover:text-white transition-colors"><Moon size={20} /></button>
        <NotificationDropdown />
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full border-2 border-[#7C3AED] overflow-hidden flex items-center justify-center bg-[#18181B] text-white text-sm font-bold hover:ring-2 hover:ring-[#7C3AED]/50 transition-all cursor-pointer"
          >
             RA
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-[#121212] border border-[#27272A] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#27272A] mb-2">
                <p className="text-sm font-medium text-white">Rishvanth K</p>
                <p className="text-xs text-[#A1A1AA]">rishvanth2137@gmail.com</p>
              </div>
              
              <Link href={appRoutes.profile} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <User size={16} /> Profile
              </Link>
              <Link href={appRoutes.dashboard} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <TrendingUp size={16} /> Progress
              </Link>
              <Link href={appRoutes.notifications} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <Bell size={16} /> Notifications
              </Link>
              <Link href={appRoutes.news} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <Megaphone size={16} /> News & Announcements
              </Link>
              
              <div className="h-px bg-[#27272A] my-2"></div>
              
              <Link href={appRoutes.bugReport} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <Bug size={16} /> Bug
              </Link>
              <Link href={appRoutes.feedback} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <MessageSquare size={16} /> Feedback
              </Link>
              <Link href={appRoutes.tutorial} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <BookOpen size={16} /> Tutorial
              </Link>
              <Link href={appRoutes.terms} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
                <FileText size={16} /> Terms & Conditions
              </Link>
              
              <div className="h-px bg-[#27272A] my-2"></div>
              
              <button
                onClick={async () => {
                  setIsDropdownOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
