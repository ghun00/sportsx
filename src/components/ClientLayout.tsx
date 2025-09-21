'use client';

import { LoginProvider, useLogin } from "@/contexts/LoginContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import LoginPopup from "@/components/LoginPopup";

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoginPopupOpen, closeLoginPopup } = useLogin();

  return (
    <>
      {children}
      <LoginPopup isOpen={isLoginPopupOpen} onClose={closeLoginPopup} />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <LoginProvider>
          <ClientLayoutInner>{children}</ClientLayoutInner>
        </LoginProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
