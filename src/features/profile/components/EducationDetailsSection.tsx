import React from 'react';
import { ProfileCard } from './ProfileCard';
import { ProfileInfoItem } from './ProfileInfoItem';
import { GraduationCap, Building2, Map, LayoutGrid, BookOpen, Edit2 } from 'lucide-react';
import { UserProfile } from '../services/profile.service';
import { ProfileButton } from './ProfileButton';

interface EducationDetailsSectionProps {
  profile: UserProfile;
}

export const EducationDetailsSection: React.FC<EducationDetailsSectionProps> = ({ profile }) => {
  return (
    <ProfileCard className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Education Details</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfoItem icon={<GraduationCap size={20} />} label="Standard" value={profile.standard} />
        <ProfileInfoItem icon={<BookOpen size={20} />} label="Medium of Study" value={profile.medium} />
        <ProfileInfoItem icon={<Map size={20} />} label="District" value={profile.district} />
        <ProfileInfoItem icon={<LayoutGrid size={20} />} label="School Type" value={profile.school_type} />
        <div className="md:col-span-2">
          <ProfileInfoItem icon={<Building2 size={20} />} label="School Name" value={profile.school_name} />
        </div>
      </div>
    </ProfileCard>
  );
};
