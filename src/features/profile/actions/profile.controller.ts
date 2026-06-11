
import { ProfileService, UserProfile } from '../services/profile.service';
import { useState, useEffect } from 'react';

export const useProfileController = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await ProfileService.getProfile(userId);
      setProfile(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return { profile, isLoading, error, refreshProfile: fetchProfile };
};
