'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdminAuthenticated } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin');
    }
  }, [isAdminAuthenticated, router]);

  // 인증되지 않은 경우 로딩 표시 (리다이렉트 중)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--blue)' }}></div>
      </div>
    );
  }

  // 인증된 경우에만 children 렌더링
  return <>{children}</>;
}
