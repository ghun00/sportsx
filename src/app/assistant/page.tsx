'use client';

import AppBar from '@/components/AppBar';

export default function AssistantPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <AppBar />
      <main className="container mx-auto px-6 lg:px-8 py-16">
        <section className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">커리어 비서</h1>
          <p className="text-lg text-[var(--text)]">
            커리어 비서는 준비 중입니다. 곧 맞춤형 커리어 추천과 알림 기능을 만나보실 수 있어요!
          </p>
        </section>
      </main>
    </div>
  );
}

