'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getArticleById, incrementViewCount } from '@/lib/articles';
import { isArticleLiked, toggleArticleLike } from '@/lib/likes';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/contexts/LoginContext';
import { trackArticleView } from '@/lib/analytics';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // Next.js 15에서 params가 Promise이므로 use()로 unwrap
  const { id } = use(params);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const { openLoginPopup } = useLogin();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        console.log('🔄 아티클 로드 시작:', id);
        
        // 아티클 데이터 로드
        const articleData = await getArticleById(id);
        console.log('📄 아티클 데이터:', articleData);
        
        if (!articleData) {
          console.log('❌ 아티클을 찾을 수 없습니다');
          notFound();
          setLoading(false);
          return;
        }
        
        setArticle(articleData);
        setLoading(false);
        
        // GA4 아티클 뷰 이벤트 추적
        trackArticleView(articleData.id, articleData.title_kr, articleData.categories[0]);
        
        // 좋아요 상태 확인
        try {
          const liked = await isArticleLiked(articleData.id);
          setIsLiked(liked);
        } catch (error) {
          console.warn('좋아요 상태 확인 실패:', error);
          setIsLiked(false);
        }
        
        // 조회수 증가
        try {
          await incrementViewCount(articleData.id);
        } catch (error) {
          console.warn('조회수 증가 실패:', error);
        }
        
        // 페이지 로드 애니메이션
        setTimeout(() => {
          setIsPageLoaded(true);
        }, 100);
      } catch (error) {
        console.error('아티클 로드 실패:', error);
        setLoading(false);
        notFound();
      }
    };

    loadArticle();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!article) return;
    
    // 로그인하지 않은 경우 로그인 팝업 표시
    if (!isLoggedIn) {
      openLoginPopup();
      return;
    }
    
    try {
      const newLikedState = await toggleArticleLike(article.id);
      setIsLiked(newLikedState);
      
      // 애니메이션 효과
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: 'var(--text)' }}>
            아티클을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>아티클을 찾을 수 없습니다</h1>
          <Link href="/">
            <Button style={{ backgroundColor: 'var(--blue)', color: 'white' }}>
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ backgroundColor: 'var(--bg)' }}>
      {/* 상단 바 (모바일/PC 공통) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:bg-white/10"
            style={{ color: 'var(--text)' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* 하트 버튼 */}
          <button
            onClick={handleLikeToggle}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105',
              isAnimating && 'scale-110'
            )}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: isLiked ? '#ef4444' : 'var(--text)'
            }}
          >
            <Heart className={cn('w-5 h-5 transition-all duration-200', isLiked && 'fill-current')} />
          </button>
          </div>
        </div>
      </header>
      
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-700 delay-200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        <article className="max-w-4xl mx-auto">
          {/* 대표 이미지 */}
          <div className={`relative aspect-video mb-8 rounded-2xl overflow-hidden transition-all duration-800 delay-300 ${isPageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <Image
              src={article.image}
              alt={article.title_kr}
              fill
              className="object-cover transition-transform duration-800"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          {/* 헤더 */}
          <header className={`mb-8 transition-all duration-600 delay-400 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* 제목 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight transition-all duration-700 delay-500" style={{ color: 'var(--text)' }}>
              {article.title_kr}
            </h1>

          {/* 메타 정보 */}
          <div className={`flex items-center space-x-4 text-sm mb-6 transition-all duration-500 delay-600 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ color: 'var(--muted)' }}>
            <span>{article.source}</span>
            <span>•</span>
            <time dateTime={article.published_at instanceof Date ? article.published_at.toISOString() : new Date(article.published_at).toISOString()}>
              {new Date(article.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

            {/* 카테고리 태그 */}
            <div className={`flex flex-wrap gap-2 mb-8 transition-all duration-500 delay-700 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              {article.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="bg-sx-blue/10 text-sx-blue border-sx-blue/20"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </header>

          {/* AI 3줄 요약 */}
          <section className={`mb-8 transition-all duration-600 delay-800 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>AI 3줄 요약</h2>
            <div className="p-6 rounded-lg border transition-all duration-700 delay-900 summary-content" style={{ backgroundColor: 'var(--panel)', borderColor: 'var(--border)' }}>
              <ul className="space-y-3">
                {article.summary_kr.map((point, index) => (
                  <li key={index} className={`flex items-start transition-all duration-500 ${isPageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: `${1000 + index * 100}ms` }}>
                    <span className="w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0" style={{ backgroundColor: 'white' }}></span>
                    <span style={{ color: 'var(--text)' }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 본문 */}
          <section className={`mb-8 transition-all duration-700 delay-1000 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div 
              className="prose prose-invert prose-xl max-w-none article-content
                prose-headings:text-sx-text prose-headings:font-bold
                prose-p:text-sx-text prose-p:leading-[1.5]
                prose-a:text-sx-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-sx-text prose-strong:font-semibold
                prose-ul:text-sx-text prose-ol:text-sx-text
                prose-li:text-sx-text prose-li:leading-[1.5]
                prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6 prose-h2:tracking-tight
                prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-h3:tracking-tight"
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.5'
              }}
              dangerouslySetInnerHTML={{ __html: article.content_kr }}
            />
          </section>

          {/* 원문 바로가기 */}
          <section className={`border-t pt-8 transition-all duration-600 delay-1200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>원문 보기</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  이 아티클의 원문을 {article.source}에서 확인하세요.
                </p>
              </div>
              
              <Link href={article.source_url} target="_blank" rel="noopener noreferrer">
                <Button 
                  className="text-white transition-all duration-500 delay-1300 hover:scale-105"
                  style={{ backgroundColor: 'var(--blue)' }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  원문 바로가기
                </Button>
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center" style={{ color: 'var(--muted)' }}>
            <p>&copy; 2025 스포츠엑스. 해외 스포츠 산업의 흐름을 한국어로 읽다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
