'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoginContextType {
  isLoginPopupOpen: boolean;
  openLoginPopup: () => void;
  closeLoginPopup: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const openLoginPopup = () => setIsLoginPopupOpen(true);
  const closeLoginPopup = () => setIsLoginPopupOpen(false);

  return (
    <LoginContext.Provider value={{
      isLoginPopupOpen,
      openLoginPopup,
      closeLoginPopup
    }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLogin() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
}
