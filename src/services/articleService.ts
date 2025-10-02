import { 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  updateDoc,
  increment,
  addDoc
} from 'firebase/firestore';
import { Article } from '@/types';
import { 
  getArticlesCollection,
  getArticleRef,
  convertFirestoreDoc,
  handleFirestoreError,
  createPaginatedQuery,
  processPaginatedResponse,
  getServerTimestamp,
  isFirebaseInitialized
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
      console.log('🔍 아티클 조회 시작:', articleId);
      console.log('🔍 Firebase 초기화 상태:', isFirebaseInitialized());
      
      // Firebase가 초기화되지 않은 경우 처리
      if (!isFirebaseInitialized()) {
        console.warn('Firebase가 초기화되지 않았습니다. 아티클 조회를 건너뜁니다.');
        return null;
      }
      
      const articleRef = getArticleRef(articleId);
      console.log('🔍 아티클 참조 생성:', articleRef);
      
      const articleDoc = await getDoc(articleRef);
      console.log('🔍 문서 스냅샷:', articleDoc);
      
      const result = convertFirestoreDoc<Article>(articleDoc);
      console.log('🔍 변환된 아티클:', result);
      
      return result;
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
      
      // 인덱스 없이 작동하도록 단순화된 쿼리
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        limitQuery(pageLimit)
      );
      
      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      // 클라이언트 사이드에서 필터링
      let filteredArticles = allArticles;
      
      // 상태 필터링
      if (status !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.status === status);
      }
      
      // 카테고리 필터링
      if (category && category !== '전체') {
        filteredArticles = filteredArticles.filter(article => 
          article.categories && article.categories.includes(category)
        );
      }
      
      return {
        data: filteredArticles,
        hasMore: false // 단순화를 위해 페이지네이션 비활성화
      };
    } catch (error) {
      console.error('아티클 목록 조회 오류:', error);
      return {
        data: [],
        hasMore: false
      };
    }
  }

  // 인기 아티클 조회 (조회수 + 좋아요 수 복합 점수 기준)
  static async getPopularArticles(limitCount: number = 3): Promise<Article[]> {
    try {
      // 인덱스 없이 작동하도록 단순화된 쿼리
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        limitQuery(50) // 충분한 데이터를 가져와서 인기도 기준으로 정렬
      );
      
      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      // 클라이언트 사이드에서 published 상태만 필터링
      const publishedArticles = allArticles.filter(article => article.status === 'published');
      
      // 인기도 점수 계산 (조회수 * 1 + 좋아요 수 * 3)
      const articlesWithScore = publishedArticles.map(article => ({
        ...article,
        popularityScore: (article.viewCount || 0) * 1 + (article.likeCount || 0) * 3
      }));
      
      // 인기도 점수 기준으로 정렬 (점수가 같으면 조회수 기준, 그것도 같으면 생성일 기준)
      const sortedByPopularity = articlesWithScore.sort((a, b) => {
        const scoreDiff = b.popularityScore - a.popularityScore;
        if (scoreDiff !== 0) return scoreDiff;
        
        const viewDiff = (b.viewCount || 0) - (a.viewCount || 0);
        if (viewDiff !== 0) return viewDiff;
        
        // 조회수도 같으면 생성일 기준으로 정렬
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      console.log('🔥 인기 아티클 (인기도 점수 기준):', sortedByPopularity.slice(0, limitCount).map(a => ({
        title: a.title_kr,
        viewCount: a.viewCount,
        likeCount: a.likeCount,
        popularityScore: a.popularityScore
      })));
      
      // popularityScore 제거하고 원본 Article 객체 반환
      return sortedByPopularity.slice(0, limitCount).map(({ popularityScore, ...article }) => article);
    } catch (error) {
      console.error('인기 아티클 조회 오류:', error);
      return [];
    }
  }

  // 조회수 기준 인기 아티클 (순수 조회수만)
  static async getMostViewedArticles(limitCount: number = 3): Promise<Article[]> {
    try {
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        limitQuery(50)
      );
      
      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      const publishedArticles = allArticles.filter(article => article.status === 'published');
      
      // 조회수 기준으로 정렬
      const sortedByViewCount = publishedArticles.sort((a, b) => {
        const viewDiff = (b.viewCount || 0) - (a.viewCount || 0);
        if (viewDiff !== 0) return viewDiff;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      console.log('👀 조회수 기준 인기 아티클:', sortedByViewCount.slice(0, limitCount).map(a => ({
        title: a.title_kr,
        viewCount: a.viewCount
      })));
      
      return sortedByViewCount.slice(0, limitCount);
    } catch (error) {
      console.error('조회수 기준 인기 아티클 조회 오류:', error);
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
      
      // 인덱스 없이 작동하도록 단순화된 쿼리
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        limitQuery(pageLimit * 2) // 여유분을 두고 가져와서 클라이언트에서 필터링
      );
      
      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      // 클라이언트 사이드에서 필터링
      const filteredArticles = allArticles.filter(article => 
        article.status === 'published' && 
        article.categories && 
        article.categories.includes(category)
      );
      
      return {
        data: filteredArticles.slice(0, pageLimit),
        hasMore: false // 단순화를 위해 페이지네이션 비활성화
      };
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
      
      // 인덱스 없이 작동하도록 단순화된 쿼리
      const articlesRef = getArticlesCollection();
      const q = query(
        articlesRef,
        orderBy('createdAt', 'desc'),
        limitQuery(pageLimit * 3) // 여유분을 두고 가져와서 클라이언트에서 검색
      );
      
      const querySnapshot = await getDocs(q);
      
      // 클라이언트 사이드에서 필터링
      const allArticles = querySnapshot.docs.map(doc => convertFirestoreDoc<Article>(doc)).filter(Boolean) as Article[];
      
      // published 상태와 검색어 필터링
      const filteredArticles = allArticles.filter(article => 
        article.status === 'published' && (
          article.title_kr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          article.categories.some(category => category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
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
