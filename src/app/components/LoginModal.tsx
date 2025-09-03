"use client";

//for ainmem login
import Ain from '@ainblockchain/ain-js';
import { AinWalletSigner } from '@ainblockchain/ain-js/lib/signer/ain-wallet-signer';

import React, { useState } from 'react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsLoggedIn : React.Dispatch<React.SetStateAction<boolean>>;
  setUserName : React.Dispatch<React.SetStateAction<string | null>>;
}

interface VerifyPayload {
  message: any, 
  signature: string, 
  address: string,
  chainID: number
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose , setIsLoggedIn, setUserName}) => {
  const [email, setEmail] = useState('');
  const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);

  async function checkVerify(payload: VerifyPayload): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { isValid } = await res.json(); // 서버에서 { isValid: true/false } 반환
      return isValid;
    } catch (error) {
      console.error('Verify 요청 실패:', error);
      return false; // 에러 시 false 반환
    }
  }

  const handleAINwalletClick = async () => {
    ain.setSigner(new AinWalletSigner());
    
    // address가 잘 나온다는 것은 지갑과 잘 연결이 되었다는 의미.
    const address = await ain.signer.getAddress()
    console.log('address:', address);
    
    // signMessage 해서 암호화된걸(시그니쳐) 서버로 보내고
    const testMessage = "hello, we are ainmem"
    const signature = await ain.signer.signMessage(testMessage);
    
    // VerifyPayload 인터페이스에 맞춰 데이터 구성
    const payload: VerifyPayload = {
      message: testMessage,  // data -> message로 변경
      signature,
      address,
      chainID: 0 //testnet, 실제 배포 시에는 변경 필요
    };
    
    const result = await checkVerify(payload);
    console.log("검증 결과값: ",result)
    if (result===true) {
      //로그인이 정상적으로 되었을 경우
      setIsLoggedIn(true);
      setUserName(address);
      sessionStorage.setItem("isLogined", "true");
      sessionStorage.setItem("userName", address); 

      //검증 완료 후 유저 database에 등록
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_address: address,
            email: null,
            nickname: null
          })
        });
      } catch (error: any) {
        console.log('database users table 유저 등록 시 에러 발생',error);
      }
      onClose();
    }else {
      alert("검증 실패. 로그인에 실패하였습니다.");
    }

  };

  const walletOptions = [
    { name: 'AINwallet', icon: 'AINwallet_logo.svg', onclick: handleAINwalletClick },
    { name: 'MetaMask', icon: '/metamask-icon.png', onclick: undefined },
    { name: 'Coinbase Wallet', icon: '/coinbase-icon.svg', onclick: undefined },
    { name: 'WalletConnect', icon: '/walletconnect-icon.png', onclick: undefined },   
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
                  <source src="Ainmem_V0.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            {/*
            <div className={styles["logo-section"]}>
              <div className={styles["logo-container"]}>
                <img
                  src="/AINmem_V0.png" 
                  alt="로고 이미지" 
                  className={styles["logo-image"]}
                >
                </img>
              </div>
            </div>*/}

            {/* Title */}
            <h4 className={styles["modal-title"]}>AINmem으로 연결</h4>

            {/* Wallet Options */}
            <div className={styles["wallet-options"]}>
              <ul className={styles["wallet-list"]}>
                {walletOptions.map((wallet, index) => (
                  <li key={index}>
                    <button className={styles["wallet-button"]} onClick={wallet.onclick}>
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
                  <button className={styles["wallet-button"]}>
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
                지갑을 연결하고 AINmem을 사용하면{' '}
                <a href="" target="_blank" rel="noopener noreferrer">
                  서비스 약관
                </a>{' '}
                및{' '}
                <a href="" target="_blank" rel="noopener noreferrer">
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