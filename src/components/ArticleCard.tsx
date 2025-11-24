import Link from 'next/link';
import Image from 'next/image';
import LikeButton from '@/components/LikeButton';
import { formatPublishedDate } from '@/lib/articles';
import { Article } from '@/types';
import { cn } from '@/lib/utils';
import { trackArticleClick } from '@/lib/analytics';

interface ArticleCardProps {
  article: Article;
  className?: string;
  showSummary?: boolean;
}

export default function ArticleCard({ article, className, showSummary = true }: ArticleCardProps) {
  return (
    <article className={cn(
      'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]',
      className
    )}>
      <Link 
        href={`/articles/${article.id}`} 
        className="block"
        onClick={() => trackArticleClick(article.id, article.title_kr, article.categories[0])}
      >
        {/* 이미지 */}
        <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
          <Image
            src={article.image}
            alt={article.title_kr}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* 카테고리 태그 - 좌측 상단 */}
          <div className="absolute top-3 left-3 flex gap-2">
            {article.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'var(--blue)', 
                  color: 'white',
                  opacity: 0.95
                }}
              >
                {category}
              </span>
            ))}
          </div>
          
          {/* 좋아요 버튼 - 우측 상단 */}
          <div 
            className="absolute top-3 right-3"
            onClick={(e) => e.stopPropagation()}
          >
            <LikeButton id={article.id} size="md" />
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="space-y-3">
          {/* 제목 */}
          <h3 className="text-xl font-semibold leading-tight transition-colors group-hover:opacity-80" style={{ color: 'var(--text)' }}>
            {article.title_kr}
          </h3>
          
          {/* 요약 */}
          {showSummary && (
            <p className="text-md leading-relaxed line-clamp-2" style={{ color: 'var(--text)' }}>
              {article.summary_kr.join(' • ')}
            </p>
          )}
          
          {/* 하단 정보 */}
          <div className="flex items-center space-x-3 text-xs" style={{ color: 'var(--text)' }}>
            <span>{article.source}</span>
            <span>•</span>
            <span>{formatPublishedDate(article.published_at instanceof Date ? article.published_at.toISOString() : article.published_at)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
