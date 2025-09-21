'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useLogin } from './LoginContext';

interface UserActivityContextType {
  articleViewCount: number;
  sessionStartTime: Date | null;
  incrementArticleView: () => void;
  resetActivity: () => void;
}

const UserActivityContext = createContext<UserActivityContextType | undefined>(undefined);

export function UserActivityProvider({ children }: { children: ReactNode }) {
  const [articleViewCount, setArticleViewCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { isLoggedIn } = useAuth();
  const { openLoginPopup } = useLogin();
  const hasShownLoginPrompt = useRef(false);

  // 세션 시작 시간 설정
  useEffect(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
  }, [sessionStartTime]);

  // 로그인 상태가 변경되면 활동 데이터 리셋
  useEffect(() => {
    if (isLoggedIn) {
      resetActivity();
    }
  }, [isLoggedIn]);

  // 로그인 유도 조건 체크
  useEffect(() => {
    if (
      !isLoggedIn && 
      !hasShownLoginPrompt.current &&
      articleViewCount >= 2 && 
      sessionStartTime
    ) {
      const now = new Date();
      const timeSpent = now.getTime() - sessionStartTime.getTime();
      const fourMinutes = 4 * 60 * 1000; // 4분을 밀리초로 변환

      if (timeSpent >= fourMinutes) {
        hasShownLoginPrompt.current = true;
        // 약간의 지연을 두고 팝업 표시 (자연스러운 타이밍)
        setTimeout(() => {
          openLoginPopup();
        }, 1000);
      }
    }
  }, [articleViewCount, sessionStartTime, isLoggedIn, openLoginPopup]);

  const incrementArticleView = () => {
    setArticleViewCount(prev => prev + 1);
  };

  const resetActivity = () => {
    setArticleViewCount(0);
    setSessionStartTime(new Date());
    hasShownLoginPrompt.current = false;
  };

  return (
    <UserActivityContext.Provider value={{
      articleViewCount,
      sessionStartTime,
      incrementArticleView,
      resetActivity
    }}>
      {children}
    </UserActivityContext.Provider>
  );
}

export function useUserActivity() {
  const context = useContext(UserActivityContext);
  if (context === undefined) {
    throw new Error('useUserActivity must be used within a UserActivityProvider');
  }
  return context;
}
