'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLogin } from '@/contexts/LoginContext';

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  const { openLoginPopup } = useLogin();

  return (
    <section className={cn(
      'relative py-20 sm:py-24 lg:py-32',
      className
    )}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* 메인 타이틀 */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-6 font-bold leading-relaxed relative z-10" style={{ color: 'var(--text)' }}>
            해외 스포츠 산업의 흐름을<br className="sm:hidden" /> 한국어로 읽다
          </h1>
          
          <p className="text-xl sm:text-2xl mb-12 font-light relative z-10" style={{ color: 'var(--text)' }}>
            스포츠 커리어 성장을 위한 지식 허브
          </p>
          
          {/* CTA 버튼 */}
          <Button 
            onClick={openLoginPopup}
            size="lg" 
            className="relative z-10 px-10 py-8 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ 
              backgroundColor: 'var(--blue)', 
              color: 'white',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            지금 시작하기
          </Button>
        </div>
      </div>
      
      {/* 지구 이미지 - 정 중앙 */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '480px',
          height: '480px',
          transform: 'translate(-50%, -50%)',
          zIndex: 1, // 타이틀과 CTA 버튼보다 뒤로
          opacity: 0.15, // 투명도 조절
          filter: 'blur(1px)', // 부드러운 효과
          backgroundImage: `url('https://github.com/ghun00/sportsx/blob/main/public/earth.png?raw=true')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--blue)', opacity: 0.15 }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--blue)', opacity: 0.1 }}></div>
      </div>
    </section>
  );
}
