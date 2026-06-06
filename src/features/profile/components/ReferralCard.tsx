'use client';
import React from 'react';
import { Copy } from 'lucide-react';
import { ProfileNavigation } from '../constants/profile.navigation';

interface ReferralCardProps {
  code: string;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ code }) => {
  return (
    <div className="bg-[#141414] border border-[#202024] rounded-xl p-4 w-72">
      <p className="text-[#A1A1AA] text-sm font-medium mb-3">Your Referral Code</p>
      <div className="flex items-center justify-between">
        <span className="text-[#8B5CF6] text-xl font-bold tracking-wider">{code}</span>
        <button 
          onClick={() => ProfileNavigation.copyReferralCode(code)}
          className="p-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] rounded-md transition-colors border border-[rgba(255,255,255,0.05)]"
        >
          <Copy size={16} className="text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
};
