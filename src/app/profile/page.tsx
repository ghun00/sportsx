'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import AppBar from '@/components/AppBar';

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              로그인이 필요합니다
            </h1>
            <p style={{ color: 'var(--muted)' }}>
              프로필을 보려면 로그인해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <AppBar />
      <div className="container mx-auto px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            프로필
          </h1>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            나의 정보와 활동을 확인해보세요
          </p>
          
          {/* 기능 추가 예정 프레임 */}
          <div 
            className="rounded-3xl border backdrop-blur-xl p-4 shadow-lg text-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              더 많은 기능이 곧 추가될 예정이에요!
            </p>
          </div>
        </div>

        {/* 프로필 정보 그리드 */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 닉네임 카드 */}
          <div 
            className="rounded-3xl border backdrop-blur-xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                  닉네임
                </label>
                <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {user?.nickname || '익명'}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--blue)' }}
              >
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* 사용자 ID 카드 */}
          <div 
            className="rounded-3xl border backdrop-blur-xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
              사용자 ID
            </label>
            <p className="text-lg font-mono" style={{ color: 'var(--text)' }}>
              {user?.id}
            </p>
          </div>

          {/* 이메일 카드 */}
          {user?.email && (
            <div 
              className="rounded-3xl border backdrop-blur-xl p-6 shadow-lg"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                이메일
              </label>
              <p className="text-lg" style={{ color: 'var(--text)' }}>
                {user.email}
              </p>
            </div>
          )}

          {/* 가입일 카드 */}
          <div 
            className="rounded-3xl border backdrop-blur-xl p-6 shadow-lg"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
              가입일
            </label>
            <p className="text-lg" style={{ color: 'var(--text)' }}>
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
