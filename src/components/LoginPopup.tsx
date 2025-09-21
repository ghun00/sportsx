'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { login, isLoading } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 배경 애니메이션이 시작된 후 콘텐츠 애니메이션 시작
      setTimeout(() => setIsContentVisible(true), 100);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    } else {
      setIsContentVisible(false);
      // 콘텐츠 애니메이션이 끝난 후 배경 애니메이션 시작
      setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await login();
      onClose();
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/50 backdrop-blur-sm transition-opacity duration-300',
        'flex items-center justify-center',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        padding: '16px',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
      onClick={handleBackdropClick}
    >
      {/* 통합 팝업 - 모바일/데스크톱 모두 동일 */}
      <div 
        className={cn(
          'relative',
          'bg-[#091926] rounded-2xl border border-slate-700 shadow-2xl',
          'transition-all duration-300 transform',
          'max-w-sm sm:max-w-lg',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        style={{
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 팝업 내용 */}
        <div className="p-4 sm:p-8" style={{
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* 호랑이 캐릭터 */}
          <div className="text-center" style={{ marginBottom: '16px' }}>
            <img
              src="/tiger.png"
              alt="Tiger Character"
              className={cn(
                "mx-auto object-contain transition-all duration-500",
                "w-full max-w-[180px] sm:max-w-[220px]",
                isContentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
              style={{ 
                transitionDelay: '200ms',
                height: 'auto',
                marginBottom: '16px'
              }}
            />
            
            {/* 텍스트 */}
            <div style={{ marginBottom: '24px' }}>
              <p 
                className={cn(
                  "font-bold transition-all duration-500",
                  "text-xl sm:text-3xl",
                  "whitespace-nowrap",
                  isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )}
                style={{ 
                  color: 'var(--text)',
                  lineHeight: '1.3',
                  marginBottom: '8px',
                  transitionDelay: '300ms'
                }}
              >
                스포츠 커리어 성장을 위한 지식허브
              </p>
              <p 
                className={cn(
                  "transition-all duration-500",
                  "text-base sm:text-xl",
                  "whitespace-nowrap",
                  isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )}
                style={{ 
                  color: 'var(--muted)',
                  lineHeight: '1.3',
                  transitionDelay: '400ms'
                }}
              >
                맞춤형 콘텐츠로, 스포츠 커리어 성장을 가속하세요
              </p>
            </div>

            {/* 카카오 로그인 버튼 */}
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-500 hover:scale-105 active:scale-95",
                isContentVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
              style={{
                backgroundColor: '#FEE500',
                color: '#000000',
                padding: '16px 14px',
                fontSize: '16px',
                transitionDelay: '500ms',
                boxSizing: 'border-box',
                maxWidth: '100%'
              }}
            >
              <img
                src="/kakao.png"
                alt="Kakao"
                style={{ width: '16px', height: '16px' }}
              />
              <span>
                {isLoading ? '로그인 중...' : '카카오 로그인'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}