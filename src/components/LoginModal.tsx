"use client";

//for ainmem login
import Ain from '@ainblockchain/ain-js';
import { AinWalletSigner } from '@ainblockchain/ain-js/lib/signer/ain-wallet-signer';

import React, { useState } from 'react';
import { toast } from 'sonner';
import styles from './LoginModal.module.css';
import ConfirmModal from './ConfirmModal';

import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: (loginSuccess?: boolean) => void;
  showCloseButton?: boolean;
}

interface VerifyPayload {
  message: any, 
  signature: string, 
  address: string,
  chainID: number
}

const LoginModal = ({ isOpen, onClose, showCloseButton = true }: LoginModalProps) => {
  const [showInstallConfirm, setShowInstallConfirm] = useState(false);
  const { updateLoginState, setAuthUser } = useAuth();
  const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);

  async function checkVerify(payload: VerifyPayload): Promise<boolean> {
    try {
      console.log('Sending payload to verify API:', payload);
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const { isValid } = await res.json(); // 서버에서 { isValid: true/false } 반환
      return isValid;
    } catch (error) {
      console.error('Verify 요청 실패:', error);
      return false; // 에러 시 false 반환
    }
  }

  const handleInstallExtension = () => {
    window.open('https://chromewebstore.google.com/detail/hbdheoebpgogdkagfojahleegjfkhkpl?utm_source=item-share-cb', '_blank');
    setShowInstallConfirm(false);
  };

  const handleAINwalletClick = async () => {
    try {
      // AINwallet extension 확인
      if (typeof window === 'undefined' || !window.ainetwork) {
        setShowInstallConfirm(true);
        return;
      }

      ain.setSigner(new AinWalletSigner());

      // address가 잘 나온다는 것은 지갑과 잘 연결이 되었다는 의미.
      const address = await ain.signer.getAddress()
      console.log('address:', address);

      let chainID = 0; // 기본값 설정
      if (typeof window !== 'undefined' && window.ainetwork) {
        const network = await (window as any).ainetwork?.getNetwork();
        console.log('network:', network);
        chainID = network.chainId;
      }

      // signMessage 해서 암호화된걸(시그니쳐) 서버로 보내고
      const testMessage = "hello, we are ainmem" //수정 필요
      const signature = await ain.signer.signMessage(testMessage);
      console.log('signature:', signature);

      // VerifyPayload 인터페이스에 맞춰 데이터 구성
      const payload: VerifyPayload = {
        message: testMessage,  // data -> message로 변경
        signature,
        address,
        chainID
      };

      const result = await checkVerify(payload);
      console.log("검증 결과값: ",result)
      if (result===true) {
        //로그인이 정상적으로 되었을 경우
        updateLoginState(true);
        setAuthUser(address);

        //검증 완료 후 유저 database에 등록/업데이트
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

          if (!response.ok) {
            const data = await response.json();
            console.error('유저 처리 실패:', data.error);
          }
        } catch (error: any) {
          console.error('유저 API 요청 실패:', error);
        }
        onClose(true);
      }else {
        toast.error("Verification failed. Login unsuccessful.");
      }
    } catch (error: any) {
      console.error('AINwallet 로그인 에러:', error);
      toast.error("Failed to connect AINwallet. Please try again.");
    }
  };

  const walletOptions = [
    { name: 'AINwallet', icon: 'AINwallet_logo.svg', onclick: handleAINwalletClick },
  ];

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}> 
      <div className={styles["modal-container"]}>
        <div className={styles["modal-content"]}>
          {/* Close Button */}
          {showCloseButton && (
            <button className={styles["close-button"]} onClick={() => onClose(false)}>
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
          )}

          <div className={styles["modal-body"]}>
            {/* Logo Section */}
            <div className={styles["logo-section"]}>
              <div className={styles["logo-container"]}>
                <video
                  src="/Ainmem_V0.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={styles["logo-video"]}
                />
              </div>
            </div>

            {/* Title */}
            <h4 className={styles["modal-title"]}>Manage Your Data with AINmem</h4>
            <p className={styles["modal-subtitle"]}>Log in to build and explore your Ontology</p>

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
              </ul>

              {/* Terms Text */}
              <p className={styles["terms-text"]}>
                By connecting your wallet and using AINMem, you agree to our{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles["terms-link"]}>
                  Terms of Service
                  <svg
                    className={styles["external-link-icon"]}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className={styles["terms-link"]}>
                  Privacy Policy
                  <svg
                    className={styles["external-link-icon"]}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showInstallConfirm}
        title="Install AINwallet"
        message="AINwallet extension is not installed. Would you like to go to the installation page?"
        confirmText="Install"
        cancelText="Cancel"
        onConfirm={handleInstallExtension}
        onCancel={() => setShowInstallConfirm(false)}
      />
    </div>
  );
};

export default LoginModal;