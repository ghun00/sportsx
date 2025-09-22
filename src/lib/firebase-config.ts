import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 초기화 (환경변수가 있을 때만)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

// 환경변수가 모두 있는지 확인
const hasValidConfig = Object.values(firebaseConfig).every(value => value !== undefined && value !== '');

if (hasValidConfig) {
  try {
    // Firebase 초기화 시도
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('✅ Firebase 초기화 성공');
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
  }
} else {
  console.warn('⚠️ Firebase 환경변수가 설정되지 않았습니다.');
}

export { db, auth, storage };
export default app;
