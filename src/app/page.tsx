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

  return (
    <div className="landing">

      {/* 1. 네비게이션 바 */}
      <header className="landing-navbar">
        <div className="landing-logo">AINMem</div>
        <nav>
          {/* 섹션 앵커 링크 */}
          <a href="#about" className="landing-nav-link">About</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          {/* 메인 CTA 버튼 */}
          <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
        </nav>
      </header>

      {/* 2. 히어로 섹션 - 메인 메시지 및 CTA */}
      <section id="hero" className="landing-section hero">
        <div className="landing-content">
          <h1 className="landing-title">Own Your Memory, Own Your Data</h1>
          {/*Give Your AI Agents Infinite Memory*/}
          <p className="landing-subtitle">
            Platform-independent memory solution that puts you in control
          </p>
          {/*The ultimate memory solution that enhances AI performance*/}
          {/* 주요 액션 버튼 */}
          <div className="landing-ctas">
            <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
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
          <p className="landing-content-subtitle">Platform-Independent Memory Solution That You Control</p>

          <div className="landing-content-text">
            <p>
              AINMem is an innovative knowledge graph platform that provides AI agents with permanent, structured memory while ensuring complete data sovereignty. By transforming conversation logs and user data into a First-Order Logic (FOL) based semantic structure, AI can go beyond simply storing conversations to understanding relationships and context, enabling true learning—all while keeping your data firmly under your control.
            </p>

            <p>
              Through intuitive visualization, you can manage your own data in a structured knowledge format and see how logical propositions consisting of Constants (entities), Facts (truths), and Predicates (relationships) are interconnected. Your data, organized your way.
            </p>

            <p>
              Through integration with the AIN blockchain, AINMem ensures decentralized identity authentication and uncompromising data ownership. Users log in securely via AINwallet, and all memory data is linked to their wallet address to build personalized knowledge graphs that belong to them, not any platform.
            </p>

            <p>
              AINMem is not just a chat history repository—it's creating a future where AI agents truly "remember and learn," while you maintain full ownership and control of every piece of data they generate.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works 섹션 */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-content-container">
          <h2 className="landing-content-title">How It Works</h2>
          <p className="landing-content-subtitle">Get started with AINMem in 4 simple steps</p>

          <div className="landing-steps">
            {/* Step 1 */}
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <h3 className="landing-step-title">Enable AINMem Extension</h3>
              <p className="landing-step-description">
                Install the AIN wallet extension and enable AINMem in the settings panel. This grants permission for AINMem to access your wallet for secure authentication.
              </p>
            </div>

            {/* Step 2 */}
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <h3 className="landing-step-title">Connect Your AIN Wallet</h3>
              <p className="landing-step-description">
                Log in securely using your AINwallet. Your wallet address becomes your unique identity, ensuring complete data ownership and decentralized authentication.
              </p>
            </div>

            {/* Step 3 */}
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <h3 className="landing-step-title">Configure & Converse</h3>
              <p className="landing-step-description">
                Set your preferred domain in the wallet extension settings. Then simply have conversations as usual—the extension automatically captures your inputs and stores them as memories. No manual entry needed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="landing-step">
              <div className="landing-step-number">4</div>
              <h3 className="landing-step-title">Build & Visualize Graph</h3>
              <p className="landing-step-description">
                Our FOL-SDK automatically transforms your memories into structured Constants, Facts, and Predicates. Navigate your knowledge graph with an intuitive visualization to see connections and discover patterns.
              </p>
            </div>
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
