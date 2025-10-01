'use client';

import { useAuth } from '@/contexts/AuthContext';
import OnboardingModal from './OnboardingModal';

export default function OnboardingProvider() {
  const { showOnboarding, setShowOnboarding } = useAuth();

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // 온보딩 완료 후 다시 체크하지 않도록
    console.log('✅ 온보딩 완료');
  };


  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onClose={() => {}} // 건너뛰기 기능 제거로 빈 함수
      onComplete={handleOnboardingComplete}
    />
  );
}
