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
}

export interface Article {
  id: string;
  title_kr: string;
  summary_kr: string[];
  content_kr: string;
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
