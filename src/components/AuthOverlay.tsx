import React from 'react';
import styles from './AuthOverlay.module.css';
import LoginModal from './LoginModal';

export default function AuthOverlay() {
  //로그인 모달 닫기
  const handleLoginModalClose = (loginSuccess = false) => {
    // 로그인 성공 시 다른 컴포넌트들에게 알림
    if (loginSuccess) {
      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
    }
  };

  return (
    <div className={styles.authOverlay}>
      <LoginModal
        isOpen={true}
        onClose={handleLoginModalClose}
        showCloseButton={false}
      />
    </div>
  );
}