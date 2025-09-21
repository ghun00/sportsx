import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 카테고리 매핑
const categoryMapping: Record<string, string> = {
  '데이터': '데이터 & 분석',
  '스포츠산업': '스포츠산업',
  '기타': '기타'
};

async function updateArticleCategories() {
  try {
    console.log('🔄 아티클 카테고리 업데이트 시작...');
    
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    let updatedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const articleData = docSnapshot.data();
      const oldCategories = articleData.categories || [];
      
      // 카테고리 매핑 적용
      const newCategories = oldCategories.map((cat: string) => {
        return categoryMapping[cat] || cat;
      });
      
      // 변경사항이 있는 경우에만 업데이트
      if (JSON.stringify(oldCategories) !== JSON.stringify(newCategories)) {
        await updateDoc(doc(db, 'articles', docSnapshot.id), {
          categories: newCategories,
          tags: newCategories, // 태그도 함께 업데이트
          updatedAt: new Date()
        });
        
        console.log(`✅ 아티클 업데이트: ${articleData.title_kr}`);
        console.log(`   기존: ${oldCategories.join(', ')}`);
        console.log(`   신규: ${newCategories.join(', ')}`);
        updatedCount++;
      }
    }
    
    console.log(`🎉 카테고리 업데이트 완료! ${updatedCount}개 아티클 업데이트됨`);
    
  } catch (error) {
    console.error('❌ 카테고리 업데이트 실패:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  updateArticleCategories();
}

export { updateArticleCategories };
