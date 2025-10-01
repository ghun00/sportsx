'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        'fixed top-4 left-4 right-4 z-50',
        'px-6 py-4 rounded-xl shadow-lg',
        'transition-all duration-300 transform',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
      style={{
        backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
        color: 'white'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-lg">
          {type === 'success' ? '✓' : '✗'}
        </div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
