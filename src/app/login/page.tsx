'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppBar from '@/components/AppBar';
import { showToast } from '@/lib/utils';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    // MVP: 카카오 로그인 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      showToast('추후 카카오 로그인 연동 예정', 'info');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-sx-bg">
      <AppBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          {/* 뒤로가기 버튼 */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-sx-muted hover:text-sx-text">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>

          {/* 로그인 카드 */}
          <div className="bg-sx-panel rounded-2xl border border-sx-border p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-sx-text mb-2">
                로그인
              </h1>
              <p className="text-sx-muted">
                스포츠엑스에 오신 것을 환영합니다
              </p>
            </div>

            {/* 카카오 로그인 버튼 */}
            <Button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] font-semibold py-3 text-lg rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-[#3C1E1E] border-t-transparent rounded-full animate-spin mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#3C1E1E] rounded-full mr-3 flex items-center justify-center">
                    <span className="text-[#FEE500] text-sm font-bold">K</span>
                  </div>
                  카카오로 시작하기
                </div>
              )}
            </Button>

            {/* 추가 정보 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-sx-muted">
                로그인하면 좋아요한 아티클을 저장하고<br />
                개인화된 콘텐츠를 받아볼 수 있습니다.
              </p>
            </div>
          </div>

          {/* MVP 안내 */}
          <div className="mt-6 p-4 bg-sx-blue/10 border border-sx-blue/20 rounded-lg">
            <p className="text-sm text-sx-blue text-center">
              🚧 현재 MVP 버전입니다. 실제 로그인 기능은 추후 카카오 SDK 연동 후 제공됩니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sx-border bg-sx-panel py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sx-muted">
            <p>&copy; 2025 스포츠엑스. 해외 스포츠 산업의 흐름을 한국어로 읽다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

