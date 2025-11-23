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
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#usecases" className="landing-nav-link">Use Cases</a>
          <a href="#research" className="landing-nav-link">Research</a>
          {/* 메인 CTA 버튼 */}
          <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
        </nav>
      </header>

      {/* 2. 히어로 섹션 - 메인 메시지 및 CTA */}
      <section id="hero" className="landing-section hero">
        <div className="landing-content">
          <h1 className="landing-title">Give Your AI Agents Infinite Memory</h1>
          <p className="landing-subtitle">
            The ultimate memory solution that enhances AI performance while reducing costs
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

      <hr className="landing-divider"/>

      {/* 3. 핵심 혜택 섹션 - 3가지 주요 가치 제안 */}
      <section id="benefits" className="landing-section">
        <h2 className="landing-section-title">Key Benefits</h2>
        <div className="landing-cards">
          <BenefitCard
            title="Cost Reduction"
            description="Reduce unnecessary token usage by up to **80%**."
          />
          <BenefitCard
            title="Enhanced Response Quality"
            description="Maintain long-term context to provide more accurate and personalized responses."
          />
          <BenefitCard
            title="Easy Integration"
            description="Add memory capabilities instantly with just one line of code."
          />
        </div>
      </section>

      <hr className="landing-divider"/>

      {/* 4. 기능 상세 섹션 - 개발자/엔터프라이즈 기능 */}
      <section id="features" className="landing-section light-bg">
        {/* 개발자 기능 */}
        <div className="landing-feature-group">
          <h2 className="landing-group-title">Developer Features: One-Line Install, Infinite Recall</h2>
          <p className="landing-group-subtitle">Give your AI applications persistent context and minimize token costs.</p>
          <TableComponent
            headers={["Feature Name", "Key Benefit"]}
            data={[
              ["**Memory Compression Engine**", "Maintains context fidelity while minimizing token usage and latency"],
              ["**Zero-Friction Installation**", "No configuration needed, fast development and deployment"],
              ["**Flexible Framework Compatibility**", "Free stack composition in Python or JS environments (OpenAI, LangGraph, etc.)"],
            ]}
          />
        </div>

        {/* 엔터프라이즈 기능 */}
        <div className="landing-feature-group">
          <h2 className="landing-group-title">Enterprise Features: Security, Compliance, Deployment Flexibility</h2>
          <p className="landing-group-subtitle">Provides secure and auditable memory layer for large-scale operations.</p>
          <TableComponent
            headers={["Feature Name", "Key Benefit"]}
            data={[
              ["**Zero-Trust Security &amp; Compliance**", "Ensures data security and audit readiness (SOC 2, HIPAA, BYOK support)"],
              ["**Deploy Anywhere**", "Maximizes deployment flexibility with consistent API and behavior (Kubernetes, private cloud, etc.)"],
              ["**Built-in Traceability**", "Easily debug and audit by understanding exactly what AI learned"],
            ]}
          />
        </div>
      </section>

      <hr className="landing-divider"/>

      {/* 5. 고객 후기 섹션 - 실제 사용 사례 */}
      <section id="testimonials" className="landing-section dark-bg">
        <h2 className="landing-section-title">Customer Testimonials</h2>
        <div className="landing-cards">
          <TestimonialCard
            quote="After integrating AINMem, our AI assistant successfully provides personalized recovery support to over 80,000 users by remembering patients' past medical records and preferences."
            author="Koby Conrad, Sunflower Sober CEO"
          />
          <TestimonialCard
            quote="Thanks to AINMem, we were able to scale personalized visual learning while reducing token costs by 40%."
            author="Abhi Arya, Opennote Co-founder"
          />
        </div>
      </section>

      <hr className="landing-divider"/>

      {/* 6. 연구 및 성능 섹션 - 정량적 지표 */}
      <section id="research" className="landing-section dark-bg">
        <h2 className="landing-section-title">Research & Performance: Industry-Leading Efficiency</h2>
        <p className="landing-section-subtitle">AINMem outperforms competing memory solutions in accuracy, latency, and token savings.</p>

        {/* 핵심 성능 지표 */}
        <div className="landing-stats">
          <StatItem value="26%" label="Response Quality Improvement" />
          <StatItem value="90%" label="Token Usage Reduction" />
        </div>

        {/* 성능 비교 차트 영역 (추후 차트 추가 예정) */}
        <div className="landing-visual">
          {/* TODO: 성능 비교 차트 또는 그래프 추가 */}
        </div>

        {/* 연구 자료 페이지로 이동 */}
        <button onClick={() => handleNavigation('/research')} className="landing-cta secondary-cta">View Research</button>
      </section>

      <hr className="landing-divider"/>

      {/* 7. 하단 CTA 섹션 - 최종 전환 유도 */}
      <section id="contact" className="landing-section dark-bg">
        <h2 className="landing-section-title">Start Now</h2>
        <p className="landing-section-subtitle">Add permanent memory to your AI application in just a few minutes and experience the innovation.</p>
        <div className="landing-ctas">
          <button onClick={() => handleNavigation('/memories')} className="landing-cta primary-cta">Get Started</button>
          <button onClick={() => handleNavigation('/demo')} className="landing-cta secondary-cta">Request Demo</button>
        </div>
      </section>

      {/* 8. 푸터 */}
      <footer className="landing-footer">
        <p>© 2025 AINMem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

// ====================================================================
// 헬퍼 컴포넌트
// ====================================================================

/**
 * 혜택 카드 컴포넌트
 * - 주요 혜택을 카드 형태로 표시
 * - HTML 마크업을 지원하여 볼드체 등 스타일링 가능
 */
interface BenefitCardProps {
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description }) => (
    <div className="landing-card">
        <h3 className="landing-card-title">{title}</h3>
        {/* dangerouslySetInnerHTML: 마크다운 볼드(**text**)를 HTML로 렌더링 */}
        <p className="landing-card-description" dangerouslySetInnerHTML={{ __html: description }}></p>
    </div>
);

/**
 * 테이블 컴포넌트
 * - 기능 목록을 테이블 형태로 표시
 * - 첫 번째 열은 HTML 지원 (볼드체 등)
 */
interface TableComponentProps {
  headers: string[];
  data: string[][];
}

const TableComponent: React.FC<TableComponentProps> = ({ headers, data }) => (
    <div className="landing-table-container">
        <table>
            <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {/* 첫 번째 열: HTML 마크업 지원 */}
                        <td dangerouslySetInnerHTML={{ __html: row[0] }}></td>
                        {/* 두 번째 열: 순수 텍스트 */}
                        <td>{row[1]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/**
 * 고객 후기 카드 컴포넌트
 * - 실제 고객의 사용 후기를 표시
 */
interface TestimonialCardProps {
  quote: string;
  author: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author }) => (
    <div className="landing-card">
        <p className="landing-quote">"&nbsp;{quote}&nbsp;"</p>
        <p className="landing-author">{author}</p>
    </div>
);

/**
 * 통계 항목 컴포넌트
 * - 성능 지표를 숫자와 라벨로 표시
 */
interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
    <div className="landing-stat-item">
        <h3 className="landing-stat-value">{value}</h3>
        <p className="landing-stat-label">{label}</p>
    </div>
);
