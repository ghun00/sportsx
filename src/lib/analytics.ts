// Google Analytics 4 추적 유틸리티
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// GA4 이벤트 타입 정의
export interface GA4Event {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: {
    user_id?: string;
    article_id?: string;
    category?: string;
    page_title?: string;
    page_path?: string;
    error_message?: string;
    load_time?: number;
    login_method?: string;
    admin_action?: string;
  };
}

// GA4 추적 클래스
export class Analytics {
  private static instance: Analytics;
  private isInitialized = false;
  private measurementId = 'G-CLB2V5EHD5';

  private constructor() {}

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // GA4 초기화
  public initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) {
      return;
    }

    // gtag가 이미 로드되었는지 확인 (layout.tsx에서 로드됨)
    if (!window.gtag) {
      console.warn('GA4 gtag가 아직 로드되지 않았습니다. 잠시 후 다시 시도합니다.');
      setTimeout(() => this.initialize(), 100);
      return;
    }

    // 기본 설정
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false, // 수동으로 페이지 뷰 관리
    });

    this.isInitialized = true;
    console.log('✅ GA4 Analytics 초기화 완료');
  }


  // 이벤트 추적
  public trackEvent(event: GA4Event): void {
    if (!this.isInitialized || !window.gtag) {
      console.warn('GA4가 초기화되지 않았습니다.');
      return;
    }

    const eventData: Record<string, unknown> = {
      event_category: event.event_category,
      event_label: event.event_label,
      value: event.value,
      ...event.custom_parameters,
    };

    // undefined 값 제거
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined) {
        delete eventData[key];
      }
    });

    window.gtag('event', event.event_name, eventData);
    console.log('📊 GA4 이벤트 추적:', event.event_name, eventData);
  }

  // 페이지 뷰 추적
  public trackPageView(page_title: string, page_path: string): void {
    if (!this.isInitialized || !window.gtag) {
      return;
    }

    window.gtag('config', this.measurementId, {
      page_title,
      page_path,
    });

    this.trackEvent({
      event_name: 'page_view',
      event_category: 'engagement',
      custom_parameters: {
        page_title,
        page_path,
      },
    });
  }

  // 사용자 ID 설정
  public setUserId(userId: string): void {
    if (!this.isInitialized || !window.gtag) {
      return;
    }

    window.gtag('config', this.measurementId, {
      user_id: userId,
    });
  }

  // 로그인 이벤트
  public trackLogin(method: string, userId?: string): void {
    this.trackEvent({
      event_name: 'login',
      event_category: 'authentication',
      event_label: method,
      custom_parameters: {
        login_method: method,
        user_id: userId,
      },
    });

    if (userId) {
      this.setUserId(userId);
    }
  }

  // 로그인 실패 이벤트
  public trackLoginFailed(method: string, errorMessage?: string): void {
    this.trackEvent({
      event_name: 'login_failed',
      event_category: 'authentication',
      event_label: method,
      custom_parameters: {
        login_method: method,
        error_message: errorMessage,
      },
    });
  }

  // 로그아웃 이벤트
  public trackLogout(): void {
    this.trackEvent({
      event_name: 'logout',
      event_category: 'authentication',
    });
  }

  // 아티클 클릭 이벤트
  public trackArticleClick(articleId: string, articleTitle: string, category?: string): void {
    this.trackEvent({
      event_name: 'article_click',
      event_category: 'content',
      event_label: articleTitle,
      custom_parameters: {
        article_id: articleId,
        category,
      },
    });
  }

  // 아티클 뷰 이벤트
  public trackArticleView(articleId: string, articleTitle: string, category?: string): void {
    this.trackEvent({
      event_name: 'article_view',
      event_category: 'content',
      event_label: articleTitle,
      custom_parameters: {
        article_id: articleId,
        category,
      },
    });
  }

  // 아티클 좋아요 이벤트
  public trackArticleLike(articleId: string, articleTitle: string, isLiked: boolean): void {
    this.trackEvent({
      event_name: isLiked ? 'article_like' : 'article_unlike',
      event_category: 'engagement',
      event_label: articleTitle,
      custom_parameters: {
        article_id: articleId,
      },
    });
  }

  // 카테고리 필터 이벤트
  public trackCategoryFilter(category: string): void {
    this.trackEvent({
      event_name: 'category_filter',
      event_category: 'navigation',
      event_label: category,
      custom_parameters: {
        category,
      },
    });
  }

  // 피드백 클릭 이벤트
  public trackFeedbackClick(): void {
    this.trackEvent({
      event_name: 'feedback_click',
      event_category: 'engagement',
      event_label: 'feedback_button',
    });
  }

  // 프로필 방문 이벤트
  public trackProfileVisit(): void {
    this.trackEvent({
      event_name: 'profile_visit',
      event_category: 'navigation',
      event_label: 'user_profile',
    });
  }

  // 좋아요한 아티클 방문 이벤트
  public trackLikedArticlesVisit(): void {
    this.trackEvent({
      event_name: 'liked_articles_visit',
      event_category: 'navigation',
      event_label: 'liked_articles_page',
    });
  }

  // 관리자 페이지 방문 이벤트
  public trackAdminPageView(pageName: string): void {
    this.trackEvent({
      event_name: 'admin_page_view',
      event_category: 'admin',
      event_label: pageName,
      custom_parameters: {
        admin_action: pageName,
      },
    });
  }

  // 에러 이벤트
  public trackError(errorMessage: string, errorType?: string): void {
    this.trackEvent({
      event_name: 'error_occurred',
      event_category: 'error',
      event_label: errorType || 'general_error',
      custom_parameters: {
        error_message: errorMessage,
      },
    });
  }

  // Firebase 에러 이벤트
  public trackFirebaseError(errorMessage: string): void {
    this.trackEvent({
      event_name: 'firebase_error',
      event_category: 'error',
      event_label: 'firebase_error',
      custom_parameters: {
        error_message: errorMessage,
      },
    });
  }

  // 페이지 로딩 시간 추적
  public trackPageLoadTime(loadTime: number): void {
    this.trackEvent({
      event_name: 'page_load_time',
      event_category: 'performance',
      value: Math.round(loadTime),
      custom_parameters: {
        load_time: loadTime,
      },
    });
  }
}

// 싱글톤 인스턴스 내보내기
export const analytics = Analytics.getInstance();

// 편의 함수들
export const trackEvent = (event: GA4Event) => analytics.trackEvent(event);
export const trackPageView = (page_title: string, page_path: string) => 
  analytics.trackPageView(page_title, page_path);
export const trackLogin = (method: string, userId?: string) => 
  analytics.trackLogin(method, userId);
export const trackLoginFailed = (method: string, errorMessage?: string) => 
  analytics.trackLoginFailed(method, errorMessage);
export const trackLogout = () => analytics.trackLogout();
export const trackArticleClick = (articleId: string, articleTitle: string, category?: string) => 
  analytics.trackArticleClick(articleId, articleTitle, category);
export const trackArticleView = (articleId: string, articleTitle: string, category?: string) => 
  analytics.trackArticleView(articleId, articleTitle, category);
export const trackArticleLike = (articleId: string, articleTitle: string, isLiked: boolean) => 
  analytics.trackArticleLike(articleId, articleTitle, isLiked);
export const trackCategoryFilter = (category: string) => 
  analytics.trackCategoryFilter(category);
export const trackFeedbackClick = () => analytics.trackFeedbackClick();
export const trackProfileVisit = () => analytics.trackProfileVisit();
export const trackLikedArticlesVisit = () => analytics.trackLikedArticlesVisit();
export const trackAdminPageView = (pageName: string) => 
  analytics.trackAdminPageView(pageName);
export const trackError = (errorMessage: string, errorType?: string) => 
  analytics.trackError(errorMessage, errorType);
export const trackFirebaseError = (errorMessage: string) => 
  analytics.trackFirebaseError(errorMessage);
export const trackPageLoadTime = (loadTime: number) => 
  analytics.trackPageLoadTime(loadTime);
