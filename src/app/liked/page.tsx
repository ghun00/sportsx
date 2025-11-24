'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLikedArticles } from '@/lib/likes';
import { getArticleById } from '@/lib/articles';
import { Article } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import AppBar from '@/components/AppBar';

export default function LikedArticlesPage() {
  const { isLoggedIn } = useAuth();
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikedArticles = async () => {
      try {
        setLoading(true);
        
        if (isLoggedIn) {
          console.log('🔍 좋아요한 아티클 ID 조회 시작...');
          const likedIds = await getLikedArticles();
          console.log('🔍 좋아요한 아티클 ID들:', likedIds);
          
          if (likedIds.length > 0) {
            console.log('🔍 아티클 상세 정보 조회 시작...');
            // 좋아요한 아티클들을 개별적으로 조회
            const articlePromises = likedIds.map(id => getArticleById(id));
            
            const articles = (await Promise.all(articlePromises))
              .filter(Boolean)
              .filter(article => article && article.status !== 'archived') as Article[];
            
            // 생성일 기준으로 최신순 정렬
            const sortedArticles = articles.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            console.log('🔍 조회된 아티클들 (archived 제외, 생성일 정렬):', sortedArticles);
            setLikedArticles(sortedArticles);
          } else {
            console.log('🔍 좋아요한 아티클이 없음');
            setLikedArticles([]);
          }
        } else {
          console.log('🔍 로그인되지 않음');
          setLikedArticles([]);
        }
      } catch (error) {
        console.error('좋아요한 아티클 로드 실패:', error);
        setLikedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikedArticles();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              로그인이 필요합니다
            </h1>
            <p style={{ color: 'var(--text)' }}>
              좋아요한 게시물을 보려면 로그인해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--blue)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <AppBar />
      <div className="container mx-auto px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-8 tracking-tight" style={{ color: 'var(--text)' }}>
            좋아요한 게시물
          </h2>
        </div>

        {/* 게시물 그리드 */}
        {likedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💙</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              아직 좋아요한 게시물이 없습니다
            </h2>
            <p style={{ color: 'var(--text)' }}>
              마음에 드는 아티클에 하트를 눌러보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
