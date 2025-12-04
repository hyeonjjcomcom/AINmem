'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import '../app/styles.css';
import './LegalPageLayout.css';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
  const router = useRouter();

  return (
    <div className="landing">
      {/* Navigation Bar */}
      <header className="landing-navbar">
        <div className="landing-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          AINMem
        </div>
      </header>

      {/* Legal Content */}
      <section className="landing-section legal-section">
        <div className="legal-content">
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last Updated: {lastUpdated}</p>

          <div className="legal-text">
            {children}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          <a onClick={() => router.push('/terms')} className="footer-link">Terms of Service</a>
          <a onClick={() => router.push('/privacy')} className="footer-link">Privacy Policy</a>
          <a href="mailto:contact@comcom.ai" className="footer-link">Contact</a>
        </div>
        <p className="footer-text">© 2025 AINMem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
