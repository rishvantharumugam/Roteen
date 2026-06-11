import React from 'react';
import { ProfileCard } from './ProfileCard';
import { ProfileInfoItem } from './ProfileInfoItem';
import { Mail, Calendar, Phone, User, MapPin, Edit2 } from 'lucide-react';
import { UserProfile } from '../services/profile.service';
import { ProfileButton } from './ProfileButton';

interface PersonalDetailsSectionProps {
  profile: UserProfile;
  onEdit?: () => void;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({ profile, onEdit }) => {
  return (
    <ProfileCard className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Personal Details</h2>
        <ProfileButton onClick={onEdit} icon={Edit2} variant="ghost" className="px-4 py-1.5 text-sm border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-white">Edit</ProfileButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfoItem icon={<Mail size={20} />} label="Email" value={profile.email} />
        <ProfileInfoItem icon={<Calendar size={20} />} label="Date of Birth" value={profile.dob} />
        <ProfileInfoItem icon={<Phone size={20} />} label="Mobile Number" value={profile.phone} />
        <ProfileInfoItem icon={<User size={20} />} label="Gender" value={profile.gender} />
        <div className="md:col-span-2">
          <ProfileInfoItem icon={<MapPin size={20} />} label="Location" value={profile.location} />
        </div>
      </div>
    </ProfileCard>
  );
};
