'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppBar from '@/components/AppBar';
import { useAdmin } from '@/contexts/AdminContext';
import { trackAdminPageView } from '@/lib/analytics';

export default function AdminAuthPage() {
  const router = useRouter();
  const { isAdminAuthenticated, authenticateAdmin } = useAdmin();
  const [password, setPassword] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 이미 인증된 경우 아티클 목록으로 리다이렉트
  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push('/admin/articles');
    }
  }, [isAdminAuthenticated, router]);

  // GA4 관리자 페이지 방문 추적
  useEffect(() => {
    trackAdminPageView('admin_login');
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // 숫자만 허용
    if (!/^\d*$/.test(value)) return;
    
    const newPassword = [...password];
    newPassword[index] = value;
    setPassword(newPassword);

    // 다음 입력 필드로 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 비밀번호가 완성되면 검증
    if (newPassword.every(digit => digit !== '')) {
      const passwordString = newPassword.join('');
      if (authenticateAdmin(passwordString)) {
        router.push('/admin/articles');
      } else {
        alert('비밀번호가 맞지 않습니다.');
        setPassword(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !password[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newPassword = [...password];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newPassword[i] = pastedData[i];
    }
    
    setPassword(newPassword);
    
    // 마지막 입력된 필드로 포커스
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <AppBar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg mx-4">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => router.back()}
            className="mb-8 p-2 rounded-full hover:bg-[var(--panel)] transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              style={{ color: 'var(--text)' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 제목 */}
          <div className="mb-12 text-center">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              관리자 비밀번호를 입력해주세요
            </h1>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="flex justify-center space-x-4">
            {password.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-16 h-16 text-center text-2xl font-bold border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}