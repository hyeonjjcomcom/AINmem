import React, { useState } from 'react';
import styles from './AuthOverlay.module.css'; // 전용 CSS 파일을 만들거나 기존 CSS를 가져옵니다.
import LoginModal from './LoginModal';

export default function AuthOverlay() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userName");
    }
    return null; // SSR 시 초기값
  });

  //로그인 모달 열기
  const handleLoginModal = () => {
    setIsLoginModalOpen(true);
    //setIsLoggedIn(true);
    console.log('User logged in');
  };

  //로그인 모달 닫기
  const handleLoginModalClose = (loginSuccess = false) => {
    setIsLoginModalOpen(false);
    
    // 로그인 성공 시 다른 컴포넌트들에게 알림
    if (loginSuccess) {
      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
    }
  };

  // onLoginClick 함수를 props로 받아서 버튼에 연결합니다.
  return (
    <div className={styles['auth-overlay']}>
      <div className={styles['auth-prompt']}>
        <h3>Log in to see your data</h3>
        <p>Please log in to continue and view your content.</p>
        <button
          className={styles['auth-button']}
          onClick={handleLoginModal}
        >
          Login
        </button>
      </div>
      {isLoginModalOpen && (
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={handleLoginModalClose} // 이제 loginSuccess 매개변수를 받음
          setIsLoggedIn={setIsLoggedIn} 
          setUserName={setUserName}
        />
      )}
    </div>
  );
}