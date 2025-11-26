// contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  isHydrated: boolean;
  updateLoginState: (isLoggedIn: boolean) => void;
  setAuthUser: (name: string | null) => void;
}

// 기본값은 사용되지 않더라도 Context 생성 시 필요
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 초기값은 항상 false/null로 설정 (서버와 클라이언트 일치)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트 마운트 후 sessionStorage에서 값 복원
  useEffect(() => {
    const storedLogin = sessionStorage.getItem('isLogined') === 'true';
    const storedUserName = sessionStorage.getItem('userName');

    setIsLoggedIn(storedLogin);
    setUserName(storedUserName);
    setIsHydrated(true);
  }, []);

  const updateLoginState = (newLoginState: boolean) => {
    setIsLoggedIn(newLoginState);
    sessionStorage.setItem('isLogined', newLoginState ? 'true' : 'false');
  };

  const setAuthUser = (name: string | null) => {
    setUserName(name);
    if (name) {
      sessionStorage.setItem('userName', name);
    } else {
      sessionStorage.removeItem('userName');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, isHydrated, updateLoginState, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context를 사용하기 위한 커스텀 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
