export const ProfileNavigation = {
  goToDashboard: () => {
    // Logic for routing, potentially wrapping Next.js useRouter if needed in hooks
    console.log('Navigating to Dashboard');
  },
  goToHome: () => {
    console.log('Navigating to Home');
  },
  copyReferralCode: (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      // In a real app, show a toast notification here
      alert('Referral code copied to clipboard!');
    }
  }
};
