'use client';

import { useState, useEffect } from 'react';
import { User, RefreshCw } from 'lucide-react';

interface KakaoUser {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    email?: string;
    email_verified?: boolean;
    name?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    profile?: {
      nickname: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
  firebase_data?: {
    email: string;
    nickname: string;
    profileImage?: string;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
    career_stage?: string;
    interests?: string[];
    usage_purpose?: string;
  } | null;
}

export default function AdminKakaoUsersTab() {
  const [users, setUsers] = useState<KakaoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadKakaoUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('카카오 사용자 목록 로드 시작...');
      const response = await fetch('/api/admin/kakao-users');
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error('카카오 사용자 정보를 가져올 수 없습니다.');
      }
      
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      setUsers(data.users || []);
      setTotalCount(data.total_count || 0);
    } catch (error: unknown) {
      console.error('카카오 사용자 목록 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '카카오 사용자 목록을 불러올 수 없습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKakaoUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
              카카오 유저 정보
            </h2>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              카카오 로그인 사용자 목록입니다.
            </p>
          </div>
          <button
            onClick={loadKakaoUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 사용자 목록 테이블 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 h-16 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  사용자
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  이메일
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  Firebase 연동
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  온보딩 완료
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* 사용자 정보 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                        {user.firebase_data?.profileImage ? (
                          <img 
                            src={user.firebase_data.profileImage}
                            alt={user.firebase_data.nickname || user.properties.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text)' }}>
                          {user.firebase_data?.nickname || user.properties.nickname}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text)' }}>
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 이메일 */}
                  <td className="py-4 px-4">
                    <span style={{ color: 'var(--text)' }}>
                      {user.firebase_data?.email || '이메일 없음'}
                    </span>
                  </td>

                  {/* Firebase 연동 상태 */}
                  <td className="py-4 px-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: user.firebase_data ? '#10B981' : '#EF4444',
                        color: 'white'
                      }}
                    >
                      {user.firebase_data ? '연동됨' : '미연동'}
                    </span>
                  </td>

                  {/* 온보딩 완료 상태 */}
                  <td className="py-4 px-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: user.firebase_data?.career_stage && user.firebase_data?.interests && user.firebase_data?.usage_purpose ? '#10B981' : '#6B7280',
                        color: 'white'
                      }}
                    >
                      {user.firebase_data?.career_stage && user.firebase_data?.interests && user.firebase_data?.usage_purpose ? '완료' : '미완료'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--panel)' }}>
              <User className="w-12 h-12" style={{ color: 'var(--text)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              카카오 사용자 정보가 없습니다
            </h3>
            <p style={{ color: 'var(--text)' }}>
              아직 카카오로 로그인한 사용자가 없습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
