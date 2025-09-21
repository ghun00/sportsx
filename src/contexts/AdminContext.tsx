'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  authenticateAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_PASSWORD = '010905'; // 실제로는 환경변수로 관리

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const router = useRouter();

  // 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_auth');
    if (authStatus === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const authenticateAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_auth');
    router.push('/admin');
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      authenticateAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
