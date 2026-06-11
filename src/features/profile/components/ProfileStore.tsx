"use client";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileController } from "@/features/profile/actions/profile.controller";
import { EmptyState } from "@/features/profile/components/EmptyState";
import { LoadingSkeleton } from "@/features/profile/components/LoadingSkeleton";
import { EducationDetailsSection } from "@/features/profile/components/EducationDetailsSection";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { PersonalDetailsSection } from "@/features/profile/components/PersonalDetailsSection";
import { ProfileContainer } from "@/features/profile/components/ProfileContainer";
import { ProfileContentSection } from "@/features/profile/components/ProfileContentSection";
import { ProfileHeroSection } from "@/features/profile/components/ProfileHeroSection";
import { UpdateProfileSection } from "@/features/profile/components/UpdateProfileSection";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";

export function ProfileStore() {
  const { user } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useProfileController(user?.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <ProfileContainer>
      <DashboardHeader />
      <ProfileContentSection>
        {isLoading ? <LoadingSkeleton /> : null}
        {!isLoading && error ? (
          <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        {!isLoading && !error && !profile ? <EmptyState /> : null}
        {!isLoading && !error && profile ? (
          <>
            <ProfileHeroSection profile={profile} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PersonalDetailsSection profile={profile} onEdit={() => setIsEditModalOpen(true)} />
              <EducationDetailsSection profile={profile} onEdit={() => setIsEditModalOpen(true)} />
            </div>
            <UpdateProfileSection onUpdate={() => setIsEditModalOpen(true)} />
            
            {isEditModalOpen && (
              <EditProfileModal
                profile={profile}
                onClose={() => setIsEditModalOpen(false)}
                onSave={refreshProfile}
              />
            )}
          </>
        ) : null}
      </ProfileContentSection>
    </ProfileContainer>
  );
}
