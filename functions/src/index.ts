import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Firebase Admin 초기화
admin.initializeApp();

// 카카오 로그인 검증 및 사용자 생성
export const verifyKakaoLogin = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const { accessToken } = data;

  if (!accessToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Access token is required');
  }

  try {
    // 카카오 API로 사용자 정보 조회
    const kakaoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const kakaoUser = kakaoResponse.data;
    
    // 사용자 정보 추출
    const uid = `kakao:${kakaoUser.id}`;
    const email = kakaoUser.kakao_account?.email;
    const displayName = kakaoUser.kakao_account?.profile?.nickname;
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url;

    // Firebase Auth에 사용자 생성 또는 업데이트
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUser(uid);
      
      // 기존 사용자 정보 업데이트
      await admin.auth().updateUser(uid, {
        displayName,
        photoURL,
        email: email || undefined
      });
    } catch (error) {
      // 새 사용자 생성
      firebaseUser = await admin.auth().createUser({
        uid,
        email: email || undefined,
        displayName,
        photoURL,
        emailVerified: !!email
      });
    }

    // Firestore에 사용자 정보 저장
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      email: email || null,
      displayName,
      photoURL,
      provider: 'kakao',
      kakaoId: kakaoUser.id,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: firebaseUser.metadata.creationTime,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 커스텀 토큰 생성
    const customToken = await admin.auth().createCustomToken(uid);

    return {
      customToken,
      user: {
        uid,
        email: email || null,
        displayName,
        photoURL
      }
    };

  } catch (error) {
    console.error('Kakao login verification failed:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify Kakao login');
  }
});

// 좋아요한 아티클 저장
export const saveLikedArticle = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { articleId, isLiked } = data;
  const uid = context.auth.uid;

  if (!articleId || typeof isLiked !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Article ID and like status are required');
  }

  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    
    if (isLiked) {
      // 좋아요 추가
      await userRef.update({
        likedArticles: admin.firestore.FieldValue.arrayUnion(articleId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // 좋아요 제거
      await userRef.update({
        likedArticles: admin.firestore.FieldValue.arrayRemove(articleId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save liked article:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save liked article');
  }
});

// 좋아요한 아티클 목록 조회
export const getLikedArticles = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return { likedArticles: [] };
    }

    const userData = userDoc.data();
    return { likedArticles: userData?.likedArticles || [] };
  } catch (error) {
    console.error('Failed to get liked articles:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get liked articles');
  }
});