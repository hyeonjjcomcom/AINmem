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
      <header className="landingNavbar">
        <div className="landingLogo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          AINMem
        </div>
      </header>

      {/* Legal Content */}
      <section className="landingSection legalSection">
        <div className="legalContent">
          <h1 className="legalTitle">{title}</h1>
          <p className="legalUpdated">Last Updated: {lastUpdated}</p>

          <div className="legalText">
            {children}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landingFooter">
        <div className="footerLinks">
          <a onClick={() => router.push('/terms')} className="footerLink">Terms of Service</a>
          <a onClick={() => router.push('/privacy')} className="footerLink">Privacy Policy</a>
          <a href="mailto:contact@comcom.ai" className="footerLink">Contact</a>
        </div>
        <p className="footerText">© 2025 AINMem. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
