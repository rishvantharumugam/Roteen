"use client";

// Refreshed to trigger Next.js compilation and flush cached amounts
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Info,
  Share2,
  UserCheck,
  Users,
  Clock,
  Award,
  Medal,
  Trophy,
  Crown,
  Gem,
  Shield,
  Lock,
  X,
} from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileService } from "@/features/profile/services/profile.service";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const fallbackReferralCode = "RTN-WY4M5BUJ";

const milestonesBase = [
  { referrals: 5, label: "Bronze Badge", color: "from-[#B66B2F] to-[#F2B56B]", tier: "bronze" },
  { referrals: 10, label: "Silver Badge", color: "from-zinc-200 to-zinc-500", tier: "silver" },
  { referrals: 25, label: "Gold Badge", color: "from-[#FFE082] to-[#F59E0B]", tier: "gold" },
  { referrals: 50, label: "Platinum Badge", color: "from-[#A5B4FC] to-[#818CF8]", tier: "platinum" },
  { referrals: 100, label: "Diamond Badge", color: "from-[#CFFAFE] to-[#06B6D4]", tier: "diamond" },
] as const;

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getToneGradient(name: string | null): string {
  const tones = [
    "from-orange-200 to-slate-200",
    "from-pink-300 to-zinc-200",
    "from-blue-300 to-violet-300",
    "from-amber-200 to-zinc-200",
    "from-teal-200 to-emerald-200",
    "from-indigo-200 to-purple-200",
  ];
  if (!name) return tones[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return tones[sum % tones.length];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date); // e.g. "17 Jun 2026"
  } catch (e) {
    return dateStr;
  }
}
export function BadgeSeal({ tier, size = "md", achieved = true }: { tier: string; size?: "xs" | "sm" | "md" | "lg"; achieved?: boolean }) {
  const config: Record<
    string,
    {
      bg: string;
      border: string;
      glow: string;
      icon: typeof Award | typeof Medal | typeof Trophy | typeof Crown | typeof Gem | typeof Shield;
      iconColor: string;
      extraClass?: string;
      startColor: string;
      endColor: string;
      innerBg: string;
      ribbonStart: string;
      ribbonEnd: string;
      svgGlow: string;
    }
  > = {
    bronze: {
      bg: "from-[#8B4513] via-[#B66B2F] to-[#F4A460]",
      border: "border-[#CD853F]/40",
      glow: "shadow-[0_4px_12px_rgba(182,107,47,0.35)]",
      icon: Award,
      iconColor: "text-[#FFE4C4]",
      startColor: "#B66B2F",
      endColor: "#F2B56B",
      innerBg: "#3F2512",
      ribbonStart: "#EC4899", // Pink
      ribbonEnd: "#BE185D",
      svgGlow: "drop-shadow-[0_4px_10px_rgba(182,107,47,0.4)]",
    },
    silver: {
      bg: "from-[#4B5563] via-[#9CA3AF] to-[#E5E7EB]",
      border: "border-zinc-400/40",
      glow: "shadow-[0_4px_12px_rgba(156,163,175,0.3)]",
      icon: Medal,
      iconColor: "text-zinc-100",
      startColor: "#9CA3AF",
      endColor: "#E5E7EB",
      innerBg: "#27272A",
      ribbonStart: "#0284C7", // Blue
      ribbonEnd: "#0369A1",
      svgGlow: "drop-shadow-[0_4px_10px_rgba(156,163,175,0.35)]",
    },
    gold: {
      bg: "from-[#9A3412] via-[#F59E0B] to-[#FEF08A]",
      border: "border-[#FBBF24]/40",
      glow: "shadow-[0_4px_12px_rgba(245,158,11,0.4)]",
      icon: Trophy,
      iconColor: "text-[#FEF08A]",
      startColor: "#F59E0B",
      endColor: "#FEF08A",
      innerBg: "#451A03",
      ribbonStart: "#DC2626", // Red
      ribbonEnd: "#991B1B",
      svgGlow: "drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]",
    },
    platinum: {
      bg: "from-[#312E81] via-[#6366F1] to-[#C7D2FE]",
      border: "border-[#818CF8]/40",
      glow: "shadow-[0_4px_12px_rgba(99,102,241,0.4)]",
      icon: Crown,
      iconColor: "text-[#E0E7FF]",
      startColor: "#6366F1",
      endColor: "#C7D2FE",
      innerBg: "#1E1B4B",
      ribbonStart: "#7C3AED", // Violet
      ribbonEnd: "#5B21B6",
      svgGlow: "drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]",
    },
    diamond: {
      bg: "from-[#0E7490] via-[#06B6D4] to-[#CFFAFE]",
      border: "border-[#22D3EE]/40",
      glow: "shadow-[0_4px_16px_rgba(6,182,212,0.5)]",
      icon: Gem,
      iconColor: "text-[#ECFEFF]",
      extraClass: "animate-pulse",
      startColor: "#06B6D4",
      endColor: "#CFFAFE",
      innerBg: "#083344",
      ribbonStart: "#06B6D4", // Cyan
      ribbonEnd: "#0891B2",
      svgGlow: "drop-shadow-[0_4px_16px_rgba(6,182,212,0.6)]",
    },
    badge: {
      bg: "from-[#5B21B6] via-[#7C3AED] to-[#DDD6FE]",
      border: "border-[#A78BFA]/40",
      glow: "shadow-[0_4px_12px_rgba(124,58,237,0.35)]",
      icon: Shield,
      iconColor: "text-[#F5F3FF]",
      startColor: "#7C3AED",
      endColor: "#DDD6FE",
      innerBg: "#2E1065",
      ribbonStart: "#475569", // Slate
      ribbonEnd: "#334155",
      svgGlow: "drop-shadow-[0_4px_10px_rgba(124,58,237,0.4)]",
    }
  };

  const current = config[tier as keyof typeof config] || config.badge;
  const IconComponent = current.icon;

  const sizeClasses = {
    xs: "w-7 h-[32px]",
    sm: "w-12 h-[55px]",
    md: "w-16 h-[74px]",
    lg: "w-24 h-[110px]",
  };

  const gradId = `badge-grad-${tier}-${size}`;
  const ribbonGradId = `ribbon-grad-${tier}-${size}`;

  // Programmatic generation of 30-scallop rosette path
  const rosettePath = useMemo(() => {
    const points = 30; // More points for fine scalloped edge
    const cx = 50;
    const cy = 46; // slightly shifted up to balance ribbon height
    const rInner = 37;
    const rOuter = 40;
    let d = "";

    for (let i = 0; i < points; i++) {
      const angle1 = (i * 2 * Math.PI) / points;
      const angle2 = ((i + 0.5) * 2 * Math.PI) / points;
      const angle3 = (((i + 1) * 2 * Math.PI) / points);

      const x1 = (cx + rInner * Math.cos(angle1)).toFixed(2);
      const y1 = (cy + rInner * Math.sin(angle1)).toFixed(2);
      const x2 = (cx + rOuter * Math.cos(angle2)).toFixed(2);
      const y2 = (cy + rOuter * Math.sin(angle2)).toFixed(2);
      const x3 = (cx + rInner * Math.cos(angle3)).toFixed(2);
      const y3 = (cy + rInner * Math.sin(angle3)).toFixed(2);

      if (i === 0) {
        d += `M ${x1} ${y1}`;
      }
      d += ` Q ${x2} ${y2} ${x3} ${y3}`;
    }
    return d + " Z";
  }, []);

  const startColor = achieved ? current.startColor : "#27272A"; // zinc-800
  const endColor = achieved ? current.endColor : "#18181B";     // zinc-900
  const ribbonStart = achieved ? current.ribbonStart : "#3F3F46"; // zinc-700
  const ribbonEnd = achieved ? current.ribbonEnd : "#18181B";     // zinc-900
  const innerBg = achieved ? current.innerBg : "#09090B";         // zinc-950
  const iconColor = achieved ? current.iconColor : "text-zinc-600";

  const opacityClass = achieved ? "" : "opacity-65";
  const glowShadow = achieved ? current.svgGlow : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]";
  const pulseClass = (achieved && current.extraClass) ? current.extraClass : "";

  const lockSizes = {
    xs: "h-2 w-2",
    sm: "h-3.5 w-3.5",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
  };
  const lockIconSizes = {
    xs: 5,
    sm: 7,
    md: 9,
    lg: 12,
  };

  const displayName = tier.charAt(0).toUpperCase() + tier.slice(1) + " Badge";

  return (
    <div
      className={`group relative shrink-0 flex items-center justify-center ${pulseClass} ${opacityClass} ${sizeClasses[size]}`}
      title={displayName}
    >
      <svg
        className={`w-full h-full ${glowShadow}`}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          <linearGradient id={ribbonGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ribbonStart} />
            <stop offset="100%" stopColor={ribbonEnd} />
          </linearGradient>
        </defs>

        {/* Center Ribbon (behind) */}
        <path d="M 42 60 L 40 112 L 50 102 L 60 112 L 58 60 Z" fill={`url(#${ribbonGradId})`} />

        {/* Left Ribbon (in front of center) */}
        <path d="M 30 60 L 14 108 L 24 98 L 36 108 L 44 60 Z" fill={`url(#${ribbonGradId})`} />

        {/* Right Ribbon (in front of center) */}
        <path d="M 56 60 L 64 108 L 76 98 L 86 108 L 70 60 Z" fill={`url(#${ribbonGradId})`} />

        {/* Rosette outer scalloped ring */}
        <path d={rosettePath} fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Rosette inner outline */}
        <circle cx="50" cy="46" r="33" fill="none" stroke={achieved ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.05)"} strokeWidth="1" />
        <circle cx="50" cy="46" r="31" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        <circle cx="50" cy="46" r="30" fill={innerBg} stroke={achieved ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.02)"} strokeWidth="1" />

        {/* Inner circle photo/icon container */}
        <circle cx="50" cy="46" r="23" fill={`${innerBg}`} className={achieved ? "brightness-125" : ""} />
      </svg>

      {/* Floating React Lucide Icon centered over the inner circle */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <IconComponent
          className={`${iconColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]`}
          size={size === "lg" ? 32 : size === "md" ? 22 : size === "sm" ? 16 : 10}
        />
      </div>

      {/* Dynamic Lock overlay for locked/unachieved badges */}
      {!achieved && (
        <div className={`absolute top-[50%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex ${lockSizes[size]} items-center justify-center rounded-full bg-zinc-950 border border-zinc-700/60 shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
          <Lock className="text-zinc-400" size={lockIconSizes[size]} />
        </div>
      )}
    </div>
  );
}
export function ReferEarnPage() {
  const { user } = useAuth();
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>(fallbackReferralCode);
  const [referredPeopleList, setReferredPeopleList] = useState<Array<{
    id: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const dynamicMilestones = useMemo(() => {
    return milestonesBase.map((m) => ({
      ...m,
      completed: referralCount >= m.referrals,
      progress: Math.min(referralCount, m.referrals),
    }));
  }, [referralCount]);

  const referralLink = useMemo(() => `https://roteen.app/refer/${referralCode}`, [referralCode]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setError(null);

      // Fetch user's own referral code & referred people in parallel to reduce load time
      const [ownResult, referralsResult] = await Promise.all([
        supabase
          .from("users")
          .select("referral_code, referral_count")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("users")
          .select("id, name, avatar_url, created_at")
          .eq("referred_by", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (ownResult.error) throw ownResult.error;
      if (referralsResult.error) throw referralsResult.error;

      if (ownResult.data) {
        setReferralCount(ownResult.data.referral_count || 0);
        setReferralCode(ownResult.data.referral_code || fallbackReferralCode);
      }

      if (referralsResult.data) {
        setReferredPeopleList(referralsResult.data);
      }
    } catch (err: any) {
      console.error("Error fetching referral data:", err);
      setError(err.message || "Failed to load referral details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    void fetchData();

    // Supabase Realtime subscription
    // Listener 1: updates to own user row
    // Listener 2: updates to users referred by us
    const channel = supabase
      .channel(`referral-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newUser = payload.new as any;
            setReferralCount(newUser.referral_count || 0);
            if (newUser.referral_code) {
              setReferralCode(newUser.referral_code);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `referred_by=eq.${user.id}`,
        },
        (payload) => {
          void fetchData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy code:", err);
      toast.error("Failed to copy referral code");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy referral link");
    }
  };

  const handleShareLink = async () => {
    const shareData = {
      title: "Join me on Roteen!",
      text: `Use my referral code ${referralCode} to sign up on Roteen!`,
      url: referralLink,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
          await handleCopyLink();
        }
      }
    } else {
      await handleCopyLink();
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-xl border border-red-900 bg-red-950/20 p-4 text-red-200">
        <p className="font-semibold">Error loading referral data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <section className="grid rounded-xl border border-zinc-800 bg-[linear-gradient(110deg,rgba(18,18,24,0.96),rgba(8,8,11,0.98))] p-4 sm:p-6 lg:p-8 shadow-[0_0_40px_rgba(124,58,237,0.12)] lg:grid-cols-[auto_auto_1fr_auto_1.05fr]">
          {/* Total Referrals — first */}
          <div className="flex flex-col items-center justify-center gap-2 text-center py-2 w-full min-w-0 mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED]/20">
              <Users className="h-7 w-7 text-[#8B5CF6]" />
            </div>
            <p className="mt-2 text-sm font-medium text-zinc-300">Total Referrals</p>
            {loading ? (
              <div className="h-10 w-12 animate-pulse rounded bg-zinc-800 mx-auto mt-1" />
            ) : (
              <p className="text-4xl font-black text-[#8B5CF6]">{referralCount}</p>
            )}
            <p className="text-xs text-zinc-500">All time</p>
          </div>

          <div className="my-4 h-px bg-zinc-800 lg:mx-10 lg:my-0 lg:h-full lg:w-px" />

          <div className="py-2 w-full min-w-0">
            <p className="mb-4 text-base sm:text-lg text-zinc-200">Your Referral Code</p>
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className="flex-1 min-w-0 rounded-lg bg-[#120d1d] px-3.5 py-3 sm:px-5 sm:py-4">
                {loading ? (
                  <div className="h-8 w-24 sm:h-10 sm:w-32 animate-pulse rounded bg-zinc-800" />
                ) : (
                  <p className="truncate text-lg sm:text-2xl lg:text-3xl font-black text-[#8B5CF6] text-center">{referralCode}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex h-11 w-11 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#1B122D] text-zinc-200 transition hover:bg-[#2A1948] hover:text-white cursor-pointer"
                aria-label="Copy referral code"
                disabled={loading}
              >
                <Copy className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          <div className="my-4 h-px bg-zinc-800 lg:mx-10 lg:my-0 lg:h-full lg:w-px" />

          <div className="py-2 w-full min-w-0">
            <p className="mb-4 text-sm text-zinc-200">Share your referral link</p>
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-[#131019] px-3 py-3 sm:px-4 sm:py-4 text-[#C084FC] text-[11px] sm:text-sm lg:text-base">
                {loading ? (
                  <div className="h-5 w-36 sm:h-6 sm:w-48 animate-pulse rounded bg-zinc-800" />
                ) : (
                  <p className="truncate">{referralLink}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#1B122D] text-zinc-200 transition hover:bg-[#2A1948] hover:text-white cursor-pointer"
                aria-label="Copy referral link"
                disabled={loading}
              >
                <Copy className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleShareLink}
              className="mt-4 inline-flex items-center gap-3 rounded-lg bg-linear-to-r from-[#7C3AED] to-[#9333EA] px-6 py-2.5 sm:px-7 sm:py-3 font-semibold text-white shadow-[0_16px_36px_rgba(124,58,237,0.28)] transition hover:brightness-110 w-full sm:w-auto justify-center cursor-pointer text-sm sm:text-base"
              disabled={loading}
            >
              <Share2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              Share Referral Link
            </button>
          </div>
        </section>


        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-xl border border-zinc-800 bg-[#101114] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
            <h2 className="mb-6 text-2xl font-bold">People You Referred</h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-800 scrollbar-thin">
              <table className="w-full min-w-full border-collapse text-left">
                <thead className="bg-white/[0.03] text-[11px] sm:text-sm text-zinc-200">
                  <tr>
                    <th className="px-4 py-3 sm:px-7 sm:py-4 font-medium">Username</th>
                    <th className="px-3 py-3 sm:px-4 sm:py-4 font-medium">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="border-t border-zinc-800">
                        <td className="px-4 py-3 sm:px-7 sm:py-4">
                          <div className="h-4 w-24 sm:w-32 animate-pulse rounded bg-zinc-800" />
                        </td>
                        <td className="px-3 py-3 sm:px-4 sm:py-4">
                          <div className="h-4 w-16 sm:w-24 animate-pulse rounded bg-zinc-800" />
                        </td>
                      </tr>
                    ))
                  ) : referredPeopleList.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 sm:px-7 sm:py-8 text-center text-zinc-500 font-medium text-xs sm:text-sm">
                        No referrals yet
                      </td>
                    </tr>
                  ) : (
                    referredPeopleList.map((person) => (
                      <tr key={person.id} className="border-t border-zinc-800 text-xs sm:text-sm">
                        <td className="px-4 py-3 sm:px-7 sm:py-4 font-medium text-white break-all">{person.name || "Anonymous User"}</td>
                        <td className="px-3 py-3 sm:px-4 sm:py-4 text-zinc-200 whitespace-nowrap">{formatDate(person.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-[#101114] p-4 sm:p-6 shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
            <h2 className="mb-6 text-xl sm:text-2xl font-bold">Referral Milestones</h2>
            <div className="space-y-3">
              {dynamicMilestones.map((milestone) => {
                const progress = milestone.completed ? 100 : (milestone.progress / milestone.referrals) * 100;
                return (
                  <div key={milestone.referrals} className="rounded-lg border border-zinc-800 bg-white/[0.02] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="block sm:hidden">
                        <BadgeSeal tier={milestone.tier} size="sm" achieved={milestone.completed} />
                      </div>
                      <div className="hidden sm:block">
                        <BadgeSeal tier={milestone.tier} size="md" achieved={milestone.completed} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm sm:text-lg font-bold ${milestone.completed ? "text-white" : "text-zinc-300"}`}>{milestone.referrals} Referrals</p>
                        <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${milestone.completed ? "text-zinc-300" : "text-zinc-500"}`}>{milestone.label}</p>
                      </div>
                      <div className="shrink-0">
                        {milestone.completed ? (
                          <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-emerald-300">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-zinc-400">
                            <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-zinc-500" />
                            {milestone.referrals - referralCount} more
                          </span>
                        )}
                      </div>
                    </div>
                    {!milestone.completed && (
                      <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-linear-to-r from-[#7C3AED] to-[#A855F7]" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-[#101114] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
            <div className="flex items-center gap-5">
              <BadgeSeal tier="badge" size="lg" achieved={true} />
              <div>
                <p className="text-lg font-bold text-zinc-200">Earn badges for referring friends.</p>
              </div>
            </div>

            {milestonesBase.map((tier, index) => {
              const labelColors = {
                bronze: "text-[#B66B2F]",
                silver: "text-zinc-300",
                gold: "text-[#FFE082]",
                platinum: "text-[#A5B4FC]",
                diamond: "text-[#67E8F9]",
              } as const;

              const isAchieved = referralCount >= tier.referrals;

              return (
                <div key={tier.referrals} className={`flex flex-col items-center justify-center border-zinc-800 text-center ${index === 0 ? "lg:border-l" : "lg:border-l"} px-4`}>
                  <BadgeSeal tier={tier.tier} size="md" achieved={isAchieved} />
                  <p className={`mt-6 font-bold ${isAchieved ? "text-white" : "text-zinc-400"}`}>{tier.referrals} Referrals</p>
                  <p className={`${isAchieved ? (labelColors[tier.tier] || "text-zinc-200") : "text-zinc-500"} mt-1 font-semibold`}>
                    {tier.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-[#101114] px-6 py-5 text-zinc-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#7C3AED]/60 bg-[#7C3AED]/15">
              <Info className="h-5 w-5 text-[#A855F7]" />
            </div>
            <p>Badges are unlocked once your referral becomes active.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center gap-2 text-[#A855F7] transition hover:text-[#C084FC]"
          >
            Learn more about Refer & Earn
            <ChevronRight className="h-5 w-5" />
          </button>
        </section>
      </div>

      <AnimatePresence>
        {isInfoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0a0a0c] shadow-[0_24px_50px_rgba(124,58,237,0.18)] flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Refer & Earn Program</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="rounded-full p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 overflow-y-auto space-y-6 scrollbar-thin text-zinc-300">
                <p className="text-[15px] font-medium text-zinc-400">
                  Invite your friends to join Roteen and grow your learning community together.
                </p>

                {/* How it works */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold tracking-wider text-violet-400 uppercase">How It Works</h4>
                  <div className="grid gap-3.5 sm:grid-cols-1">
                    {[
                      { num: "1️⃣", title: "Share Your Referral Code", desc: "Copy your referral code or referral link and send it to your friends." },
                      { num: "2️⃣", title: "Friend Signs Up", desc: "Your friend creates a new Roteen account using your referral code during registration." },
                      { num: "3️⃣", title: "Friend Completes Registration", desc: "Your friend must complete their profile and successfully join Roteen." },
                      { num: "4️⃣", title: "Referral Becomes Active", desc: "Once the referred user becomes active, the referral is counted in your account." },
                      { num: "5️⃣", title: "Unlock Badges", desc: "Earn badges as your referral count grows." }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-4 rounded-xl border border-zinc-900 bg-white/[0.01] p-4">
                        <span className="text-xl shrink-0 leading-none">{step.num}</span>
                        <div>
                          <p className="font-bold text-white text-[14.5px]">{step.title}</p>
                          <p className="mt-1 text-sm text-zinc-400">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold tracking-wider text-violet-400 uppercase">🏅 Badge Milestones</h4>
                  <div className="overflow-hidden rounded-xl border border-zinc-900 bg-white/[0.01]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-zinc-850 text-zinc-200">
                          <th className="px-5 py-3 font-semibold">Referrals</th>
                          <th className="px-5 py-3 font-semibold">Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { req: "5 Referrals", badge: "Bronze Badge", color: "text-[#B66B2F]" },
                          { req: "10 Referrals", badge: "Silver Badge", color: "text-zinc-300" },
                          { req: "25 Referrals", badge: "Gold Badge", color: "text-[#FFE082]" },
                          { req: "50 Referrals", badge: "Platinum Badge", color: "text-[#A5B4FC]" },
                          { req: "100 Referrals", badge: "Diamond Badge", color: "text-[#CFFAFE]" }
                        ].map((m, idx) => (
                          <tr key={idx} className="border-b border-zinc-900 last:border-0 hover:bg-white/[0.01] transition-colors">
                            <td className="px-5 py-3 font-medium text-white">{m.req}</td>
                            <td className={`px-5 py-3 font-bold ${m.color}`}>{m.badge}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Important Rules */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold tracking-wider text-violet-400 uppercase">📌 Important Rules</h4>
                  <ul className="grid gap-2 text-sm text-zinc-400 pl-1 list-none">
                    {[
                      "A referral code can only be used during account creation.",
                      "Each user can use only one referral code.",
                      "Self-referrals are not allowed.",
                      "Invalid referral codes will be rejected.",
                      "Badges are awarded only after referrals become active.",
                      "Referral counts update automatically."
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-violet-500 mt-1 shrink-0">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active referral definition */}
                <div className="rounded-xl border border-zinc-900 bg-white/[0.01] p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>👥</span> What Counts as an Active Referral?
                  </h4>
                  <p className="text-sm text-zinc-400">A referral becomes active when your friend successfully meets these conditions:</p>
                  <div className="grid gap-2 text-sm">
                    {[
                      "User successfully registers",
                      "Profile is completed",
                      "User starts using Roteen"
                    ].map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-zinc-300">
                        <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#A855F7] font-semibold mt-2">After activation, your referral count increases automatically.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-800 bg-white/[0.01]">
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="rounded-lg bg-linear-to-r from-[#7C3AED] to-[#9333EA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
