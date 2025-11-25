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
const Home = () => {
  const router = useRouter();

  // 페이지 네비게이션 핸들러
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Pricing 버튼 클릭 핸들러
  const handlePricingClick = () => {
    alert('AINMem은 현재 무료로 이용 가능합니다! 다양한 요금제를 준비 중이니 기대해주세요.');
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
            <button onClick={handlePricingClick} className="landing-cta secondary-cta">View Pricing</button>
          </div>
          {/* 제품 시연 영역 */}
          <div className="landing-visual">
            <img src="/AINMem.png" alt="AINMem Knowledge Graph Visualization" className="landing-hero-image" />
          </div>
        </div>
      </section>

      {/* About 섹션 */}
      <section id="about" className="landing-section">
        <div className="landing-content-container">
          <h2 className="landing-content-title">About AINMem</h2>
          <p className="landing-content-subtitle">Infinite Memory Solution for AI Agents</p>

          <div className="landing-content-text">
            <p>
              AINMem is an innovative knowledge graph platform that provides AI agents with permanent and structured memory.
              By transforming conversation logs and user data into a First-Order Logic (FOL) based semantic structure,
              AI can go beyond simply storing conversations to understanding relationships and context, enabling true learning.
            </p>

            <p>
              Through intuitive visualization powered by D3.js, users can explore the AI's knowledge structure in real-time
              and instantly see how logical propositions consisting of Constants (entities), Facts (truths), and Predicates (relationships)
              are interconnected.
            </p>

            <p>
              Through integration with the AIN blockchain, AINMem ensures decentralized identity authentication and data ownership.
              Users log in securely via AINwallet, and all memory data is linked to their wallet address to build personalized knowledge graphs.
              The combination of MongoDB and FOL-SDK enables large-scale data processing and complex logical reasoning, while the modern architecture
              based on Next.js 15 delivers a fast and responsive user experience.
            </p>

            <p>
              AINMem is not just a chat history repository—it's creating a future where AI agents truly "remember and learn."
            </p>
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
