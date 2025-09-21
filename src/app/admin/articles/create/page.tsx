'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import AppBar from '@/components/AppBar';
import AdminGuard from '@/components/AdminGuard';
import SimpleEditor from '@/components/SimpleEditor';
import { ArticleService } from '@/services/articleService';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

const AVAILABLE_CATEGORIES = ['스포츠산업', '데이터', '기타'];

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdminAuthenticated } = useAdmin();
  const [formData, setFormData] = useState({
    title_kr: '',
    image: '',
    summary_kr: ['', '', ''],
    content_kr: '',
    source: '',
    source_url: '',
    categories: [] as string[],
    published_at: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const generateId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 폼 제출 시작:', formData);
    setError(null);
    
    if (!formData.title_kr || !formData.content_kr) {
      console.log('❌ 필수 필드 누락:', { title: formData.title_kr, content: formData.content_kr });
      setError('제목과 본문은 필수입니다.');
      return;
    }

    if (formData.categories.length === 0) {
      setError('최소 하나의 카테고리를 선택해주세요.');
      return;
    }

    // 관리자 인증 확인
    if (!isAdminAuthenticated) {
      console.log('❌ 관리자 인증 필요');
      setError('관리자 인증이 필요합니다.');
      return;
    }
    
    console.log('✅ 관리자 인증 확인됨');

    setIsSubmitting(true);

    try {
      // Firebase에 저장할 아티클 데이터 구성
      const articleData = {
        title_kr: formData.title_kr,
        summary_kr: formData.summary_kr.filter(s => s.trim() !== ''),
        content_kr: formData.content_kr,
        image: formData.image || 'https://picsum.photos/seed/sportsx/1200/630',
        source: formData.source || '스포츠엑스',
        source_url: formData.source_url,
        categories: formData.categories,
        published_at: new Date(formData.published_at),
        status: 'published' as const,
        tags: formData.categories, // 카테고리를 태그로도 사용
        createdBy: 'admin' // 관리자로 생성
      };

      // Firebase에 아티클 생성
      const createdArticle = await ArticleService.createArticle(articleData);
      
      console.log('✅ 아티클 생성 성공:', createdArticle);
      alert('아티클이 성공적으로 생성되었습니다!');
      router.push('/admin/articles');
    } catch (error: unknown) {
      console.error('❌ 아티클 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '아티클 생성에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            아티클 생성
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
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
            <div className="flex justify-end gap-4">
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
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--blue)',
                  color: 'white'
                }}
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? '저장 중...' : '아티클 생성'}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </AdminGuard>
  );
}
