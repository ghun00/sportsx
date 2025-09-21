'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import AppBar from '@/components/AppBar';

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            프로필
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            나의 정보와 활동을 확인해보세요
          </p>
        </div>

        {/* 프로필 카드 */}
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-2xl border p-8"
            style={{ 
              backgroundColor: 'var(--panel)',
              borderColor: 'var(--border)'
            }}
          >
            {/* 프로필 이미지와 기본 정보 */}
            <div className="flex items-center space-x-6 mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--blue)' }}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="프로필"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {user?.nickname || '익명'}
                </h2>
                <p style={{ color: 'var(--muted)' }}>
                  스포츠엑스 멤버
                </p>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  사용자 ID
                </label>
                <p style={{ color: 'var(--text)' }}>
                  {user?.id}
                </p>
              </div>

              {user?.email && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    이메일
                  </label>
                  <p style={{ color: 'var(--text)' }}>
                    {user.email}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  가입일
                </label>
                <p style={{ color: 'var(--text)' }}>
                  {new Date().toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* 추후 확장 영역 */}
          <div className="mt-8 text-center">
            <p style={{ color: 'var(--muted)' }}>
              더 많은 기능이 곧 추가될 예정입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
