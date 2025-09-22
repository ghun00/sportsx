'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppBar from '@/components/AppBar';
import ArticleCard from '@/components/ArticleCard';
import { getLikedArticles } from '@/lib/likes';
import { getArticleById } from '@/lib/articles';

export default function MyPage() {
  const [, setLikedArticleIds] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);

  useEffect(() => {
    // localStorage에서 좋아요한 아티클 ID 가져오기
    const likedIds = getLikedArticles();
    setLikedArticleIds(likedIds);

    // ID로 실제 아티클 데이터 가져오기 (archived 상태 제외)
    const articles = likedIds
      .map(id => getArticleById(id))
      .filter(Boolean)
      .filter(article => article && article.status !== 'archived');
    setLikedArticles(articles);
  }, []);


  return (
    <div className="min-h-screen bg-sx-bg">
      <AppBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-sx-muted hover:text-sx-text">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-sx-text mb-2">
            마이페이지
          </h1>
          <p className="text-sx-muted">
            좋아요한 아티클을 확인하고 관리하세요
          </p>
        </div>

        {/* 좋아요한 아티클 섹션 */}
        <section>
          <div className="flex items-center mb-6">
            <Heart className="w-6 h-6 text-sx-blue mr-2" />
            <h2 className="text-2xl font-bold text-sx-text">
              좋아요한 아티클
            </h2>
            <span className="ml-3 px-2 py-1 bg-sx-blue/20 text-sx-blue text-sm rounded-full">
              {likedArticles.length}개
            </span>
          </div>

          {likedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedArticles.map((article) => (
                <div key={article.id}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            /* 빈 상태 */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-sx-panel rounded-full mb-6">
                <BookOpen className="w-12 h-12 text-sx-muted" />
              </div>
              <h3 className="text-xl font-semibold text-sx-text mb-2">
                아직 좋아요한 아티클이 없습니다
              </h3>
              <p className="text-sx-muted mb-6">
                관심 있는 아티클에 하트를 눌러 저장해보세요
              </p>
              <Link href="/">
                <Button className="bg-sx-blue hover:bg-sx-blue/90 text-white">
                  아티클 둘러보기
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* 통계 정보 */}
        {likedArticles.length > 0 && (
          <section className="mt-12 p-6 bg-sx-panel rounded-2xl border border-sx-border">
            <h3 className="text-lg font-semibold text-sx-text mb-4">활동 통계</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-sx-blue">
                  {likedArticles.length}
                </div>
                <div className="text-sm text-sx-muted">좋아요한 아티클</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sx-blue">
                  {new Set(likedArticles.flatMap(article => article.categories)).size}
                </div>
                <div className="text-sm text-sx-muted">관심 카테고리</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sx-blue">
                  {likedArticles.reduce((acc, article) => acc + article.categories.length, 0)}
                </div>
                <div className="text-sm text-sx-muted">총 태그 수</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-sx-border bg-sx-panel py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sx-muted">
            <p>&copy; 2025 스포츠엑스. 해외 스포츠 산업의 흐름을 한국어로 읽다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

