import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { ReferralCard } from './ReferralCard';
import { ProfileCard } from './ProfileCard';
import { ProfileButton } from './ProfileButton';
import { Calendar, Edit2 } from 'lucide-react';
import { UserProfile } from '../services/profile.service';
import { BadgeSeal } from '@/features/refer/components/ReferEarnPage';

interface ProfileHeroSectionProps {
  profile: UserProfile;
}

export const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({ profile }) => {
  const latestBadge = profile.referral_count >= 100 ? "diamond"
    : profile.referral_count >= 50 ? "platinum"
    : profile.referral_count >= 25 ? "gold"
    : profile.referral_count >= 10 ? "silver"
    : profile.referral_count >= 5 ? "bronze"
    : null;

  return (
    <ProfileCard className="flex flex-col md:flex-row items-center justify-between p-5 sm:p-8">
      <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto">
        <ProfileAvatar src={profile.avatar_url} alt={profile.full_name} />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-wide truncate max-w-full" title={profile.full_name}>
              {profile.full_name}
            </h1>
            {latestBadge && <BadgeSeal tier={latestBadge} size="xs" achieved={true} />}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#A1A1AA] mt-1">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Joined {profile.joined_date}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6 md:mt-0 w-full md:w-auto">
        <ReferralCard code={profile.referral_code} />
      </div>
    </ProfileCard>
  );
};
