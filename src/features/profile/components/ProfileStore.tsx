"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { user, isLoading: isAuthLoading, openLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/dashboard");
      openLoginModal("/profile");
    }
  }, [user, isAuthLoading, router, openLoginModal]);

  const { profile, isLoading: isProfileLoading, error, refreshProfile } = useProfileController(user?.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="0" strokeLinecap="round" />
          </svg>
          <p className="text-[14px] text-zinc-400 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  const isLoading = isProfileLoading;

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
              <PersonalDetailsSection profile={profile} />
              <EducationDetailsSection profile={profile} />
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
