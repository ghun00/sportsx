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
    // Firebase에서 먼저 시도
    const firebaseArticle = await ArticleService.getArticleById(id);
    if (firebaseArticle) {
      return firebaseArticle;
    }
    
    // Firebase에서 찾지 못한 경우 JSON 파일에서 검색
    console.log('🔄 Firebase에서 아티클을 찾지 못했습니다. JSON 파일에서 검색 중...');
    
    // JSON 파일에서 아티클 검색
    const articles = await import('@/app/_data/articles.json');
    const article = articles.default.find((a: unknown) => {
      if (typeof a === 'object' && a !== null && 'id' in a) {
        return (a as { id: string }).id === id;
      }
      return false;
    });
    
    if (article) {
      const articleData = article as {
        id: string;
        title_kr: string;
        title_en?: string;
        summary_kr?: string[];
        summary_en?: string[];
        content_kr?: string;
        content_en?: string;
        image?: string;
        source?: string;
        source_url?: string;
        categories?: string[];
        published_at?: string;
      };
      
      console.log('✅ JSON 파일에서 아티클을 찾았습니다:', articleData.title_kr);
      
      // JSON 데이터를 Article 타입으로 변환
      const convertedArticle: Article = {
        id: articleData.id,
        title_kr: articleData.title_kr,
        title_en: articleData.title_en || '',
        summary_kr: articleData.summary_kr || [],
        summary_en: articleData.summary_en || [],
        content_kr: articleData.content_kr || '',
        content_en: articleData.content_en || '',
        image: articleData.image || '',
        source: articleData.source || '',
        source_url: articleData.source_url || '',
        categories: articleData.categories || [],
        status: 'published',
        viewCount: 0,
        likeCount: 0,
        tags: articleData.categories || [], // categories를 tags로 매핑
        createdBy: 'system', // JSON 데이터는 시스템에서 생성
        published_at: new Date(articleData.published_at || new Date()),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return convertedArticle;
    }
    
    console.log('❌ JSON 파일에서도 아티클을 찾을 수 없습니다:', id);
    return null;
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
    return ['전체', '스포츠산업', '마케팅 & 팬덤', '미디어 & 콘텐츠', '데이터 & 분석', '테크 & 혁신', '커리어 & 인재', '글로벌 트렌드', '기타']; // 기본 카테고리
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

