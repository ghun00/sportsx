'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  className?: string;
}

export default function CategoryChips({ 
  categories, 
  selectedCategories, 
  onCategoryToggle, 
  className 
}: CategoryChipsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* 전체 카테고리 버튼 */}
        <button
          onClick={() => onCategoryToggle('all')}
          className={cn(
            'flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
            selectedCategories.length === 0
              ? 'text-white'
              : 'opacity-60 hover:opacity-100'
          )}
          style={{
            backgroundColor: selectedCategories.length === 0 ? 'var(--blue)' : 'var(--panel)',
            color: selectedCategories.length === 0 ? 'white' : 'var(--text)'
          }}
        >
          전체
        </button>
        
        {/* 개별 카테고리 버튼들 */}
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          
          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={cn(
                'flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isSelected ? 'text-white' : 'opacity-60 hover:opacity-100'
              )}
              style={{
                backgroundColor: isSelected ? 'var(--blue)' : 'var(--panel)',
                color: isSelected ? 'white' : 'var(--text)'
              }}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
