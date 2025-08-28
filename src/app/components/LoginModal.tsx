"use client";

import React, { useState } from 'react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');

  const walletOptions = [
    { name: 'MetaMask', icon: '/metamask-icon.png' },
    { name: 'Coinbase Wallet', icon: '/coinbase-icon.png' },
    { name: 'Abstract', icon: '/abstract-icon.png' },
    { name: 'WalletConnect', icon: '/walletconnect-icon.png' },
  ];

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-container"]}>
        <div className={styles["modal-content"]}>
          {/* Close Button */}
          <button className={styles["close-button"]} onClick={onClose}>
            <svg 
              aria-label="Close" 
              fill="currentColor" 
              height="24" 
              viewBox="0 -960 960 960" 
              width="24"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
          </button>

          <div className={styles["modal-body"]}>
            {/* Logo Section */}
            <div className={styles["logo-section"]}>
              <div className={styles["logo-container"]}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  preload="auto"
                  className={styles["logo-video"]}
                >
                  <source src="https://raw.seadn.io/files/os-logo-glowing.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* Title */}
            <h4 className={styles["modal-title"]}>OpenSea와 연결</h4>

            {/* Wallet Options */}
            <div className={styles["wallet-options"]}>
              <ul className={styles["wallet-list"]}>
                {walletOptions.map((wallet, index) => (
                  <li key={index}>
                    <button className={styles["wallet-button"]}>
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name}
                        className={styles["wallet-icon"]}
                        width="24" 
                        height="24"
                      />
                      <div className={styles["wallet-content"]}>
                        <span className={styles["wallet-title"]}>{wallet.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
                <li>
                  <button className={styles["wallet-button more-options"]}>
                    <div className={styles["wallet-content"]}>
                      <span className={styles["wallet-title"]}>더 많은 지갑 옵션</span>
                    </div>
                  </button>
                </li>
              </ul>

              {/* Divider */}
              <div className={styles["divider"]}>
                <div className={styles["divider-line"]}></div>
                <span className={styles["divider-text"]}>또는 이메일로 계속하기</span>
                <div className={styles["divider-line"]}></div>
              </div>

              {/* Email Form */}
              <form className={styles["email-form"]}>
                <div className={styles["email-input-container"]}>
                  <input
                    type="email"
                    placeholder="이메일로 계속하기"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles["email-input"]}
                  />
                  <button 
                    type="submit" 
                    disabled={!email}
                    className={styles["email-submit-button"]}
                  >
                    <svg 
                      aria-label="Arrow Forward" 
                      fill="currentColor" 
                      height="20" 
                      viewBox="0 -960 960 960" 
                      width="20"
                    >
                      <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
                    </svg>
                  </button>
                </div>
              </form>

              {/* Terms Text */}
              <p className={styles["terms-text"]}>
                지갑을 연결하고 OpenSea를 사용하면{' '}
                <a href="https://opensea.io/tos" target="_blank" rel="noopener noreferrer">
                  서비스 약관
                </a>{' '}
                및{' '}
                <a href="https://opensea.io/privacy" target="_blank" rel="noopener noreferrer">
                  개인정보 취급방침
                </a>
                에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;