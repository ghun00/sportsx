'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react';
import AppBar from '@/components/AppBar';
import AdminGuard from '@/components/AdminGuard';
import SimpleEditor from '@/components/SimpleEditor';
import { getArticleById } from '@/lib/articles';
import { ArticleService } from '@/services/articleService';

const AVAILABLE_CATEGORIES = ['스포츠산업', '데이터', '기타'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  
  const [formData, setFormData] = useState({
    title_kr: '',
    image: '',
    summary_kr: ['', '', ''],
    content_kr: '',
    source: '',
    source_url: '',
    categories: [] as string[],
    published_at: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // 기존 아티클 데이터 로드
    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const article = await getArticleById(articleId);
        
        if (article) {
          console.log('🔍 로드된 아티클 데이터:', article);
          setFormData({
            title_kr: article.title_kr,
            image: article.image,
            summary_kr: article.summary_kr || ['', '', ''],
            content_kr: article.content_kr,
            source: article.source,
            source_url: article.source_url,
            categories: article.categories || [],
            published_at: article.published_at instanceof Date 
              ? article.published_at.toISOString().split('T')[0]
              : article.published_at || ''
          });
          console.log('🔍 설정된 폼 데이터:', {
            title_kr: article.title_kr,
            image: article.image,
            summary_kr: article.summary_kr || ['', '', ''],
            content_kr: article.content_kr,
            source: article.source,
            source_url: article.source_url,
            categories: article.categories || [],
            published_at: article.published_at instanceof Date 
              ? article.published_at.toISOString().split('T')[0]
              : article.published_at || ''
          });
        } else {
          alert('아티클을 찾을 수 없습니다.');
          router.push('/admin/articles');
        }
      } catch (error) {
        console.error('아티클 로드 실패:', error);
        alert('아티클을 불러오는데 실패했습니다.');
        router.push('/admin/articles');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [articleId, router]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSummaryChange = (index: number, value: string) => {
    const newSummary = [...formData.summary_kr];
    newSummary[index] = value;
    handleInputChange('summary_kr', newSummary);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 아티클을 삭제하시겠습니까?\n삭제된 아티클은 복구할 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await ArticleService.deleteArticle(articleId);
      alert('아티클이 성공적으로 삭제되었습니다.');
      router.push('/admin/articles');
    } catch (error) {
      console.error('아티클 삭제 실패:', error);
      alert('아티클 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_kr || !formData.content_kr) {
      alert('제목과 본문은 필수입니다.');
      return;
    }

    if (formData.categories.length === 0) {
      alert('최소 하나의 카테고리를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 기존 아티클 데이터 가져오기
      const existingArticle = await getArticleById(articleId);
      if (!existingArticle) {
        alert('아티클을 찾을 수 없습니다.');
        return;
      }

      const articleData = {
        ...existingArticle,
        title_kr: formData.title_kr,
        image: formData.image,
        summary_kr: formData.summary_kr.filter(s => s.trim() !== ''),
        content_kr: formData.content_kr,
        source: formData.source,
        source_url: formData.source_url,
        categories: formData.categories,
        published_at: formData.published_at ? new Date(formData.published_at) : existingArticle.published_at,
        updatedAt: new Date()
      };

      // Firebase에 업데이트
      await ArticleService.updateArticle(articleId, articleData);
      
      alert('아티클이 성공적으로 수정되었습니다!');
      router.push('/admin/articles');
    } catch (error) {
      console.error('아티클 수정 실패:', error);
      alert('아티클 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--blue)' }}></div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <AppBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[var(--panel)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text)' }} />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            아티클 수정
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                기본 정보
              </h2>
              
              <div className="space-y-4">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title_kr}
                    onChange={(e) => handleInputChange('title_kr', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      focusRingColor: 'var(--blue)'
                    }}
                    placeholder="아티클 제목을 입력하세요"
                    required
                  />
                </div>

                {/* 대표 이미지 URL */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    대표 이미지 URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      focusRingColor: 'var(--blue)'
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* 발행일 */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    발행일
                  </label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => handleInputChange('published_at', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      focusRingColor: 'var(--blue)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI 3줄 요약 */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                AI 3줄 요약
              </h2>
              
              <div className="space-y-3">
                {formData.summary_kr.map((summary, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                      요약 {index + 1}
                    </label>
                    <input
                      type="text"
                      value={summary}
                      onChange={(e) => handleSummaryChange(index, e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        focusRingColor: 'var(--blue)'
                      }}
                      placeholder={`요약 ${index + 1}을 입력하세요`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 카테고리 */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                카테고리 *
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.categories.includes(category)
                        ? 'text-white'
                        : 'border'
                    }`}
                    style={{
                      backgroundColor: formData.categories.includes(category) ? 'var(--blue)' : 'transparent',
                      borderColor: formData.categories.includes(category) ? 'var(--blue)' : 'var(--border)',
                      color: formData.categories.includes(category) ? 'white' : 'var(--text)'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 본문 내용 */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                본문 내용 *
              </h2>
              
              <SimpleEditor
                value={formData.content_kr}
                onChange={(value) => handleInputChange('content_kr', value)}
                placeholder="아티클 본문을 입력하세요..."
              />
            </div>

            {/* 출처 정보 */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--border)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                출처 정보
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    출처
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      focusRingColor: 'var(--blue)'
                    }}
                    placeholder="예: Front Office Sports"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    원문 링크
                  </label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => handleInputChange('source_url', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      focusRingColor: 'var(--blue)'
                    }}
                    placeholder="https://example.com/original-article"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-between items-center">
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#ef4444',
                  color: '#ef4444'
                }}
              >
                <Trash2 className="w-5 h-5" />
                {isDeleting ? '삭제 중...' : '아티클 삭제'}
              </button>

              {/* 오른쪽 버튼들 */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-all hover:bg-[var(--panel)]"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <X className="w-5 h-5" />
                  취소
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'var(--blue)',
                    color: 'white'
                  }}
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? '저장 중...' : '아티클 수정'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      </div>
    </AdminGuard>
  );
}
