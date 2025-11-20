// contexts/AuthContext.tsx (새 파일 생성)
"use client";
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  updateLoginState: (isLoggedIn: boolean) => void;
  setAuthUser: (name: string | null) => void;
}

// 기본값은 사용되지 않더라도 Context 생성 시 필요
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // app/page.tsx의 상태 관리 로직을 이곳으로 옮겨와 Context Provider로 감쌉니다.
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isLogined') === 'true';
    }
    return false;
  });

  const updateLoginState = (newLoginState: boolean) => {
    setIsLoggedIn(newLoginState);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isLogined', newLoginState ? 'true' : 'false');
    }
  };

  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('userName');
    }
    return null;
  });

  const setAuthUser = (name: string | null) => {
      setUserName(name);
      if (typeof window !== 'undefined') {
          if (name) {
              sessionStorage.setItem('userName', name);
          } else {
              sessionStorage.removeItem('userName');
          }
      }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, updateLoginState, setAuthUser }}>
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