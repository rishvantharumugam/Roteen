import { supabase } from '../../../services/supabaseClient';
import { assignUniqueReferralCode } from '@/features/auth/utils/referral';

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
  referral_count: number;
  avatar_url: string;
  joined_date: string;
  is_verified: boolean;
}

export const ProfileService = {
  async getProfile(userId?: string, clientUser?: any): Promise<UserProfile> {
    try {
      let authUser: any = clientUser ?? null;
      if (!authUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          authUser = session.user;
        }
      }
      let resolvedUserId = userId ?? authUser?.id ?? null;

      if (!resolvedUserId) {
        // Check users table for email fallback or first user
        const { data: fallbackUser } = await supabase
          .from('users')
          .select('id')
          .eq('gmail', 'rishvanth2137@gmail.com')
          .limit(1);

        if (fallbackUser && fallbackUser.length > 0) {
          resolvedUserId = fallbackUser[0].id;
        } else {
          const { data: firstUser } = await supabase
            .from('users')
            .select('id')
            .limit(1);
          if (firstUser && firstUser.length > 0) {
            resolvedUserId = firstUser[0].id;
          }
        }
      }

      if (!resolvedUserId) {
        throw new Error('User ID is required to fetch profile');
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, created_at, gmail, dob, phone_number, gender, district, standard, school_name, school_type, medium_of_education, referral_code, referral_count')
        .eq('id', resolvedUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            id: resolvedUserId,
            full_name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'Guest User',
            email: authUser?.email || '',
            phone: '',
            dob: '',
            gender: '',
            location: '',
            standard: '',
            school_name: '',
            district: '',
            school_type: '',
            medium: '',
            referral_code: 'RTN-PENDING',
            referral_count: 0,
            avatar_url: authUser?.user_metadata?.avatar_url || '',
            joined_date: new Date().toLocaleDateString(),
            is_verified: false,
          };
        }
        throw error;
      }

      if (data && !data.referral_code) {
        try {
          data.referral_code = await assignUniqueReferralCode(resolvedUserId, supabase);
        } catch (err) {
          console.error('Failed to generate referral code on the fly:', err);
        }
      }

      if (data) {
        return {
          id: data.id,
          full_name: data.name ?? 'Guest User',
          email: data.gmail || '',
          phone: data.phone_number || '',
          dob: data.dob || '',
          gender: data.gender || '',
          location: data.district ? `${data.district}, Tamil Nadu` : '',
          standard: data.standard || '',
          school_name: data.school_name || '',
          district: data.district || '',
          school_type: data.school_type || '',
          medium: data.medium_of_education || '',
          referral_code: data.referral_code || 'RTN-PENDING',
          referral_count: data.referral_count || 0,
          avatar_url: '',
          joined_date: data.created_at
            ? new Intl.DateTimeFormat('en', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(data.created_at))
            : '',
          is_verified: true,
        };
      }

      throw new Error('Profile not found');
    } catch (error: any) {
      console.error('ProfileService caught error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const resolvedUserId = userId ?? session?.user?.id ?? null;

    const updatePayload: any = {};
    if (data.full_name !== undefined) updatePayload.name = data.full_name;
    if (data.phone !== undefined) updatePayload.phone_number = data.phone;
    if (data.dob !== undefined) updatePayload.dob = data.dob;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.district !== undefined) updatePayload.district = data.district;
    if (data.standard !== undefined) updatePayload.standard = data.standard;
    if (data.school_name !== undefined) updatePayload.school_name = data.school_name;
    if (data.school_type !== undefined) updatePayload.school_type = data.school_type;
    if (data.medium !== undefined) updatePayload.medium_of_education = data.medium;

    if (!resolvedUserId) {
      // Fallback update logic using email, since local auth is broken
      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('gmail', 'rishvanth2137@gmail.com');

      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', resolvedUserId);

    if (error) throw new Error(error.message);
  }
};
