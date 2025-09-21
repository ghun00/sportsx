'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogin } from '@/contexts/LoginContext';
import { useAuth } from '@/contexts/AuthContext';

interface AppBarProps {
  className?: string;
}

export default function AppBar({ className }: AppBarProps) {
  const { openLoginPopup } = useLogin();
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      await logout();
    }
  };

  // 현재 경로에 따른 아이콘 색상 결정
  const getIconColor = (path: string) => {
    return pathname === path ? '#ffffff' : '#9AA4AF'; // 화이트 또는 gray
  };

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full backdrop-blur-xl',
      className
    )} style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="스포츠엑스"
              width={160}
              height={48}
              className="h-6 sm:h-7 w-auto max-w-[120px] sm:max-w-none"
              priority
            />
          </Link>

          {/* 우측 메뉴 */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              // 로그인 후 메뉴
              <>
                {/* 하트 아이콘 - 좋아요한 게시물 */}
                <Link
                  href="/liked"
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-[var(--panel)]"
                  title="좋아요한 게시물"
                >
                  <Heart 
                    className="w-6 h-6 sm:w-8 sm:h-8" 
                    style={{ 
                      color: getIconColor('/liked'),
                      fill: pathname === '/liked' ? '#ffffff' : 'none'
                    }} 
                  />
                </Link>

                {/* 프로필 (말풍선 포함) */}
                <div className="relative">
                  <Link
                    href="/profile"
                    className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-[var(--panel)]"
                    title="프로필"
                  >
                    <User 
                      className="w-6 h-6 sm:w-8 sm:h-8" 
                      style={{ 
                        color: getIconColor('/profile'),
                        fill: pathname === '/profile' ? '#ffffff' : 'none'
                      }} 
                    />
                  </Link>
                  
                  {/* 말풍선 */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute -top-1 -right-8 bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200">
                    피드백은 여기서!
                  </div>
                </div>

                {/* 로그아웃 */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-[var(--panel)]"
                  title="로그아웃"
                >
                  <LogOut 
                    className="w-6 h-6 sm:w-8 sm:h-8" 
                    style={{ 
                      color: '#9AA4AF',
                      fill: 'none'
                    }} 
                  />
                </button>
              </>
            ) : (
              // 로그인 전 메뉴
              <>
                {/* 피드백 링크 (로그인 전에만 표시) */}
                <a
                  href="https://sportsx.channel.io/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-all duration-200 hover:scale-105 hidden sm:block"
                  style={{ color: 'var(--muted)' }}
                >
                  피드백 남기기
                </a>
                
                <a
                  href="https://sportsx.channel.io/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-all duration-200 hover:scale-105 block sm:hidden"
                  style={{ color: 'var(--muted)' }}
                >
                  피드백
                </a>

                <button
                  onClick={openLoginPopup}
                  className="px-4 py-2 text-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ color: 'var(--text)' }}
                >
                  로그인
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
