"use client";

//for ainmem login
import Ain from '@ainblockchain/ain-js';
import { AinWalletSigner } from '@ainblockchain/ain-js/lib/signer/ain-wallet-signer';

import { useState } from "react";
import LoginModal from "../components/LoginModal";
import Sidebar from "../components/Sidebar";

interface VerifyPayload {
  message: any, 
  signature: string, 
  address: string,
  chainID: number
}

export default function HomePage() {
  //테스트넷 연결 코드 - dev 개발 환경 - 환경을 개발환경과 서비스 환경으로 분리해두는데, 구분해두고 테스트 후 배포하기 위해서 - 돈이랑 상관없이 내가 개발할때 쓰는 블록체인 환경이다.
  const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = async () => {
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
  };


  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

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

  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* 기존 EJS 파일의 main-content 내부 내용을 여기에 넣습니다. */}
        <div className="graph-wrapper">
          {/* ... 그래프 관련 JSX 코드 ... */}
          
          {/* 로그인 버튼 예시 */}
          <button onClick={handleOpenLoginModal}>
            로그인
          </button>

          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={handleCloseLoginModal} 
          />
        </div>
      </main>
    </>
  );
}