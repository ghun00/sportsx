// Firebase 기반 좋아요 관리 유틸리티

import { LikeService } from '@/services/likeService';

// 로컬 스토리지 키 (Firebase 실패 시 fallback용)
const STORAGE_KEY = 'sx_likes';

// 사용자 ID 가져오기 (AuthContext에서)
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('sx_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('🔍 likes.ts - getCurrentUserId:', parsedUser.id);
      return parsedUser.id;
    }
    console.log('🔍 likes.ts - 사용자 정보 없음');
    return null;
  } catch (error) {
    console.error('사용자 ID 조회 실패:', error);
    return null;
  }
}

// 로컬 스토리지에서 좋아요 목록 조회 (fallback)
function getLikedArticlesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('로컬 좋아요 목록 조회 실패:', error);
    return [];
  }
}

// 좋아요한 아티클 ID 목록 조회
export async function getLikedArticles(): Promise<string[]> {
  const userId = getCurrentUserId();
  console.log('🔍 getLikedArticles - userId:', userId);
  
  if (!userId) {
    // 로그인하지 않은 경우 로컬 스토리지에서 조회
    console.log('🔍 getLikedArticles - 로컬 스토리지에서 조회');
    return getLikedArticlesFromStorage();
  }
  
  try {
    console.log('🔍 getLikedArticles - Firebase에서 조회 시작');
    const result = await LikeService.getUserLikedArticles(userId);
    console.log('🔍 getLikedArticles - Firebase 결과:', result);
    return result;
  } catch (error) {
    console.error('Firebase 좋아요 목록 조회 실패, 로컬 스토리지 사용:', error);
    return getLikedArticlesFromStorage();
  }
}

// 특정 아티클이 좋아요되어 있는지 확인
export async function isArticleLiked(articleId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    // 로그인하지 않은 경우 로컬 스토리지에서 확인
    const likedArticles = getLikedArticlesFromStorage();
    return likedArticles.includes(articleId);
  }
  
  try {
    return await LikeService.isArticleLiked(userId, articleId);
  } catch (error) {
    console.error('Firebase 좋아요 상태 확인 실패, 로컬 스토리지 사용:', error);
    const likedArticles = getLikedArticlesFromStorage();
    return likedArticles.includes(articleId);
  }
}

// 좋아요 토글
export async function toggleArticleLike(articleId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    // 로그인하지 않은 경우 로컬 스토리지에서 토글
    return toggleArticleLikeInStorage(articleId);
  }
  
  try {
    const result = await LikeService.toggleLike(userId, articleId);
    
    // 로컬 스토리지도 동기화
    const likedArticles = getLikedArticlesFromStorage();
    if (result.isLiked) {
      if (!likedArticles.includes(articleId)) {
        likedArticles.push(articleId);
      }
    } else {
      const index = likedArticles.indexOf(articleId);
      if (index > -1) {
        likedArticles.splice(index, 1);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedArticles));
    
    return result.isLiked;
  } catch (error) {
    console.error('Firebase 좋아요 토글 실패, 로컬 스토리지 사용:', error);
    return toggleArticleLikeInStorage(articleId);
  }
}

// 로컬 스토리지에서 좋아요 토글 (fallback)
function toggleArticleLikeInStorage(articleId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const likedArticles = getLikedArticlesFromStorage();
    const isLiked = likedArticles.includes(articleId);
    
    let updatedLikes: string[];
    if (isLiked) {
      // 좋아요 취소
      updatedLikes = likedArticles.filter(id => id !== articleId);
    } else {
      // 좋아요 추가
      updatedLikes = [...likedArticles, articleId];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLikes));
    return !isLiked;
  } catch (error) {
    console.error('로컬 좋아요 토글 실패:', error);
    return false;
  }
}

// 기존 호환성을 위한 동기 함수들 (로컬 스토리지만 사용)
export function getLikedArticlesSync(): string[] {
  return getLikedArticlesFromStorage();
}

export function isArticleLikedSync(articleId: string): boolean {
  const likedArticles = getLikedArticlesFromStorage();
  return likedArticles.includes(articleId);
}

export function toggleArticleLikeSync(articleId: string): boolean {
  return toggleArticleLikeInStorage(articleId);
}

// 좋아요 추가 (기존 호환성)
export function addArticleLike(articleId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const likedArticles = getLikedArticlesFromStorage();
    if (!likedArticles.includes(articleId)) {
      const newLikedArticles = [...likedArticles, articleId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLikedArticles));
    }
  } catch (error) {
    console.error('Error adding article like:', error);
  }
}

// 좋아요 제거 (기존 호환성)
export function removeArticleLike(articleId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const likedArticles = getLikedArticlesFromStorage();
    const newLikedArticles = likedArticles.filter(id => id !== articleId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLikedArticles));
  } catch (error) {
    console.error('Error removing article like:', error);
  }
}

// 모든 좋아요 삭제
export function clearAllLikes(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all likes:', error);
  }
}

// 아티클의 좋아요 수 조회
export async function getArticleLikeCount(articleId: string): Promise<number> {
  try {
    return await LikeService.getArticleLikeCount(articleId);
  } catch (error) {
    console.error('아티클 좋아요 수 조회 실패:', error);
    return 0;
  }
}