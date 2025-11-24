'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogin } from '@/contexts/LoginContext';
import { useAuth } from '@/contexts/AuthContext';
import { trackFeedbackClick, trackProfileVisit, trackLikedArticlesVisit, trackNavClick } from '@/lib/analytics';

interface AppBarProps {
  className?: string;
}

export default function AppBar({ className }: AppBarProps) {
  const { openLoginPopup } = useLogin();
  const { isLoggedIn, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      await logout();
    }
  };

  const navItems = [
    { label: '피드', href: '/', track: 'feed' as const },
    { label: '추천 공고', href: '/jobs', track: 'jobs' as const },
    { label: '커리어 비서', href: '/assistant', track: 'assistant' as const },
  ];

  // 현재 경로에 따른 아이콘 색상 결정
  const getIconColor = (path: string) => {
    return pathname === path ? 'var(--text)' : '#9AA4AF';
  };

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 피드백 배너 */}
      <a
        href="https://sportsx.channel.io/home"
        target="_blank"
        rel="noopener noreferrer"
        className="sticky top-0 z-50 w-full bg-black block hover:bg-gray-900 transition-colors duration-200"
        onClick={() => trackFeedbackClick()}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <span className="text-sm sm:text-lg font-medium text-white">
              피드백 남기기
            </span>
            <span className="text-gray-300 text-lg">
              →
            </span>
          </div>
        </div>
      </a>

      <header className={cn(
        'sticky top-12 z-40 w-full backdrop-blur-xl',
        className
      )} style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center relative">
            {/* 로고 */}
          <Link href="/" className="flex items-center space-x-12">
          <Image
    src="https://github.com/ghun00/sportsx/blob/main/public/symbol.png?raw=true"
    alt="스포츠엑스"
    width={60}   // 최대 크기 기준
    height={60}
    className="w-12 h-12 lg:w-15 lg:h-15"  // w-12,h-12=48px / w-15,h-15=60px
    priority
  />
            
          </Link>

          {/* 네비게이션 메뉴 - 가로 스크롤 가능 */}
          <div className="flex-1 overflow-x-auto scrollbar-hide relative">
            <nav className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 ml-4 min-w-max">
              {navItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => trackNavClick(item.track)}
                    className={cn(
                      'relative text-lg sm:text-xl transition-all duration-200 whitespace-nowrap pb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-[var(--bg)]',
                      isActive
                        ? 'font-bold text-[var(--text)]'
                        : 'font-medium text-[#9AA4AF] hover:text-[var(--text)]'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {/* 그라데이션 오버레이 - 우측 메뉴 뒤에 있다는 것을 표현 */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none z-0"></div>
          </div>

          {/* 우측 메뉴 - z-index로 앞에 위치 */}
          <nav className="flex items-center space-x-1 sm:space-x-2 ml-auto relative z-10 bg-[var(--bg)] pl-4">
            {isLoggedIn ? (
              // 로그인 후 메뉴
              <>
                {/* 하트 아이콘 - 좋아요한 게시물 */}
                <Link
                  href="/liked"
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-[var(--panel-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  title="좋아요한 게시물"
                  onClick={() => trackLikedArticlesVisit()}
                >
                  <Heart 
                    className="w-6 h-6 sm:w-8 sm:h-8" 
                    style={{ 
                      color: getIconColor('/liked'),
                      fill: pathname === '/liked' ? 'var(--text)' : 'none'
                    }} 
                  />
                </Link>

                {/* 프로필 */}
                <Link
                  href="/profile"
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-[var(--panel-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  title="프로필"
                  onClick={() => trackProfileVisit()}
                >
                  <User 
                    className="w-6 h-6 sm:w-8 sm:h-8" 
                    style={{ 
                      color: getIconColor('/profile'),
                      fill: pathname === '/profile' ? 'var(--text)' : 'none'
                    }} 
                  />
                </Link>
              </>
            ) : (
              // 로그인 전 메뉴
              <button
                onClick={openLoginPopup}
                className="px-4 py-2 text-lg font-medium transition-all duration-200 hover:scale-105 text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              >
                로그인
              </button>
            )}
          </nav>
          </div>
        </div>
      </header>
    </>
  );
}
