'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Calendar, Mail, Eye, EyeOff } from 'lucide-react';
import { UserService } from '@/services/userService';
import { User } from '@/types';

export default function AdminUsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // 모든 사용자 조회
        const result = await UserService.getAllUsers({ limit: 100 });
        setUsers(result.users);
      } catch (error: unknown) {
        console.error('사용자 목록 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '사용자 목록을 불러올 수 없습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusBadgeStyle = (isActive: boolean) => {
    return {
      backgroundColor: isActive ? '#10B981' : '#6B7280',
      color: 'white'
    };
  };

  return (
    <div>
      {/* 사용자 관리 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          사용자 목록
        </h2>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          이메일/소셜 회원 정보를 확인합니다.
        </p>
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
                  상태
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  가입일
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  최근 로그인
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  커리어 단계
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  관심 분야
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text)' }}>
                  이용 목적
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
                        {user.profileImage ? (
                          <Image 
                            src={user.profileImage} 
                            alt={user.nickname}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text)' }}>
                          {user.nickname}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text)' }}>
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 이메일 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: 'var(--text)' }} />
                      <span style={{ color: 'var(--text)' }}>
                        {user.email || '이메일 없음'}
                      </span>
                    </div>
                  </td>

                  {/* 상태 */}
                  <td className="py-4 px-4">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                      style={getStatusBadgeStyle(user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          활성
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          비활성
                        </>
                      )}
                    </span>
                  </td>

                  {/* 가입일 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text)' }} />
                      <span style={{ color: 'var(--text)' }}>
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* 최근 로그인 */}
                  <td className="py-4 px-4">
                    <span style={{ color: 'var(--text)' }}>
                      {formatDate(user.lastLoginAt)}
                    </span>
                  </td>

                  {/* 커리어 단계 */}
                  <td className="py-4 px-4">
                    <span style={{ color: 'var(--text)' }}>
                      {user.career_stage || '미설정'}
                    </span>
                  </td>

                  {/* 관심 분야 */}
                  <td className="py-4 px-4">
                    <span style={{ color: 'var(--text)' }}>
                      {user.interests && user.interests.length > 0 
                        ? user.interests.join(', ') 
                        : '미설정'
                      }
                    </span>
                  </td>

                  {/* 이용 목적 */}
                  <td className="py-4 px-4">
                    <span style={{ color: 'var(--text)' }}>
                      {user.usage_purpose || '미설정'}
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
              <Users className="w-12 h-12" style={{ color: 'var(--text)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              등록된 사용자가 없습니다
            </h3>
            <p style={{ color: 'var(--text)' }}>
              아직 등록된 사용자가 없습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
