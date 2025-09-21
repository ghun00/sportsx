'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppBar from '@/components/AppBar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sx-bg">
      <AppBar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* 404 아이콘 */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-sx-blue/20">404</div>
            <div className="text-6xl">🔍</div>
          </div>

          {/* 메시지 */}
          <h1 className="text-3xl font-bold text-sx-text mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-sx-muted mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

          {/* 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-sx-blue hover:bg-sx-blue/90 text-white">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지
            </Button>
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
