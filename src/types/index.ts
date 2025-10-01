// Firebase Firestore 데이터 타입 정의

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  provider: 'kakao' | 'google' | 'email';
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  preferences?: {
    notifications: boolean;
    emailMarketing: boolean;
  };
  // 온보딩 정보
  career_stage?: '대학생' | '취업 준비중' | '스포츠 관련 종사자' | '기타';
  interests?: string[];
  usage_purpose?: '커리어 준비에 도움' | '산업 트렌드 학습' | '재미·호기심';
}

export interface Article {
  id: string;
  title_kr: string;
  title_en?: string;
  summary_kr: string[];
  summary_en?: string[];
  content_kr: string;
  content_en?: string;
  image: string;
  source: string;
  source_url: string;
  categories: string[];
  published_at: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin userId
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  likeCount: number;
  tags: string[];
}

export interface UserLike {
  id: string; // `${userId}_${articleId}`
  userId: string;
  articleId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
  articleCount: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: 'create' | 'update' | 'delete';
  target: 'article' | 'user' | 'category';
  targetId: string;
  changes: Record<string, unknown>;
  createdAt: Date;
  ip: string;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 좋아요 토글 응답 타입
export interface LikeToggleResponse {
  isLiked: boolean;
  likeCount: number;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  lastDoc?: unknown; // Firestore DocumentSnapshot
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: unknown;
  total?: number;
}
