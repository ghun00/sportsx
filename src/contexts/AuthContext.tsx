'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { UserService } from '@/services/userService';
import { trackLogin, trackSignUp, trackLoginFailed, trackLogout } from '@/lib/analytics';
import { isFirebaseInitialized } from '@/lib/firebase-utils';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUserFromCallback: (user: { id: number; nickname: string; email?: string; profileImage?: string; accessToken: string }) => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  checkOnboardingNeeded: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isLoggedIn = !!user;

  const login = async () => {
    setIsLoading(true);
    console.log('🔍 카카오 로그인 시작...');
    
    try {
      // 카카오 인증 URL 요청
      const response = await fetch('/api/auth/kakao');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ 카카오 API 응답 오류:', response.status, data);
        throw new Error(data.error || `인증 URL 생성에 실패했습니다. (${response.status})`);
      }
      
      // 카카오 인증 페이지로 리다이렉트
      window.location.href = data.authUrl;
    } catch (error: unknown) {
      console.error('❌ 로그인 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      // GA4 로그인 실패 이벤트 추적
      trackLoginFailed('kakao', errorMessage);
      
      alert(`로그인에 실패했습니다: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const setUserFromCallback = async (kakaoUserData: { id: number; nickname: string; email?: string; profileImage?: string; accessToken: string }) => {
    try {
      setIsLoading(true);
      
      // Firebase 초기화 상태 확인
      if (!isFirebaseInitialized()) {
        console.error('❌ Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.');
        throw new Error('Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.');
      }
      
      console.log('🔍 Firebase 사용자 저장 시작:', { kakaoId: kakaoUserData.id, nickname: kakaoUserData.nickname });
      
      // Firebase에 유저 정보 저장/업데이트
      const { user: firebaseUser, isNewUser } = await UserService.createOrUpdateUser({
        id: kakaoUserData.id.toString(),
        email: kakaoUserData.email || '',
        nickname: kakaoUserData.nickname,
        profileImage: kakaoUserData.profileImage,
        provider: 'kakao'
      });
      
      // 로컬 상태 업데이트
      setUser(firebaseUser);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('sx_user', JSON.stringify(firebaseUser));
      
      // GA4 이벤트 추적 - 회원가입과 로그인 구분
      if (isNewUser) {
        trackSignUp('kakao', firebaseUser.id);
        console.log('🎉 새 회원가입 완료:', firebaseUser.nickname);
      } else {
        trackLogin('kakao', firebaseUser.id);
        console.log('🔑 로그인 완료:', firebaseUser.nickname);
      }
      
      console.log('✅ Firebase 유저 정보 저장 완료:', firebaseUser);
      
      // 온보딩 필요 여부 확인 (firebaseUser를 직접 전달)
      await checkOnboardingNeededForUser(firebaseUser);
    } catch (error) {
      console.error('❌ Firebase 유저 정보 저장 실패:', error);
      
      // Firebase 저장 실패 시에도 로컬 로그인은 허용
      const fallbackUser: User = {
        id: kakaoUserData.id.toString(),
        email: kakaoUserData.email || '',
        nickname: kakaoUserData.nickname,
        profileImage: kakaoUserData.profileImage,
        provider: 'kakao',
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
        preferences: {
          notifications: true,
          emailMarketing: false
        }
      };
      
      setUser(fallbackUser);
      localStorage.setItem('sx_user', JSON.stringify(fallbackUser));
      
      // GA4 회원가입 이벤트 추적 (fallback - 새 사용자로 간주)
      trackSignUp('kakao', fallbackUser.id);
      
      console.log('⚠️ Fallback 유저 정보로 로그인:', fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOnboardingNeeded = async () => {
    if (!user?.id) return;
    
    try {
      const needsOnboarding = await UserService.needsOnboarding(user.id);
      setShowOnboarding(needsOnboarding);
      
      if (needsOnboarding) {
        console.log('🔍 온보딩이 필요합니다.');
      }
    } catch (error) {
      console.error('온보딩 필요 여부 확인 실패:', error);
    }
  };

  const checkOnboardingNeededForUser = async (targetUser: User) => {
    try {
      const needsOnboarding = await UserService.needsOnboarding(targetUser.id);
      setShowOnboarding(needsOnboarding);
      
      if (needsOnboarding) {
        console.log('🔍 온보딩이 필요합니다.');
      }
    } catch (error) {
      console.error('온보딩 필요 여부 확인 실패:', error);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // GA4 로그아웃 이벤트 추적
      trackLogout();
      
      // 로컬 상태 초기화
      setUser(null);
      
      // 로컬 스토리지에서 사용자 정보 제거
      localStorage.removeItem('sx_user');
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 저장된 사용자 정보 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('sx_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('저장된 사용자 정보 로드:', parsedUser);
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 실패:', error);
        localStorage.removeItem('sx_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isLoading,
      login,
      logout,
      setUserFromCallback,
      showOnboarding,
      setShowOnboarding,
      checkOnboardingNeeded
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
