import { 
  collection, 
  doc, 
  query, 
  limit, 
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase-config';

// Firebase가 초기화되지 않은 경우를 위한 헬퍼 함수
const getDb = () => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.');
  }
  return db;
};
import { 
  PaginationParams,
  PaginatedResponse
} from '@/types';

// 타임스탬프 변환 유틸리티
export const convertTimestamp = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  // 기본값으로 현재 시간 반환
  return new Date();
};

// Firestore 데이터를 타입으로 변환
export const convertFirestoreDoc = <T>(doc: DocumentSnapshot): T | null => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // 타임스탬프 필드들을 Date로 변환
    ...(data.createdAt && { createdAt: convertTimestamp(data.createdAt) }),
    ...(data.updatedAt && { updatedAt: convertTimestamp(data.updatedAt) }),
    ...(data.published_at && { published_at: convertTimestamp(data.published_at) }),
    ...(data.lastLoginAt && { lastLoginAt: convertTimestamp(data.lastLoginAt) }),
  } as T;
};

// 페이지네이션을 위한 쿼리 생성
export const createPaginatedQuery = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  paginationParams?: PaginationParams
) => {
  const { limit: pageLimit = 20, lastDoc } = paginationParams || {};
  
  const queryConstraints = [
    ...constraints,
    ...(pageLimit > 0 ? [limit(pageLimit + 1)] : []), // 하나 더 가져와서 hasMore 판단
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  ];
  
  return query(collection(getDb(), collectionName), ...queryConstraints);
};

// 페이지네이션 응답 처리
export const processPaginatedResponse = <T>(
  docs: QueryDocumentSnapshot[],
  pageLimit: number
): PaginatedResponse<T> => {
  const hasMore = docs.length > pageLimit;
  const data = docs.slice(0, pageLimit).map(doc => convertFirestoreDoc<T>(doc)).filter(Boolean) as T[];
  const lastDoc = hasMore ? docs[pageLimit - 1] : undefined;
  
  return {
    data,
    hasMore,
    lastDoc
  };
};

// 에러 처리 유틸리티
export const handleFirestoreError = (error: unknown): string => {
  console.error('Firestore Error:', error);
  
  if (error && typeof error === 'object' && 'code' in error) {
    switch ((error as { code: string }).code) {
      case 'permission-denied':
        return '권한이 없습니다.';
      case 'not-found':
        return '데이터를 찾을 수 없습니다.';
      case 'already-exists':
        return '이미 존재하는 데이터입니다.';
      case 'failed-precondition':
        return '요청 조건이 맞지 않습니다.';
      case 'aborted':
        return '요청이 중단되었습니다.';
      case 'unavailable':
        return '서비스가 일시적으로 사용할 수 없습니다.';
      default:
        return `데이터베이스 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
    }
  }
  
  return (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
};

// 유저 관련 유틸리티
export const getUserRef = (userId: string) => doc(getDb(), 'users', userId);
export const getUsersCollection = () => collection(getDb(), 'users');

// 아티클 관련 유틸리티
export const getArticleRef = (articleId: string) => doc(getDb(), 'articles', articleId);
export const getArticlesCollection = () => collection(getDb(), 'articles');

// 좋아요 관련 유틸리티
export const getUserLikeRef = (userId: string, articleId: string) => 
  doc(getDb(), 'user_likes', `${userId}_${articleId}`);
export const getUserLikesCollection = () => collection(getDb(), 'user_likes');

// 카테고리 관련 유틸리티
export const getCategoryRef = (categoryId: string) => doc(getDb(), 'categories', categoryId);
export const getCategoriesCollection = () => collection(getDb(), 'categories');

// 관리자 로그 관련 유틸리티
export const getAdminLogsCollection = () => collection(getDb(), 'admin_logs');

// 서버 타임스탬프 생성
export const getServerTimestamp = () => serverTimestamp();

// 현재 로그인한 유저 ID 가져오기 (Firebase Auth와 연동 시 사용)
export const getCurrentUserId = (): string | null => {
  // TODO: Firebase Auth와 연동 시 실제 유저 ID 반환
  // 현재는 임시로 로컬 스토리지의 user.id 사용
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('sx_user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('🔍 getCurrentUserId - 파싱된 유저:', parsedUser);
        return parsedUser.id;
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        return null;
      }
    }
  }
  console.log('🔍 getCurrentUserId - 유저 정보 없음');
  return null;
};
