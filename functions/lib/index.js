"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikedArticles = exports.saveLikedArticle = exports.verifyKakaoLogin = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// Firebase Admin 초기화
admin.initializeApp();
// 카카오 로그인 검증 및 사용자 생성
exports.verifyKakaoLogin = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e;
    const { accessToken } = data;
    if (!accessToken) {
        throw new functions.https.HttpsError('invalid-argument', 'Access token is required');
    }
    try {
        // 카카오 API로 사용자 정보 조회
        const kakaoResponse = await axios_1.default.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });
        const kakaoUser = kakaoResponse.data;
        // 사용자 정보 추출
        const uid = `kakao:${kakaoUser.id}`;
        const email = (_a = kakaoUser.kakao_account) === null || _a === void 0 ? void 0 : _a.email;
        const displayName = (_c = (_b = kakaoUser.kakao_account) === null || _b === void 0 ? void 0 : _b.profile) === null || _c === void 0 ? void 0 : _c.nickname;
        const photoURL = (_e = (_d = kakaoUser.kakao_account) === null || _d === void 0 ? void 0 : _d.profile) === null || _e === void 0 ? void 0 : _e.profile_image_url;
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
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Kakao login verification failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to verify Kakao login');
    }
});
// 좋아요한 아티클 저장
exports.saveLikedArticle = functions.https.onCall(async (data, context) => {
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
        }
        else {
            // 좋아요 제거
            await userRef.update({
                likedArticles: admin.firestore.FieldValue.arrayRemove(articleId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        return { success: true };
    }
    catch (error) {
        console.error('Failed to save liked article:', error);
        throw new functions.https.HttpsError('internal', 'Failed to save liked article');
    }
});
// 좋아요한 아티클 목록 조회
exports.getLikedArticles = functions.https.onCall(async (data, context) => {
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
        return { likedArticles: (userData === null || userData === void 0 ? void 0 : userData.likedArticles) || [] };
    }
    catch (error) {
        console.error('Failed to get liked articles:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get liked articles');
    }
});
//# sourceMappingURL=index.js.map