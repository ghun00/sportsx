'use client';

import { useState, useEffect } from 'react';
import AppBar from '@/components/AppBar';
import Hero from '@/components/Hero';
import CategoryChips from '@/components/CategoryChips';
import ArticleCard from '@/components/ArticleCard';
import { getAllArticles, getPopularArticles, getAllCategories, getFilteredArticles } from '@/lib/articles';
import { useAuth } from '@/contexts/AuthContext';
import { Article } from '@/types';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 데이터 로드
        const [articles, categories, popular] = await Promise.all([
          getAllArticles(),
          getAllCategories(),
          getPopularArticles(3)
        ]);
        
        setDisplayedArticles(articles);
        setAllCategories(categories);
        setPopularArticles(popular);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 카테고리 필터링
  useEffect(() => {
    const filterArticles = async () => {
      try {
        const filtered = await getFilteredArticles(selectedCategories);
        setDisplayedArticles(filtered);
      } catch (error) {
        console.error('아티클 필터링 실패:', error);
      }
    };

    filterArticles();
  }, [selectedCategories]);

  const handleCategoryToggle = (category: string) => {
    if (category === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <AppBar />
      
      <main>
        {/* Hero 섹션 - 로그인 전에만 표시 */}
        {!isLoggedIn && <Hero />}
        
        <div className="container mx-auto px-6 lg:px-8 pb-20">
          {/* 인기 아티클 섹션 */}
          <section className={`mb-20 ${isLoggedIn ? 'mt-12' : ''}`}>
            <h2 className="text-2xl font-bold mb-8 tracking-tight" style={{ color: 'var(--text)' }}>
              인기 아티클
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 rounded-2xl h-48 mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} showSummary={false} />
                ))}
              </div>
            )}
          </section>

          {/* 카테고리 필터 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-8 tracking-tight" style={{ color: 'var(--text)' }}>
              전체 아티클
            </h2>
            <CategoryChips
              categories={allCategories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
          </section>

          {/* 전체 아티클 그리드 */}
          <section>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 rounded-2xl h-48 mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                
                {displayedArticles.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xl font-light" style={{ color: 'var(--muted)' }}>
                      선택한 카테고리에 해당하는 아티클이 없습니다.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-16" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            
            <p className="text-lg font-light" style={{ color: 'var(--muted)' }}>
              해외 스포츠 산업의 흐름을 한국어로 읽다
            </p>
            
            {/* 피드백 링크 */}
            <div className="mt-6">
              <a
                href="https://sportsx.channel.io/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 rounded-lg"
                style={{ 
                  color: 'var(--blue)',
                  backgroundColor: 'rgba(47, 128, 237, 0.1)',
                  border: '1px solid rgba(47, 128, 237, 0.2)'
                }}
              >
                💬 개선사항 피드백 보내기
              </a>
            </div>
            
            <p className="text-sm mt-4" style={{ color: 'var(--muted)', opacity: 0.7 }}>
              &copy; 2025 스포츠엑스. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
