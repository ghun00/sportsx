'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { UserService } from '@/services/userService';
import { trackOnboardingShown, trackOnboardingSelect, trackOnboardingSave, trackOnboardingSkip } from '@/lib/analytics';
import Toast from './Toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CAREER_STAGES = [
  '대학생',
  '취업 준비중', 
  '스포츠 관련 종사자',
  '기타'
] as const;

const INTERESTS = [
  '스포츠 산업 전반',
  '마케팅 & 팬 경험',
  '데이터 & 분석',
  '미디어 & 콘텐츠',
  '기타'
] as const;

const USAGE_PURPOSES = [
  '커리어 준비에 도움',
  '산업 트렌드 학습',
  '재미·호기심'
] as const;

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [careerStage, setCareerStage] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [usagePurpose, setUsagePurpose] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      trackOnboardingShown('null_fields');
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleCareerStageSelect = (stage: string) => {
    setCareerStage(stage);
    trackOnboardingSelect('career_stage', stage);
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      
      trackOnboardingSelect('interests', interest);
      return newInterests;
    });
  };

  const handleUsagePurposeSelect = (purpose: string) => {
    setUsagePurpose(purpose);
    trackOnboardingSelect('usage_purpose', purpose);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return careerStage !== '';
      case 2:
        return interests.length > 0;
      case 3:
        return usagePurpose !== '';
      default:
        return false;
    }
  };

  const isAllStepsComplete = () => {
    return careerStage !== '' && interests.length > 0 && usagePurpose !== '';
  };

  const handleSave = async () => {
    if (!isAllStepsComplete()) return;

    setIsSubmitting(true);
    try {
      await UserService.updateUserOnboarding({
        career_stage: careerStage as '대학생' | '취업 준비중' | '스포츠 관련 종사자' | '기타',
        interests: interests,
        usage_purpose: usagePurpose as '커리어 준비에 도움' | '산업 트렌드 학습' | '재미·호기심'
      });

      trackOnboardingSave('success');
      
      // 성공 토스트 표시
      setToast({
        message: '맞춤 설정이 저장되었습니다.',
        type: 'success',
        isVisible: true
      });
      
      // 토스트 표시 후 모달 닫기
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
      trackOnboardingSave('fail', error);
      
      // 에러 토스트 표시
      setToast({
        message: '잠시 후 다시 시도해주세요.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    trackOnboardingSkip();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSkip();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/50 backdrop-blur-sm transition-opacity duration-300',
        'flex items-center justify-center',
        'px-4 sm:px-6',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      {/* 데스크톱: 중앙 모달 */}
      <div 
        className={cn(
          'hidden md:block',
          'bg-[#091926] rounded-3xl border border-slate-700 shadow-2xl',
          'transition-all duration-300 transform',
          'max-w-2xl w-full',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">

          {/* 진행 표시 */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-300',
                    step <= currentStep ? 'bg-[var(--blue)]' : 'bg-gray-600'
                  )}
                />
              ))}
            </div>
          </div>

          {/* 질문 내용 */}
          <div className="mb-8 min-h-[300px]">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
                  현재 커리어가 어느 단계이신가요?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {CAREER_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleCareerStageSelect(stage)}
                      className={cn(
                        'px-4 py-3 rounded-xl border transition-all duration-200 text-center',
                        'hover:scale-105 active:scale-95',
                        careerStage === stage
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
                  어떤 분야에 관심이 있으신가요?
                </h2>
                <p className="text-sm text-center mb-6" style={{ color: 'var(--text)' }}>
                  아직 정보를 입력하지 않았어요. 맞춤 추천을 위해 간단한 질문에 답해주세요.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={cn(
                        'px-4 py-3 rounded-xl border transition-all duration-200 text-center',
                        'hover:scale-105 active:scale-95',
                        interests.includes(interest)
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
                  저희 서비스를 어떤 목적으로 이용하시려고 하시나요?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {USAGE_PURPOSES.map((purpose) => (
                    <button
                      key={purpose}
                      onClick={() => handleUsagePurposeSelect(purpose)}
                      className={cn(
                        'px-4 py-3 rounded-xl border transition-all duration-200 text-center',
                        'hover:scale-105 active:scale-95',
                        usagePurpose === purpose
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cn(
                  'w-full px-6 py-3 rounded-xl font-medium transition-all duration-200',
                  isStepValid()
                    ? 'bg-[var(--blue)] text-white hover:bg-[var(--blue)]/80'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                )}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isAllStepsComplete() || isSubmitting}
                className={cn(
                  'w-full px-6 py-3 rounded-xl font-medium transition-all duration-200',
                  isAllStepsComplete() && !isSubmitting
                    ? 'bg-[var(--blue)] text-white hover:bg-[var(--blue)]/80'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                )}
              >
                {isSubmitting ? '저장 중...' : '저장하고 시작하기'}
              </button>
            )}
            
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-full px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 transition-all duration-200"
              >
                이전
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 모바일: 바텀시트 */}
      <div 
        className={cn(
          'md:hidden',
          'fixed bottom-0 left-0 right-0',
          'bg-[#091926] rounded-t-3xl border-t border-slate-700 shadow-2xl',
          'transition-all duration-300 transform',
          'max-h-[80vh] overflow-y-auto',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-8">

          {/* 진행 표시 */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    step <= currentStep ? 'bg-[var(--blue)]' : 'bg-gray-600'
                  )}
                />
              ))}
            </div>
          </div>

          {/* 질문 내용 */}
          <div className="mb-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>
                  현재 커리어가 어느 단계이신가요?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {CAREER_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleCareerStageSelect(stage)}
                      className={cn(
                        'px-3 py-3 rounded-xl border transition-all duration-200 text-center text-sm',
                        'hover:scale-105 active:scale-95',
                        careerStage === stage
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>
                  어떤 분야에 관심이 있으신가요?
                </h2>
                <p className="text-sm text-center mb-4" style={{ color: 'var(--text)' }}>
                  맞춤형 콘텐츠를 위해 마지막으로 확인할게요.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={cn(
                        'px-3 py-3 rounded-xl border transition-all duration-200 text-center text-sm',
                        'hover:scale-105 active:scale-95',
                        interests.includes(interest)
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>
                  저희 서비스를 어떤 목적으로 이용하시려고 하시나요?
                </h2>
                <div className="space-y-3">
                  {USAGE_PURPOSES.map((purpose) => (
                    <button
                      key={purpose}
                      onClick={() => handleUsagePurposeSelect(purpose)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-all duration-200 text-center',
                        'hover:scale-105 active:scale-95',
                        usagePurpose === purpose
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      )}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="space-y-3 mb-6">
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cn(
                  'w-full px-6 py-3 rounded-xl font-medium transition-all duration-200',
                  isStepValid()
                    ? 'bg-[var(--blue)] text-white'
                    : 'bg-gray-700 text-gray-400'
                )}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isAllStepsComplete() || isSubmitting}
                className={cn(
                  'w-full px-6 py-3 rounded-xl font-medium transition-all duration-200',
                  isAllStepsComplete() && !isSubmitting
                    ? 'bg-[var(--blue)] text-white'
                    : 'bg-gray-700 text-gray-400'
                )}
              >
                {isSubmitting ? '저장 중...' : '저장하고 시작하기'}
              </button>
            )}
            
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-full px-6 py-3 rounded-xl border border-gray-600 text-gray-300 active:scale-95 transition-all duration-200"
              >
                이전
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 토스트 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
