// page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import './styles.css';

/**
 * AINMem 랜딩 페이지 메인 컴포넌트
 * - 제품 소개 및 주요 기능 설명
 * - 고객 후기 및 성능 지표 표시
 * - CTA(Call to Action) 버튼을 통한 회원가입 유도
 */
const Home: React.FC = () => {
  const router = useRouter();

  // 페이지 네비게이션 핸들러
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="landing">

      {/* 1. 네비게이션 바 */}
      <header className="landing-navbar">
        <div className="landing-logo">AINMem</div>
        <nav>
          {/* 섹션 앵커 링크 */}
          <a href="#about" className="landing-nav-link">About</a>
          {/* 메인 CTA 버튼 */}
          <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
        </nav>
      </header>

      {/* 2. 히어로 섹션 - 메인 메시지 및 CTA */}
      <section id="hero" className="landing-section hero">
        <div className="landing-content">
          <h1 className="landing-title">Give Your AI Agents Infinite Memory</h1>
          <p className="landing-subtitle">
            The ultimate memory solution that enhances AI performance
          </p>
          {/* 주요 액션 버튼 */}
          <div className="landing-ctas">
            <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
            <button onClick={() => handleNavigation('/pricing')} className="landing-cta secondary-cta">View Pricing</button>
          </div>
          {/* 제품 시연 영역 (추후 스크린샷 또는 데모 영상 추가 예정) */}
          <div className="landing-visual">
            {/* TODO: 제품 스크린샷 또는 데모 영상 추가 */}
          </div>
        </div>
      </section>

      <div className="landing-spacer"></div>

      <hr className="landing-divider"/>

      {/* 3. 푸터 */}
      <footer className="landing-footer">
        <p>© 2025 AINMem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
