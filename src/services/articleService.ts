import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  startAfter,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { Article } from '@/types';
import { 
  getArticlesCollection,
  getArticleRef,
  convertFirestoreDoc,
  handleFirestoreError,
  createPaginatedQuery,
  processPaginatedResponse,
  getServerTimestamp
} from '@/lib/firebase-utils';
import { PaginationParams, PaginatedResponse } from '@/types';

export class ArticleService {
  // 새 아티클 생성
  static async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>): Promise<Article> {
    try {
      const articlesRef = getArticlesCollection();
      
      const newArticle = {
        ...articleData,
        viewCount: 0,
        likeCount: 0,
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp()
      };
      
      const docRef = await addDoc(articlesRef, newArticle);
      
      // 생성된 아티클 반환
      const createdArticle = await getDoc(docRef);
      const article = convertFirestoreDoc<Article>(createdArticle);
      
      if (!article) {
        throw new Error('아티클 생성 후 데이터를 가져올 수 없습니다.');
      }
      
      return article;
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 아티클 ID로 조회
  static async getArticleById(articleId: string): Promise<Article | null> {
    try {
      const articleRef = getArticleRef(articleId);
      const articleDoc = await getDoc(articleRef);
      
      return convertFirestoreDoc<Article>(articleDoc);
    } catch (error) {
      console.error('아티클 조회 오류:', error);
      return null;
    }
  }

  // 모든 아티클 조회 (페이지네이션)
  static async getArticles(
    paginationParams?: PaginationParams,
    category?: string,
    status: 'published' | 'draft' | 'all' = 'published'
  ): Promise<PaginatedResponse<Article>> {
    try {
      const { limit: pageLimit = 20 } = paginationParams || {};
      
      let constraints = [];
      
      // 상태 필터링
      if (status !== 'all') {
        constraints.push(where('status', '==', status));
      }
      
      // 카테고리 필터링
      if (category && category !== '전체') {
        constraints.push(where('categories', 'array-contains', category));
      }
      
      // 정렬 (최신순)
      constraints.push(orderBy('published_at', 'desc'));
      
      const q = createPaginatedQuery('articles', constraints, paginationParams);
      const querySnapshot = await getDocs(q);
      
      return processPaginatedResponse<Article>(querySnapshot.docs, pageLimit);
    } catch (error) {
      console.error('아티클 목록 조회 오류:', error);
      return {
        data: [],
        hasMore: false
      };
    }
  }

  // 인기 아티클 조회 (최신 발행일 기준)
  static async getPopularArticles(limitCount: number = 3): Promise<Article[]> {
    try {
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        where('status', '==', 'published'),
        orderBy('published_at', 'desc'),
        limitQuery(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
    } catch (error) {
      console.error('인기 아티클 조회 오류:', error);
      return [];
    }
  }

  // 카테고리별 아티클 조회
  static async getArticlesByCategory(
    category: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<Article>> {
    try {
      const { limit: pageLimit = 20 } = paginationParams || {};
      
      const constraints = [
        where('status', '==', 'published'),
        where('categories', 'array-contains', category),
        orderBy('published_at', 'desc')
      ];
      
      const q = createPaginatedQuery('articles', constraints, paginationParams);
      const querySnapshot = await getDocs(q);
      
      return processPaginatedResponse<Article>(querySnapshot.docs, pageLimit);
    } catch (error) {
      console.error('카테고리별 아티클 조회 오류:', error);
      return {
        data: [],
        hasMore: false
      };
    }
  }

  // 아티클 업데이트
  static async updateArticle(articleId: string, updates: Partial<Article>): Promise<Article> {
    try {
      const articleRef = getArticleRef(articleId);
      
      await updateDoc(articleRef, {
        ...updates,
        updatedAt: getServerTimestamp()
      });
      
      // 업데이트된 아티클 반환
      const updatedArticle = await getDoc(articleRef);
      const article = convertFirestoreDoc<Article>(updatedArticle);
      
      if (!article) {
        throw new Error('아티클 데이터를 가져올 수 없습니다.');
      }
      
      return article;
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 아티클 삭제 (소프트 삭제)
  static async deleteArticle(articleId: string): Promise<void> {
    try {
      const articleRef = getArticleRef(articleId);
      
      await updateDoc(articleRef, {
        status: 'archived',
        updatedAt: getServerTimestamp()
      });
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 아티클 조회수 증가
  static async incrementViewCount(articleId: string): Promise<void> {
    try {
      const articleRef = getArticleRef(articleId);
      
      await updateDoc(articleRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('조회수 증가 오류:', error);
      // 조회수 증가 실패는 사용자 경험에 영향을 주지 않도록 에러를 던지지 않음
    }
  }

  // 아티클 좋아요 수 증가
  static async incrementLikeCount(articleId: string): Promise<void> {
    try {
      const articleRef = getArticleRef(articleId);
      
      await updateDoc(articleRef, {
        likeCount: increment(1)
      });
    } catch (error) {
      console.error('좋아요 수 증가 오류:', error);
    }
  }

  // 아티클 좋아요 수 감소
  static async decrementLikeCount(articleId: string): Promise<void> {
    try {
      const articleRef = getArticleRef(articleId);
      
      await updateDoc(articleRef, {
        likeCount: increment(-1)
      });
    } catch (error) {
      console.error('좋아요 수 감소 오류:', error);
    }
  }

  // 아티클 검색
  static async searchArticles(
    searchTerm: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<Article>> {
    try {
      const { limit: pageLimit = 20 } = paginationParams || {};
      
      // Firestore는 전체 텍스트 검색을 지원하지 않으므로
      // 제목과 태그에서 검색하도록 구현
      const constraints = [
        where('status', '==', 'published'),
        orderBy('published_at', 'desc')
      ];
      
      const q = createPaginatedQuery('articles', constraints, paginationParams);
      const querySnapshot = await getDocs(q);
      
      // 클라이언트 사이드에서 필터링
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      const filteredArticles = allArticles.filter(article => 
        article.title_kr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return {
        data: filteredArticles.slice(0, pageLimit),
        hasMore: filteredArticles.length > pageLimit
      };
    } catch (error) {
      console.error('아티클 검색 오류:', error);
      return {
        data: [],
        hasMore: false
      };
    }
  }

  // 모든 카테고리 조회
  static async getAllCategories(): Promise<string[]> {
    try {
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        where('status', '==', 'published')
      );
      
      const querySnapshot = await getDocs(q);
      const categories = new Set<string>();
      
      querySnapshot.docs.forEach(doc => {
        const article = convertFirestoreDoc<Article>(doc);
        if (article?.categories) {
          article.categories.forEach(category => categories.add(category));
        }
      });
      
      return Array.from(categories).sort();
    } catch (error) {
      console.error('카테고리 조회 오류:', error);
      return [];
    }
  }

  // 관리자용 모든 아티클 조회 (초안 포함)
  static async getAllArticlesForAdmin(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResponse<Article>> {
    try {
      const { limit: pageLimit = 20 } = paginationParams || {};
      
      const constraints = [
        orderBy('createdAt', 'desc')
      ];
      
      const q = createPaginatedQuery('articles', constraints, paginationParams);
      const querySnapshot = await getDocs(q);
      
      // 클라이언트에서 archived 상태 제외
      const filteredDocs = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status !== 'archived';
      });
      
      return processPaginatedResponse<Article>(filteredDocs, pageLimit);
    } catch (error) {
      console.error('관리자 아티클 목록 조회 오류:', error);
      return {
        data: [],
        hasMore: false
      };
    }
  }
}
