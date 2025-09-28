'use client';

import { useState } from 'react';
import { Users, FileText } from 'lucide-react';
import AppBar from '@/components/AppBar';
import AdminGuard from '@/components/AdminGuard';
import AdminArticlesTab from '@/components/admin/AdminArticlesTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'users'>('articles');

  const tabs = [
    {
      id: 'articles' as const,
      label: '아티클 관리',
      icon: FileText,
      component: AdminArticlesTab
    },
    {
      id: 'users' as const,
      label: '사용자 관리',
      icon: Users,
      component: AdminUsersTab
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <AdminGuard>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <AppBar />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              관리자 대시보드
            </h1>
            <p style={{ color: 'var(--muted)' }}>
              아티클과 사용자를 관리할 수 있습니다
            </p>
          </div>

          {/* 탭 메뉴 */}
          <div className="mb-8">
            <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--panel)' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-white shadow-sm' 
                        : 'hover:opacity-80'
                      }
                    `}
                    style={{
                      backgroundColor: isActive ? 'var(--blue)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text)'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="min-h-[600px]">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
