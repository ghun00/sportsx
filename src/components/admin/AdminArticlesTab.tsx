'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Calendar, Tag } from 'lucide-react';
import { ArticleService } from '@/services/articleService';
import { Article } from '@/types';

export default function AdminArticlesTab() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const result = await ArticleService.getAllArticlesForAdmin({ limit: 100 });
        setArticles(result.data);
      } catch (error: unknown) {
        console.error('아티클 목록 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '아티클 목록을 불러올 수 없습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div>
      {/* 아티클 관리 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
            아티클 목록
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            현재 {articles.length}개의 아티클이 있습니다
          </p>
        </div>
        
        {/* 아티클 생성 버튼 */}
        <Link
          href="/admin/articles/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ 
            backgroundColor: 'var(--blue)',
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4" />
          아티클 생성
        </Link>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 아티클 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 rounded-2xl h-48 mb-4"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-2xl border overflow-hidden transition-all hover:scale-105 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
              onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
            >
              {/* 이미지 */}
              <div className="relative h-48">
                <Image
                  src={article.image}
                  alt={article.title_kr}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Edit className="w-5 h-5 text-white bg-black/50 p-1 rounded" />
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="p-4">
                {/* 제목 */}
                <h3 className="font-bold mb-2 line-clamp-2" style={{ color: 'var(--text)' }}>
                  {article.title_kr}
                </h3>

                {/* 요약 */}
                <div className="mb-3">
                  {article.summary_kr.slice(0, 2).map((summary: string, index: number) => (
                    <p key={index} className="text-sm line-clamp-1 mb-1" style={{ color: 'var(--muted)' }}>
                      • {summary}
                    </p>
                  ))}
                </div>

                {/* 메타 정보 */}
                <div className="space-y-2">
                  {/* 출처 */}
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: 'var(--muted)' }}>출처:</span>
                    <span style={{ color: 'var(--text)' }}>{article.source}</span>
                  </div>

                  {/* 카테고리 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    {article.categories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: 'var(--blue)',
                          color: 'white'
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* 발행일 */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    <span style={{ color: 'var(--muted)' }}>
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--panel)' }}>
              <Edit className="w-12 h-12" style={{ color: 'var(--muted)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              아직 아티클이 없습니다
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              첫 번째 아티클을 생성해보세요!
            </p>
          </div>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ 
              backgroundColor: 'var(--blue)',
              color: 'white'
            }}
          >
            <Plus className="w-5 h-5" />
            첫 아티클 생성하기
          </Link>
        </div>
      )}
    </div>
  );
}
