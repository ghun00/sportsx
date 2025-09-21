// Firebase 기반 아티클 데이터 관리 유틸리티

import { ArticleService } from '@/services/articleService';
import { Article } from '@/types';

// 모든 아티클 조회 (Firebase)
export async function getAllArticles(): Promise<Article[]> {
  try {
    const result = await ArticleService.getArticles({ limit: 100 });
    return result.data;
  } catch (error) {
    console.error('아티클 목록 조회 실패:', error);
    return [];
  }
}

// 인기 아티클 조회 (상위 limit개)
export async function getPopularArticles(limit: number = 3): Promise<Article[]> {
  try {
    return await ArticleService.getPopularArticles(limit);
  } catch (error) {
    console.error('인기 아티클 조회 실패:', error);
    return [];
  }
}

// 카테고리별 아티클 조회
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  try {
    if (category === '전체' || !category) {
      const result = await ArticleService.getArticles({ limit: 50 });
      return result.data;
    }
    
    const result = await ArticleService.getArticlesByCategory(category, { limit: 50 });
    return result.data;
  } catch (error) {
    console.error('카테고리별 아티클 조회 실패:', error);
    return [];
  }
}

// 카테고리 필터링 (기존 호환성 유지)
export async function getFilteredArticles(categories: string[]): Promise<Article[]> {
  try {
    if (categories.length === 0) {
      const result = await ArticleService.getArticles({ limit: 50 });
      return result.data;
    }
    
    // 첫 번째 카테고리로 필터링 (기존 로직과 호환성 유지)
    const result = await ArticleService.getArticlesByCategory(categories[0], { limit: 50 });
    return result.data;
  } catch (error) {
    console.error('카테고리별 아티클 조회 실패:', error);
    return [];
  }
}

// 특정 아티클 조회
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    return await ArticleService.getArticleById(id);
  } catch (error) {
    console.error('아티클 조회 실패:', error);
    return null;
  }
}

// 모든 카테고리 조회
export async function getAllCategories(): Promise<string[]> {
  try {
    return await ArticleService.getAllCategories();
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error);
    return ['전체', '스포츠산업', '데이터', '기타']; // 기본 카테고리
  }
}

// 조회수 증가
export async function incrementViewCount(id: string): Promise<void> {
  try {
    await ArticleService.incrementViewCount(id);
  } catch (error) {
    console.error('조회수 증가 실패:', error);
  }
}

export function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

