'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserFromCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리했으면 중복 실행 방지
      if (hasProcessed.current) {
        console.log('🔍 이미 처리 완료되었습니다. 중복 실행 방지.');
        return;
      }
      
      hasProcessed.current = true;
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('🔍 콜백 처리 시작...');
        console.log('🔍 인증 코드:', code ? code.substring(0, 10) + '...' : '없음');
        console.log('🔍 에러:', error || '없음');

        if (error) {
          console.error('카카오 로그인 에러:', error);
          setStatus('error');
          setMessage('로그인에 실패했습니다.');
          return;
        }

        if (!code) {
          console.error('인증 코드가 없습니다.');
          setStatus('error');
          setMessage('인증 코드가 없습니다.');
          return;
        }

        console.log('🔍 API 요청 시작...');
        
        // 백엔드 API로 인증 코드 전송
        const response = await fetch('/api/auth/kakao', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        console.log('🔍 API 응답 상태:', response.status);
        const data = await response.json();
        console.log('🔍 API 응답 데이터:', data);

        if (!response.ok) {
          console.error('로그인 API 에러:', data.error);
          setStatus('error');
          setMessage(data.error || '로그인에 실패했습니다.');
          return;
        }

        if (data.success && data.user) {
          // 사용자 정보를 컨텍스트에 저장
          setUserFromCallback(data.user);
          
          setStatus('success');
          setMessage('로그인에 성공했습니다!');
          
          // 1초 후 홈으로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          setStatus('error');
          setMessage('로그인 처리에 실패했습니다.');
        }
      } catch (error) {
        console.error('콜백 처리 중 에러:', error);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [searchParams, setUserFromCallback, router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="bg-[var(--panel)] rounded-2xl border border-[var(--border)] p-8 text-center max-w-md mx-4">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--blue)] mx-auto mb-4"></div>
            <p className="text-[var(--text)] text-lg">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <p className="text-[var(--text)] text-lg">{message}</p>
            <p className="text-[var(--text)]/80 text-sm mt-2">잠시 후 홈으로 이동합니다...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-400 text-4xl mb-4">✗</div>
            <p className="text-[var(--text)] text-lg">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-[var(--blue)] text-white px-6 py-2 rounded-lg hover:bg-[var(--blue)]/80 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="bg-[var(--panel)] rounded-2xl border border-[var(--border)] p-8 text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--blue)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">로그인 처리 중...</p>
        </div>
      </div>
    }>
      <KakaoCallbackContent />
    </Suspense>
  );
}
