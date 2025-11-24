'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      setTimeout(() => setIsContentVisible(true), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setIsContentVisible(false);
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
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center px-4',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full max-w-sm sm:max-w-md mx-auto rounded-3xl border border-[#1B3042] bg-[#091926] shadow-2xl transition-all duration-300 transform overflow-hidden',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091926]"
          aria-label="로그인 팝업 닫기"
        >
          ✕
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Image
              src="https://github.com/ghun00/sportsx/blob/main/public/tiger.png?raw=true"
              alt="스포츠엑스 마스코트"
              width={180}
              height={180}
              className={cn(
                'transition-all duration-500',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              )}
              priority
            />
          </div>

          <div className="text-center space-y-3 mb-8">
            <h2
              className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight text-white',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              스포츠 커리어 성장을 위한 지식허브
            </h2>
            <p
              className={cn(
                'text-sm sm:text-base leading-6 text-white/70',
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              맞춤형 콘텐츠로, 스포츠 커리어 성장을 가속하세요
            </p>
          </div>

          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091926]',
              isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
              isLoading ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02]'
            )}
            style={{
              backgroundColor: '#FEE500',
              color: '#111827',
              padding: '16px 14px',
              fontSize: '16px',
            }}
          >
            <Image
              src="https://github.com/ghun00/sportsx/blob/main/public/kakao.png?raw=true"
              alt="카카오"
              width={18}
              height={18}
              className="object-contain"
            />
            {isLoading ? '로그인 중...' : '카카오 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}