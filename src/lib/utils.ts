import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 간단한 토스트 함수 (MVP용)
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (typeof window === 'undefined') return;
  
  // 기존 토스트 제거
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // 새 토스트 생성
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-600' : 
    type === 'error' ? 'bg-red-600' : 
    'bg-sx-blue'
  }`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
