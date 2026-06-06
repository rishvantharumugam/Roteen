import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabase } from '@/lib/supabase/client';
import { appRoutes } from "@/constants/AppRoutes";

const DUPLICATE_EMAIL_MESSAGE =
  "This email is already registered. Please log in with your existing account.";

export type UserProfileDetails = {
  fullName?: string;
  phone?: string;
  standard?: string;
  schoolType?: string;
  schoolName?: string;
  dob?: string;
  district?: string;
  gender?: string;
  medium?: string;
  userType?: string;
};

export type UserRecord = {
  id: string;
  name: string | null;
  gmail: string | null;
  avatar_url: string | null;
  gender: string | null;
  phone_number: string | null;
  dob: string | null;
  user_type: string | null;
  district: string | null;
  school_name: string | null;
  school_type: string | null;
  medium_of_education: string | null;
  standard: string | null;
  created_at: string | null;
};

type AuthResolution = {
  profile: UserRecord;
  route: string;
  isNewUser: boolean;
};

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizePhoneNumber(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits || null;
}

function normalizeDate(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata;
  const metadataName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    (typeof metadata.user_name === "string" && metadata.user_name.trim());

  if (metadataName) {
    return metadataName;
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "User";
}

function getAvatarUrl(user: User) {
  return normalizeOptionalText(
    typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : null,
  );
}

function isProfileCompleted(profile: UserRecord) {
  return Boolean(
    profile.phone_number &&
      profile.standard &&
      profile.school_name &&
      profile.school_type &&
      profile.dob &&
      profile.district &&
      profile.gender,
  );
}

function getProfileCompletionRoute(profile: UserRecord) {
  return isProfileCompleted(profile)
    ? appRoutes.dashboard
    : `${appRoutes.home}?auth=signUp&step=3`;
}

export async function getUserRecordById(
  userId: string,
  supabaseClient: SupabaseClient = supabase,
) {
  return supabaseClient
    .from("users")
    .select(
      "id, name, gmail, avatar_url, gender, phone_number, dob, user_type, district, school_name, school_type, medium_of_education, standard, created_at",
    )
    .eq("id", userId)
    .maybeSingle<UserRecord>();
}

async function isEmailAlreadyRegistered(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("gmail", email)
    .limit(1);

  if (error) {
    return { exists: false, error };
  }

  return { exists: (data?.length ?? 0) > 0, error: null };
}

export async function ensureUserRecord(
  user: User,
  supabaseClient: SupabaseClient = supabase,
) {
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      profile: null,
      isNewUser: false,
      error: new Error("Unable to read the account email address."),
    };
  }

  const { data: existingProfile, error: fetchError } = await getUserRecordById(
    user.id,
    supabaseClient,
  );

  if (fetchError) {
    return { profile: null, isNewUser: false, error: fetchError };
  }

  if (existingProfile) {
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from("users")
      .update({
        gmail: normalizedEmail,
        name: existingProfile.name ?? getDisplayName(user),
        avatar_url: existingProfile.avatar_url ?? getAvatarUrl(user),
      })
      .eq("id", user.id)
      .select(
        "id, name, gmail, avatar_url, gender, phone_number, dob, user_type, district, school_name, school_type, medium_of_education, standard, created_at",
      )
      .maybeSingle<UserRecord>();

    return {
      profile: updatedProfile ?? existingProfile,
      isNewUser: false,
      error: updateError,
    };
  }

  const payload = {
    id: user.id,
    gmail: normalizedEmail,
    name: getDisplayName(user),
    avatar_url: getAvatarUrl(user),
  };

  const { data: insertedProfile, error: insertError } = await supabaseClient
    .from("users")
    .insert(payload)
    .select(
      "id, name, gmail, avatar_url, gender, phone_number, dob, user_type, district, school_name, school_type, medium_of_education, standard, created_at",
    )
    .single<UserRecord>();

  return {
    profile: insertedProfile ?? null,
    isNewUser: true,
    error: insertError,
  };
}

export async function resolveAuthenticatedUser(
  user: User,
  supabaseClient: SupabaseClient = supabase,
): Promise<{ data: AuthResolution | null; error: Error | null }> {
  const { profile, isNewUser, error } = await ensureUserRecord(user, supabaseClient);

  if (error || !profile) {
    return { data: null, error: error ?? new Error("Unable to load your profile.") };
  }

  return {
    data: {
      profile,
      route: getProfileCompletionRoute(profile),
      isNewUser,
    },
    error: null,
  };
}

export async function getCurrentAuthResolution(
  supabaseClient: SupabaseClient = supabase,
) {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return { data: null, error: userError ?? new Error("No active session found.") };
  }

  return resolveAuthenticatedUser(user, supabaseClient);
}

export async function updateUserProfile(
  user: User,
  profile: UserProfileDetails,
  supabaseClient: SupabaseClient = supabase,
) {
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return { profile: null, error: new Error("Unable to read the account email address.") };
  }

  const payload = {
    id: user.id,
    gmail: normalizedEmail,
    name:
      normalizeOptionalText(profile.fullName) ||
      normalizeOptionalText(
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      ) ||
      getDisplayName(user),
    avatar_url: getAvatarUrl(user),
    phone_number: normalizePhoneNumber(profile.phone),
    standard: normalizeOptionalText(profile.standard),
    school_type: normalizeOptionalText(profile.schoolType),
    school_name: normalizeOptionalText(profile.schoolName),
    dob: normalizeDate(profile.dob),
    district: normalizeOptionalText(profile.district),
    gender: normalizeOptionalText(profile.gender),
    medium_of_education: normalizeOptionalText(profile.medium),
    user_type: normalizeOptionalText(profile.userType),
  };

  const { data, error } = await supabaseClient
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select(
      "id, name, gmail, avatar_url, gender, phone_number, dob, user_type, district, school_name, school_type, medium_of_education, standard, created_at",
    )
    .single<UserRecord>();

  return { profile: data ?? null, error };
}

function mapSignUpErrorMessage(message: string | undefined) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("email exists")
  ) {
    return DUPLICATE_EMAIL_MESSAGE;
  }

  return message ?? "Unable to create your account right now.";
}

export async function signInWithGoogle(redirectTo: string) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
}

export async function sendEmailVerificationOtp(email: string, redirectTo: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { error: new Error("Please enter your email address.") };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTo,
    },
  });

  return { error };
}

export async function sendExistingUserLoginOtp(email: string, redirectTo: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { error: new Error("Please enter your email address.") };
  }

  const { exists, error: lookupError } = await isEmailAlreadyRegistered(normalizedEmail);

  if (lookupError) {
    return { error: lookupError };
  }

  if (!exists) {
    return { error: new Error("No account found with this email. Please create an account first.") };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo,
    },
  });

  return { error };
}

export async function verifyEmailOtp(email: string, token: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  if (!normalizedEmail || normalizedToken.length < 6) {
    return {
      data: null,
      error: new Error("Enter the 6-digit verification code sent to your email."),
    };
  }

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: "email",
  });

  if (error) {
    return { data: null, error };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: new Error(userError?.message ?? "Unable to read your verified account."),
    };
  }

  return resolveAuthenticatedUser(user, supabase);
}

export async function saveVerifiedStudentProfile(profile: UserProfileDetails) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: new Error(userError?.message ?? "Please verify your email before continuing."),
    };
  }

  const { profile: updatedProfile, error } = await updateUserProfile(user, profile, supabase);

  if (error || !updatedProfile) {
    return { data: null, error: error ?? new Error("Unable to save your profile.") };
  }

  return {
    data: {
      profile: updatedProfile,
      route: appRoutes.dashboard,
      isNewUser: false,
    },
    error: null,
  };
}

export async function signUpWithProfile({
  email,
  fullName,
  phone,
  standard,
  schoolType,
  schoolName,
  dob,
  district,
  gender,
  mediumOfEducation,
  userType,
}: {
  email: string;
  fullName?: string;
  phone?: string;
  standard: string;
  schoolType: string;
  schoolName: string;
  dob: string;
  district: string;
  gender: string;
  mediumOfEducation: string;
  userType: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const { exists, error: duplicateCheckError } = await isEmailAlreadyRegistered(normalizedEmail);

  if (duplicateCheckError) {
    return { data: null, error: duplicateCheckError };
  }

  if (exists) {
    return { data: null, error: new Error(DUPLICATE_EMAIL_MESSAGE) };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      data: {
        full_name: normalizeOptionalText(fullName),
        phone_number: normalizePhoneNumber(phone),
        standard: normalizeOptionalText(standard),
        school_type: normalizeOptionalText(schoolType),
        school_name: normalizeOptionalText(schoolName),
        dob: normalizeDate(dob),
        district: normalizeOptionalText(district),
        gender: normalizeOptionalText(gender),
        medium_of_education: normalizeOptionalText(mediumOfEducation),
        user_type: normalizeOptionalText(userType),
      },
    },
  });

  if (error) {
    return {
      data,
      error: new Error(mapSignUpErrorMessage(error.message)),
    };
  }

  return { data, error: null };
}

