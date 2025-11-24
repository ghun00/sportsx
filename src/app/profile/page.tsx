'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import AppBar from '@/components/AppBar';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      await logout();
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <AppBar />
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">마이 프로필</h1>

          {/* 기능 추가 예정 프레임 */}
          <div
            className="rounded-3xl border backdrop-blur-xl p-4 shadow-lg text-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
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
                <span className="text-lg font-semibold text-white">
                  {user?.nickname?.slice(0, 1) || 'U'}
                </span>
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
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

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-60"
            style={{ backgroundColor: 'var(--blue)' }}
          >
            {isLoading ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      </div>
    </div>
  );
}
