"use client";

import styles from './Sidebar.module.css';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import UserDropdown from '@/components/UserDropdown';
import LoginModal from '@/components/LoginModal';
import ConfirmModal from '@/components/ConfirmModal';

import { useAuth } from '@/contexts/AuthContext';
import { getRandomLogoutMessage } from '@/constants/messages';

interface SvgIconProps {
  path: string;
}

const SvgIcon = ({ path }: SvgIconProps) => (
  <svg className={styles['nav-icon']} fill="currentColor" viewBox="0 -960 960 960">
    <path d={path} />
  </svg>
);

const navItems = [
  /* hide request page
  { 
    id: 'requests', 
    label: 'Requests', 
    iconPath: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
    path: '/requests' 
  },*/
  {
    id: 'memories',
    label: 'Memories',
    iconPath: 'M309-389q29 29 71 29t71-29l160-160q29-29 29-71t-29-71q-29-29-71-29t-71 29q-37-13-73-6t-61 32q-25 25-32 61t6 73q-29 29-29 71t29 71ZM240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l52 205q5 19-7 34.5T840-360h-80v120q0 33-23.5 56.5T680-160h-80v80h-80v-160h160v-200h108l-38-155q-23-91-98-148t-172-57q-116 0-198 81t-82 197q0 60 24.5 114t69.5 96l26 24v208h-80Zm254-360Z',
    path: '/memories'
  },
  {
    id: 'graph',
    label: 'Graph',
    iconPath: 'M480-80q-50 0-85-35t-35-85q0-5 .5-11t1.5-11l-83-47q-16 14-36 21.5t-43 7.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 9t38 25l119-60q-3-23 2.5-45t19.5-41l-34-52q-7 2-14.5 3t-15.5 1q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 20-6.5 38.5T456-688l35 52q8-2 15-3t15-1q17 0 32 4t29 12l66-54q-4-10-6-20.5t-2-21.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-17 0-32-4.5T699-617l-66 55q4 10 6 20.5t2 21.5q0 50-35 85t-85 35q-24 0-45.5-9T437-434l-118 59q2 9 1.5 18t-2.5 18l84 48q16-14 35.5-21.5T480-320q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-320q17 0 28.5-11.5T240-360q0-17-11.5-28.5T200-400q-17 0-28.5 11.5T160-360q0 17 11.5 28.5T200-320Zm160-400q17 0 28.5-11.5T400-760q0-17-11.5-28.5T360-800q-17 0-28.5 11.5T320-760q0 17 11.5 28.5T360-720Zm120 560q17 0 28.5-11.5T520-200q0-17-11.5-28.5T480-240q-17 0-28.5 11.5T440-200q0 17 11.5 28.5T480-160Zm40-320q17 0 28.5-11.5T560-520q0-17-11.5-28.5T520-560q-17 0-28.5 11.5T480-520q0 17 11.5 28.5T520-480Zm240-200q17 0 28.5-11.5T800-720q0-17-11.5-28.5T760-760q-17 0-28.5 11.5T720-720q0 17 11.5 28.5T760-680Z',
    path: '/graph'
  },
  /* hide analytics page from sidebar - page still accessible via direct URL
  {
    id: 'analytics',
    label: 'Analytics',
    iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
    path: '/analytics'
  },
  */
  /*
  { 
    id: 'settings', 
    label: 'Settings', 
    iconPath: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37-0.29,0.59-0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z',
    path: '/settings' 
  },
  */
];

const Sidebar = () => {
  const router = useRouter(); 
  const pathname = usePathname();
  const { isLoggedIn, updateLoginState, userName, setAuthUser, isHydrated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 추가
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState({ title: 'Logout', message: 'Are you sure you want to logout?' });
  const [isClient, setIsClient] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path); 
  };

  //로그인 모달 닫기
  const handleLoginModalClose = (loginSuccess = false) => {
    setIsLoginModalOpen(false);
  };

  //로그인 모달 열기
  const handleLoginModal = () => {
    setIsLoginModalOpen(true);
    //setIsLoggedIn(true);
    console.log('User logged in');
  };

  const handleLogout = () => {
    const randomMessage = getRandomLogoutMessage();
    setLogoutMessage(randomMessage);
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    updateLoginState(false);
    setAuthUser(null);
    setIsLogoutConfirmOpen(false);
    console.log('User logged out');
  };

  // 드롭다운 토글 함수
  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // 드롭다운 닫기 함수
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // userName을 받아 포맷팅된 문자열을 반환하는 함수
  const formatUserName = (name: string | null): string => {
    // 1. name이 null이거나 빈 문자열이면 아무것도 표시하지 않음
    if (!name) {
      return '';
    }

    // 2. name의 길이가 8자 이하면 그대로 보여줌 (예: "abcdefgh")
    if (name.length <= 8) {
      return name;
    }

    // 3. 8자보다 길면 앞 4자, 뒤 4자를 잘라 중간에 "..."을 넣어 반환
    const firstPart = name.slice(0, 4);
    const lastPart = name.slice(-4);
    return `${firstPart}...${lastPart}`;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <aside className={styles.sidebar} id="sidebar">
      <div className={styles.logo} onClick={() => handleNavigation('/')}>
        AIN Mem
      </div>
      
      <nav className={styles['nav-menu']}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`${styles['nav-item']} ${pathname === item.path ? styles.active : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <SvgIcon path={item.iconPath} />
            {item.label}
          </div>
        ))}
      </nav>

      {!isHydrated || isLoggedIn ? (
        <div className={styles['user-section']} id="logged-in-section">
          <div
            className={styles['user-avatar']}
            id="profile-avatar"
            onClick={toggleDropdown}
          >
            U
          </div>
          <div className={styles['user-info']} onClick={toggleDropdown}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{isHydrated ? formatUserName(userName) : 'Loading...'}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>Free Plan</div>
          </div>

          {isHydrated && isLoggedIn && (
            <UserDropdown
              userName="User"
              userEmail="user@example.com"
              showDropdown={isDropdownOpen}
              onClose={closeDropdown}
              onLogout={handleLogout}
            />
          )}
        </div>
      ) : (
        <div className={styles['user-section']} id="login-section">
          <div className={styles['user-avatar']} id="default-profile-avatar" onClick={handleLoginModal}>?</div>
          <div className={styles['user-info']} onClick={handleLoginModal}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Hello</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Please Login
            </div>
          </div>
        </div>
      )}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={handleLoginModalClose} // 이제 loginSuccess 매개변수를 받음
        />
      )}

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title={logoutMessage.title}
        message={logoutMessage.message}
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        danger={true}
      />
    </aside>
  );
};

export default Sidebar;