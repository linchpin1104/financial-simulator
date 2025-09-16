'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function Home() {
  const router = useRouter();
  const { isOnboardingComplete } = useAppStore();

  useEffect(() => {
    if (isOnboardingComplete) {
      router.push('/dashboard');
    }
  }, [isOnboardingComplete, router]);

  if (isOnboardingComplete) {
    return null; // 리다이렉트 중
  }

  return <OnboardingFlow />;
}