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
      <header className="landingNavbar">
        <div className="landingLogo">AINMem</div>
        <nav>
          {/* 섹션 앵커 링크 */}
          <a href="#about" className="landingNavLink">About</a>
          <a href="#how-it-works" className="landingNavLink">How It Works</a>
          {/* 메인 CTA 버튼 */}
          <button onClick={() => handleNavigation('/memories')} className="landingCta primaryCta">Get Started</button>
        </nav>
      </header>

      {/* 2. 히어로 섹션 - 메인 메시지 및 CTA */}
      <section id="hero" className="landingSection hero">
        <div className="landingContent">
          <h1 className="landingTitle">Own Your Memory, Own Your Data</h1>
          {/*Give Your AI Agents Infinite Memory*/}
          <p className="landingSubtitle">
            Platform-independent memory solution that puts you in control
          </p>
          {/*The ultimate memory solution that enhances AI performance*/}
          {/* 주요 액션 버튼 */}
          <div className="landingCtas">
            <button onClick={() => handleNavigation('/memories')} className="landingCta primaryCta">Get Started</button>
          </div>
          {/* 제품 시연 영역 */}
          <div className="landingVisual">
            <img src="/AINMem.png" alt="AINMem Knowledge Graph Visualization" className="landingHeroImage" />
          </div>
        </div>
      </section>

      {/* About 섹션 */}
      <section id="about" className="landingSection">
        <div className="landingContentContainer">
          <h2 className="landingContentTitle">About AINMem</h2>
          <p className="landingContentSubtitle">Platform-Independent Memory Solution That You Control</p>

          <div className="landingContentText">
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
      <section id="how-it-works" className="landingSection">
        <div className="landingContentContainer">
          <h2 className="landingContentTitle">How It Works</h2>
          <p className="landingContentSubtitle">Get started with AINMem in 4 simple steps</p>

          <div className="landingSteps">
            {/* Step 1 */}
            <div className="landingStep">
              <div className="landingStepNumber">1</div>
              <h3 className="landingStepTitle">Enable AINMem Extension</h3>
              <p className="landingStepDescription">
                Install the AIN wallet extension and enable AINMem in the settings panel. This grants permission for AINMem to access your wallet for secure authentication.
              </p>
            </div>

            {/* Step 2 */}
            <div className="landingStep">
              <div className="landingStepNumber">2</div>
              <h3 className="landingStepTitle">Connect Your AIN Wallet</h3>
              <p className="landingStepDescription">
                Log in securely using your AINwallet. Your wallet address becomes your unique identity, ensuring complete data ownership and decentralized authentication.
              </p>
            </div>

            {/* Step 3 */}
            <div className="landingStep">
              <div className="landingStepNumber">3</div>
              <h3 className="landingStepTitle">Configure & Converse</h3>
              <p className="landingStepDescription">
                Set your preferred domain in the wallet extension settings. Then simply have conversations as usual—the extension automatically captures your inputs and stores them as memories. No manual entry needed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="landingStep">
              <div className="landingStepNumber">4</div>
              <h3 className="landingStepTitle">Build & Visualize Graph</h3>
              <p className="landingStepDescription">
                Our FOL-SDK automatically transforms your memories into structured Constants, Facts, and Predicates. Navigate your knowledge graph with an intuitive visualization to see connections and discover patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="landingSpacer"></div>

      <hr className="landingDivider"/>

      {/* 3. 푸터 */}
      <footer className="landingFooter">
        <p>© 2025 AINMem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
