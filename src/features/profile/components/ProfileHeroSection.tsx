import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { UserBadge } from './UserBadge';
import { ReferralCard } from './ReferralCard';
import { ProfileCard } from './ProfileCard';
import { ProfileButton } from './ProfileButton';
import { Calendar, Edit2 } from 'lucide-react';
import { UserProfile } from '../services/profile.service';

interface ProfileHeroSectionProps {
  profile: UserProfile;
}

export const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({ profile }) => {
  return (
    <ProfileCard className="flex flex-col md:flex-row items-center justify-between p-8">
      <div className="flex items-center gap-8">
        <ProfileAvatar src={profile.avatar_url} alt={profile.full_name} size={140} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-wide">{profile.full_name}</h1>
            {profile.is_verified && <UserBadge />}
          </div>
          <div className="flex items-center gap-2 text-[#A1A1AA] mt-2">
            <Calendar size={16} />
            <span className="text-sm">Joined {profile.joined_date}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6 md:mt-0">
        <ReferralCard code={profile.referral_code} />
      </div>
    </ProfileCard>
  );
};
