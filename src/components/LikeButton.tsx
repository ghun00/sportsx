'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isArticleLiked, toggleArticleLike } from '@/lib/likes';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/contexts/LoginContext';
import { trackArticleLike } from '@/lib/analytics';
import { getArticleById } from '@/lib/articles';

interface LikeButtonProps {
  id: string;
  size?: 'sm' | 'md';
  className?: string;
  onLikeChange?: (isLiked: boolean) => void; // 좋아요 상태 변경 콜백
}

export default function LikeButton({ id, size = 'md', className, onLikeChange }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();
  const { openLoginPopup } = useLogin();

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const liked = await isArticleLiked(id);
        setIsLiked(liked);
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      }
    };

    checkLikeStatus();
  }, [id]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 로그인하지 않은 경우 로그인 팝업 표시
    if (!isLoggedIn) {
      openLoginPopup();
      return;
    }
    
    if (loading) return; // 중복 클릭 방지
    
    try {
      setLoading(true);
      
      const newLikedState = await toggleArticleLike(id);
      setIsLiked(newLikedState);
      
      // GA4 좋아요 이벤트 추적
      try {
        const article = await getArticleById(id);
        if (article) {
          trackArticleLike(id, article.title_kr, newLikedState);
        }
      } catch (error) {
        console.warn('아티클 정보를 가져올 수 없어 GA4 추적을 건너뜁니다:', error);
        // 아티클 정보가 없어도 좋아요 이벤트는 추적
        trackArticleLike(id, `Article ${id}`, newLikedState);
      }
      
      // 부모 컴포넌트에 상태 변경 알림
      if (onLikeChange) {
        onLikeChange(newLikedState);
      }
      
      // 애니메이션 효과
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-3'
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'relative rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm',
        buttonSizeClasses[size],
        isLiked ? 'text-red-500' : 'text-white hover:text-red-500',
        isAnimating && 'scale-110',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      aria-pressed={isLiked}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          isLiked && 'fill-current'
        )}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
