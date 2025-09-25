'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // GA4 초기화
    analytics.initialize();
  }, []);

  useEffect(() => {
    // 페이지 변경 시 페이지 뷰 추적
    if (pathname) {
      const pageTitle = getPageTitle(pathname);
      analytics.trackPageView(pageTitle, pathname);
    }
  }, [pathname]);

  // 페이지 제목 생성 함수
  const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
      '/': '홈',
      '/login': '로그인',
      '/profile': '프로필',
      '/me': '마이페이지',
      '/liked': '좋아요한 아티클',
      '/admin': '관리자',
      '/admin/articles': '관리자 - 아티클 목록',
      '/admin/articles/create': '관리자 - 아티클 작성',
      '/auth/kakao/callback': '카카오 로그인 콜백',
    };

    // 아티클 상세 페이지 패턴 매칭
    if (path.startsWith('/articles/')) {
      const articleId = path.split('/')[2];
      return `아티클 상세 - ${articleId}`;
    }

    // 관리자 아티클 편집 페이지 패턴 매칭
    if (path.startsWith('/admin/articles/edit/')) {
      const articleId = path.split('/')[4];
      return `관리자 - 아티클 편집 - ${articleId}`;
    }

    return titleMap[path] || path;
  };

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
