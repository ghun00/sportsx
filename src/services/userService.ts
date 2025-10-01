import { 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { User } from '@/types';
import { 
  getUserRef, 
  getUsersCollection,
  convertFirestoreDoc,
  handleFirestoreError,
  getServerTimestamp,
  isFirebaseInitialized,
  getCurrentUserId
} from '@/lib/firebase-utils';

export class UserService {
  // 새 유저 생성 또는 업데이트
  static async createOrUpdateUser(userData: Partial<User>): Promise<{ user: User; isNewUser: boolean }> {
    try {
      // Firebase 초기화 상태 확인
      if (!isFirebaseInitialized()) {
        console.error('❌ Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.');
        throw new Error('Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.');
      }

      if (!userData.id) {
        throw new Error('유저 ID가 필요합니다.');
      }

      console.log('🔍 Firebase 사용자 생성/업데이트 시작:', { userId: userData.id, nickname: userData.nickname });

      const userRef = getUserRef(userData.id);
      const userDoc = await getDoc(userRef);
      
      const now = getServerTimestamp();
      let isNewUser = false;
      
      if (userDoc.exists()) {
        // 기존 유저 업데이트
        console.log('🔍 기존 사용자 업데이트:', userData.id);
        
        // undefined 값들을 제거한 업데이트 데이터 생성
        const updateData: Record<string, unknown> = {
          lastLoginAt: now,
          updatedAt: now
        };
        
        // userData에서 undefined가 아닌 값들만 추가
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
        
        await updateDoc(userRef, updateData);
      } else {
        // 새 유저 생성
        isNewUser = true;
        console.log('🔍 새 사용자 생성:', userData.id);
        const newUser = {
          email: userData.email || '',
          nickname: userData.nickname || '익명',
          ...(userData.profileImage && { profileImage: userData.profileImage }),
          provider: userData.provider || 'kakao',
          role: 'user', // 기본값은 일반 유저
          createdAt: now,
          lastLoginAt: now,
          isActive: true,
          preferences: {
            notifications: true,
            emailMarketing: false
          }
        };
        
        await setDoc(userRef, newUser);
        console.log('✅ 새 사용자 Firebase에 저장 완료');
      }
      
      // 업데이트된 유저 데이터 반환
      const updatedUserDoc = await getDoc(userRef);
      const user = convertFirestoreDoc<User>(updatedUserDoc);
      
      if (!user) {
        throw new Error('유저 데이터를 가져올 수 없습니다.');
      }
      
      console.log('✅ Firebase 사용자 처리 완료:', { userId: user.id, isNewUser, nickname: user.nickname });
      return { user, isNewUser };
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 유저 ID로 유저 정보 조회
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = getUserRef(userId);
      const userDoc = await getDoc(userRef);
      
      return convertFirestoreDoc<User>(userDoc);
    } catch (error) {
      console.error('유저 조회 오류:', error);
      return null;
    }
  }

  // 이메일로 유저 조회
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = getUsersCollection();
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      return convertFirestoreDoc<User>(userDoc);
    } catch (error) {
      console.error('이메일로 유저 조회 오류:', error);
      return null;
    }
  }

  // 유저 정보 업데이트
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = getUserRef(userId);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: getServerTimestamp()
      });
      
      // 업데이트된 유저 데이터 반환
      const updatedUserDoc = await getDoc(userRef);
      const user = convertFirestoreDoc<User>(updatedUserDoc);
      
      if (!user) {
        throw new Error('유저 데이터를 가져올 수 없습니다.');
      }
      
      return user;
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 유저 비활성화 (소프트 삭제)
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const userRef = getUserRef(userId);
      
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: getServerTimestamp()
      });
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 관리자 권한 부여
  static async grantAdminRole(userId: string): Promise<void> {
    try {
      const userRef = getUserRef(userId);
      
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: getServerTimestamp()
      });
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 관리자 권한 제거
  static async revokeAdminRole(userId: string): Promise<void> {
    try {
      const userRef = getUserRef(userId);
      
      await updateDoc(userRef, {
        role: 'user',
        updatedAt: getServerTimestamp()
      });
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 유저 선호도 업데이트
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<User['preferences']>
  ): Promise<void> {
    try {
      const userRef = getUserRef(userId);
      
      await updateDoc(userRef, {
        'preferences': preferences,
        updatedAt: getServerTimestamp()
      });
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 모든 사용자 조회 (관리자용)
  static async getAllUsers(params?: {
    limit?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }): Promise<{ users: User[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      const usersRef = getUsersCollection();
      const queryConstraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc')
      ];

      if (params?.limit) {
        queryConstraints.push(limit(params.limit));
      }

      if (params?.lastDoc) {
        queryConstraints.push(startAfter(params.lastDoc));
      }

      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const user = convertFirestoreDoc<User>(doc);
        if (user) {
          users.push(user);
        }
      });

      return {
        users,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 활성 사용자 수 조회
  static async getActiveUserCount(): Promise<number> {
    try {
      const usersRef = getUsersCollection();
      const q = query(usersRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.size;
    } catch (error) {
      console.error('활성 사용자 수 조회 오류:', error);
      return 0;
    }
  }

  // 최근 가입자 조회
  static async getRecentUsers(limitCount: number = 10): Promise<User[]> {
    try {
      const usersRef = getUsersCollection();
      const q = query(
        usersRef, 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const user = convertFirestoreDoc<User>(doc);
        if (user) {
          users.push(user);
        }
      });

      return users;
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 온보딩 정보 업데이트
  static async updateUserOnboarding(onboardingData: {
    career_stage?: '대학생' | '취업 준비중' | '스포츠 관련 종사자' | '기타';
    interests?: string[];
    usage_purpose?: '커리어 준비에 도움' | '산업 트렌드 학습' | '재미·호기심';
  }): Promise<void> {
    try {
      // Firebase 초기화 상태 확인
      if (!isFirebaseInitialized()) {
        throw new Error('Firebase가 초기화되지 않았습니다.');
      }

      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('🔍 온보딩 정보 업데이트 시작:', { userId: currentUserId, onboardingData });

      const userRef = getUserRef(currentUserId);
      
      // undefined 값들을 제거한 업데이트 데이터 생성
      const updateData: Record<string, unknown> = {
        updatedAt: getServerTimestamp()
      };
      
      // 온보딩 데이터에서 undefined가 아닌 값들만 추가
      Object.entries(onboardingData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });
      
      await updateDoc(userRef, updateData);
      console.log('✅ 온보딩 정보 업데이트 완료');
    } catch (error) {
      throw new Error(handleFirestoreError(error));
    }
  }

  // 온보딩 정보 필요 여부 확인
  static async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const userRef = getUserRef(userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return true; // 사용자가 없으면 온보딩 필요
      }
      
      const user = convertFirestoreDoc<User>(userDoc);
      if (!user) {
        return true;
      }
      
      // 3개 필드 중 하나라도 비어있으면 온보딩 필요
      return !user.career_stage || !user.interests || user.interests.length === 0 || !user.usage_purpose;
    } catch (error) {
      console.error('온보딩 필요 여부 확인 오류:', error);
      return false; // 에러 시 온보딩 표시하지 않음
    }
  }
}
