import React from 'react';
import { ProfileCard } from './ProfileCard';
import { ProfileInfoItem } from './ProfileInfoItem';
import { Mail, Calendar, Phone, User, MapPin, Edit2 } from 'lucide-react';
import { UserProfile } from '../services/profile.service';
import { ProfileButton } from './ProfileButton';

interface PersonalDetailsSectionProps {
  profile: UserProfile;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({ profile }) => {
  return (
    <ProfileCard className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Personal Details</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfoItem icon={<MapPin size={20} />} label="Location" value={profile.location} />
        <ProfileInfoItem icon={<Calendar size={20} />} label="Date of Birth" value={profile.dob} />
        <ProfileInfoItem icon={<Phone size={20} />} label="Mobile Number" value={profile.phone} />
        <ProfileInfoItem icon={<User size={20} />} label="Gender" value={profile.gender} />
        <div className="md:col-span-2">
          <ProfileInfoItem icon={<Mail size={20} />} label="Email" value={profile.email} />
        </div>
      </div>
    </ProfileCard>
  );
};
