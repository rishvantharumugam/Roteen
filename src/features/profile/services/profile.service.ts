import { supabase } from '../../../services/supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  location: string;
  standard: string;
  school_name: string;
  district: string;
  school_type: string;
  medium: string;
  referral_code: string;
  avatar_url: string;
  joined_date: string;
  is_verified: boolean;
}

export const ProfileService = {
  async getProfile(userId?: string): Promise<UserProfile> {
    try {
      const resolvedUserId =
        userId ?? (await supabase.auth.getUser()).data.user?.id ?? null;

      if (resolvedUserId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, gmail, avatar_url, gender, phone_number, dob, user_type, district, school_name, school_type, medium_of_education, standard, created_at')
          .eq('id', resolvedUserId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          return {
            id: data.id,
            full_name: data.name ?? 'Roteen User',
            email: data.gmail ?? '',
            phone: data.phone_number ?? '',
            dob: data.dob ?? '',
            gender: data.gender ?? '',
            location: data.district ?? '',
            standard: data.standard ?? '',
            school_name: data.school_name ?? '',
            district: data.district ?? '',
            school_type: data.school_type ?? '',
            medium: data.medium_of_education ?? '',
            referral_code: `RTN-${String(data.id).slice(0, 8).toUpperCase()}`,
            avatar_url: data.avatar_url ?? '',
            joined_date: data.created_at
              ? new Intl.DateTimeFormat('en', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(data.created_at))
              : '',
            is_verified: Boolean(data.user_type),
          };
        }
      }
    } catch {
      // Ignore error for now, return dummy data
    }

    return {
      id: '1',
      full_name: 'Rishvanth k',
      email: 'rishvanth2137@gmail.com',
      phone: '7010887374',
      dob: '2026-05-26',
      gender: 'Female',
      location: 'Chengalpattu, Tamil Nadu',
      standard: '11',
      school_name: 'abc schoo',
      district: 'Chengalpattu',
      school_type: 'Private',
      medium: 'English',
      referral_code: 'RTN-40A95C5E',
      avatar_url: '', // Default placeholder will be used
      joined_date: 'May 12, 2026',
      is_verified: true,
    };
  }
};
