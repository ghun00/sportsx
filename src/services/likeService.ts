import { 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery
} from 'firebase/firestore';
import { UserLike, LikeToggleResponse } from '@/types';
import { 
  getUserLikeRef,
  getUserLikesCollection,
  convertFirestoreDoc,
  handleFirestoreError,
  getServerTimestamp
} from '@/lib/firebase-utils';
import { ArticleService } from './articleService';

export class LikeService {
  // 좋아요 토글
  static async toggleLike(userId: string, articleId: string): Promise<LikeToggleResponse> {
    try {
      const likeRef = getUserLikeRef(userId, articleId);
      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        const existingLike = convertFirestoreDoc<UserLike>(likeDoc);
        
        if (existingLike?.isActive) {
          // 좋아요 취소
          await updateDoc(likeRef, {
            isActive: false,
            updatedAt: getServerTimestamp()
          });
          
          // 아티클 좋아요 수 감소
          await ArticleService.decrementLikeCount(articleId);
          
          return {
            isLiked: false,
            likeCount: await this.getArticleLikeCount(articleId)
          };
        } else {
          // 좋아요 재활성화
          await updateDoc(likeRef, {
            isActive: true,
            updatedAt: getServerTimestamp()
          });
          
          // 아티클 좋아요 수 증가
          await ArticleService.incrementLikeCount(articleId);
          
          return {
            isLiked: true,
            likeCount: await this.getArticleLikeCount(articleId)
          };
        }
      } else {
        // 새 좋아요 생성
        const newLike = {
          userId,
          articleId,
          createdAt: getServerTimestamp(),
          isActive: true
        };
        
        await setDoc(likeRef, newLike);
        
        // 아티클 좋아요 수 증가
        await ArticleService.incrementLikeCount(articleId);
        
        return {
          isLiked: true,
          likeCount: await this.getArticleLikeCount(articleId)
        };
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      throw new Error(handleFirestoreError(error));
    }
  }

  // 사용자가 특정 아티클을 좋아요했는지 확인
  static async isArticleLiked(userId: string, articleId: string): Promise<boolean> {
    try {
      const likeRef = getUserLikeRef(userId, articleId);
      const likeDoc = await getDoc(likeRef);
      
      if (!likeDoc.exists()) {
        return false;
      }
      
      const like = convertFirestoreDoc<UserLike>(likeDoc);
      return like?.isActive || false;
    } catch (error) {
      console.error('좋아요 상태 확인 오류:', error);
      return false;
    }
  }

  // 사용자의 모든 좋아요한 아티클 조회
  static async getUserLikedArticles(userId: string, limitCount: number = 50): Promise<string[]> {
    try {
      const userLikesRef = getUserLikesCollection();
      const q = query(
        userLikesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limitQuery(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => {
          const like = convertFirestoreDoc<UserLike>(doc);
          return like;
        })
        .filter(like => like && like.isActive) // 클라이언트에서 isActive 필터링
        .map(like => like!.articleId);
    } catch (error) {
      console.error('사용자 좋아요 목록 조회 오류:', error);
      return [];
    }
  }

  // 특정 아티클의 좋아요 수 조회
  static async getArticleLikeCount(articleId: string): Promise<number> {
    try {
      const userLikesRef = getUserLikesCollection();
      const q = query(
        userLikesRef,
        where('articleId', '==', articleId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('아티클 좋아요 수 조회 오류:', error);
      return 0;
    }
  }

  // 특정 아티클의 좋아요한 사용자 목록 조회
  static async getArticleLikedUsers(articleId: string, limitCount: number = 100): Promise<string[]> {
    try {
      const userLikesRef = getUserLikesCollection();
      const q = query(
        userLikesRef,
        where('articleId', '==', articleId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limitQuery(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const like = convertFirestoreDoc<UserLike>(doc);
        return like?.userId || '';
      }).filter(Boolean);
    } catch (error) {
      console.error('아티클 좋아요 사용자 목록 조회 오류:', error);
      return [];
    }
  }

  // 사용자의 좋아요 통계
  static async getUserLikeStats(userId: string): Promise<{
    totalLikes: number;
    recentLikes: number;
  }> {
    try {
      const userLikesRef = getUserLikesCollection();
      
      // 전체 좋아요 수
      const totalQuery = query(
        userLikesRef,
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const totalSnapshot = await getDocs(totalQuery);
      
      // 최근 7일 좋아요 수 (현재는 전체로 대체)
      const recentQuery = query(
        userLikesRef,
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limitQuery(10)
      );
      
      const recentSnapshot = await getDocs(recentQuery);
      
      return {
        totalLikes: totalSnapshot.size,
        recentLikes: recentSnapshot.size
      };
    } catch (error) {
      console.error('사용자 좋아요 통계 조회 오류:', error);
      return {
        totalLikes: 0,
        recentLikes: 0
      };
    }
  }

  // 좋아요 데이터 일괄 삭제 (사용자 삭제 시)
  static async deleteUserLikes(userId: string): Promise<void> {
    try {
      const userLikesRef = getUserLikesCollection();
      const q = query(
        userLikesRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`사용자 ${userId}의 모든 좋아요 데이터 삭제 완료`);
    } catch (error) {
      console.error('사용자 좋아요 데이터 삭제 오류:', error);
      throw new Error(handleFirestoreError(error));
    }
  }

  // 좋아요 데이터 정리 (비활성 좋아요 삭제)
  static async cleanupInactiveLikes(): Promise<void> {
    try {
      const userLikesRef = getUserLikesCollection();
      const q = query(
        userLikesRef,
        where('isActive', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`비활성 좋아요 ${querySnapshot.size}개 삭제 완료`);
    } catch (error) {
      console.error('비활성 좋아요 정리 오류:', error);
      throw new Error(handleFirestoreError(error));
    }
  }
}
