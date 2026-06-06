
import { ProfileService, UserProfile } from '../services/profile.service';
import { useState, useEffect } from 'react';

export const useProfileController = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await ProfileService.getProfile();
        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  return { profile, isLoading, error };
};
