import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import articlesData from '../app/_data/articles.json';

// Firebase 설정 (마이그레이션용)
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

// 아티클 데이터 마이그레이션
async function migrateArticles() {
  try {
    console.log('🚀 아티클 데이터 마이그레이션 시작...');
    
    const articlesCollection = collection(db, 'articles');
    const migratedArticles = [];
    
    for (const article of articlesData) {
      // Firestore에 저장할 데이터 구조로 변환
      const firestoreArticle = {
        id: article.id,
        title_kr: article.title_kr,
        summary_kr: article.summary_kr,
        content_kr: article.content_kr,
        image: article.image,
        source: article.source,
        source_url: article.source_url,
        categories: article.categories,
        published_at: new Date(article.published_at),
        status: 'published' as const,
        viewCount: 0,
        likeCount: 0,
        tags: article.categories, // 카테고리를 태그로도 사용
        createdBy: 'system', // 시스템에서 생성된 것으로 표시
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(articlesCollection, firestoreArticle);
      migratedArticles.push({
        id: article.id,
        firestoreId: docRef.id
      });
      
      console.log(`✅ 아티클 마이그레이션 완료: ${article.title_kr}`);
    }
    
    console.log(`🎉 총 ${migratedArticles.length}개의 아티클이 성공적으로 마이그레이션되었습니다!`);
    return migratedArticles;
    
  } catch (error) {
    console.error('❌ 아티클 마이그레이션 실패:', error);
    throw error;
  }
}

// 카테고리 데이터 마이그레이션
async function migrateCategories() {
  try {
    console.log('🚀 카테고리 데이터 마이그레이션 시작...');
    
    // 기존 아티클에서 고유한 카테고리 추출
    const uniqueCategories = new Set<string>();
    articlesData.forEach(article => {
      article.categories.forEach(category => uniqueCategories.add(category));
    });
    
    const categoriesCollection = collection(db, 'categories');
    const migratedCategories = [];
    
    let order = 1;
    for (const categoryName of uniqueCategories) {
      const categoryData = {
        name: categoryName,
        description: `${categoryName} 관련 콘텐츠`,
        color: getCategoryColor(categoryName),
        isActive: true,
        order: order++,
        articleCount: articlesData.filter(article => 
          article.categories.includes(categoryName)
        ).length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(categoriesCollection, categoryData);
      migratedCategories.push({
        name: categoryName,
        firestoreId: docRef.id
      });
      
      console.log(`✅ 카테고리 마이그레이션 완료: ${categoryName}`);
    }
    
    console.log(`🎉 총 ${migratedCategories.length}개의 카테고리가 성공적으로 마이그레이션되었습니다!`);
    return migratedCategories;
    
  } catch (error) {
    console.error('❌ 카테고리 마이그레이션 실패:', error);
    throw error;
  }
}

// 카테고리별 색상 매핑
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    '스포츠산업': '#2F80ED',
    '데이터': '#27AE60',
    '기타': '#9B59B6',
    '시설개발': '#E67E22',
    '테니스': '#E74C3C',
    '스포츠비즈니스': '#3498DB',
    '스포츠정책': '#2ECC71',
    '커리어인사이트': '#F39C12',
    '그랜드슬램': '#8E44AD'
  };
  
  return colorMap[categoryName] || '#95A5A6';
}

// 전체 마이그레이션 실행
async function runMigration() {
  try {
    console.log('🚀 Firebase 데이터 마이그레이션을 시작합니다...');
    console.log('='.repeat(50));
    
    // 1. 카테고리 마이그레이션
    await migrateCategories();
    console.log('');
    
    // 2. 아티클 마이그레이션
    await migrateArticles();
    console.log('');
    
    console.log('='.repeat(50));
    console.log('🎉 모든 데이터 마이그레이션이 완료되었습니다!');
    console.log('Firebase Console에서 데이터를 확인해보세요:');
    console.log('https://console.firebase.google.com/project/sportsx-90828/firestore');
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  runMigration();
}

export { migrateArticles, migrateCategories, runMigration };
