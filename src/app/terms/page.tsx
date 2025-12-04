'use client';

import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

const TermsOfService = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="December 4, 2025">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using AINMem ("the Service"), you accept and agree to be bound by the terms
        and provisions of this agreement. If you do not agree to these Terms of Service, please do not
        use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        AINMem is a decentralized memory management platform that enables users to store, organize,
        and visualize their personal data using blockchain technology. The Service integrates with
        AIN Network to provide Web3-based storage and ownership proof.
      </p>

      <h2>3. User Accounts and Wallet Connection</h2>
      <p>
        To use AINMem, you must connect a compatible Web3 wallet (such as AINwallet). You are
        responsible for maintaining the security of your wallet and private keys. AINMem does not
        have access to your private keys and cannot recover your account if you lose access to your wallet.
      </p>

      <h2>4. Data Ownership and Privacy</h2>
      <p>
        You retain full ownership of all data you store on AINMem. Your memory data is stored in two locations:
      </p>
      <ul>
        <li><strong>MongoDB:</strong> Full content storage for fast retrieval and processing</li>
        <li><strong>AIN Network (Web3):</strong> Memory IDs stored on blockchain for ownership proof</li>
      </ul>
      <p>
        We do not sell, rent, or share your personal data with third parties except as required by law
        or as necessary to provide the Service.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Store illegal, harmful, or offensive content</li>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe upon intellectual property rights of others</li>
        <li>Attempt to gain unauthorized access to the Service or other users' data</li>
        <li>Interfere with or disrupt the Service or servers</li>
      </ul>

      <h2>6. Service Availability</h2>
      <p>
        While we strive to provide continuous service, AINMem is provided "as is" without warranty
        of any kind. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
      </p>

      <h2>7. Blockchain Transactions</h2>
      <p>
        The Service uses AIN Network testnet for Web3 storage. Blockchain transactions are irreversible
        once confirmed. You understand and accept the risks associated with blockchain technology, including
        but not limited to network congestion, transaction failures, and smart contract vulnerabilities.
      </p>

      <h2>8. Fees and Payments</h2>
      <p>
        AINMem is currently free to use. We reserve the right to introduce fees or subscription plans
        in the future, with advance notice to users.
      </p>

      <h2>9. Data Retention and Deletion</h2>
      <p>
        You may delete your memories at any time through the Service interface. However, please note
        that blockchain records on AIN Network are permanent and cannot be deleted once written.
      </p>

      <h2>10. Intellectual Property</h2>
      <p>
        The AINMem platform, including its design, code, and branding, is protected by copyright and
        other intellectual property laws. You may not copy, modify, or distribute any part of the Service
        without our express written permission.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, AINMem shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
        directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
      </p>
      <ul>
        <li>Your use or inability to use the Service</li>
        <li>Unauthorized access to or alteration of your data</li>
        <li>Any conduct or content of third parties on the Service</li>
        <li>Blockchain network failures or issues</li>
      </ul>

      <h2>12. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless AINMem and its affiliates from any claims, damages,
        losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.
      </p>

      <h2>13. Modifications to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify users of significant
        changes via email or through the Service interface. Your continued use of the Service after
        such modifications constitutes acceptance of the updated Terms.
      </p>

      <h2>14. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the Service at any time, with or
        without cause, with or without notice. Upon termination, your right to use the Service will
        immediately cease.
      </p>

      <h2>15. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
        in which AINMem operates, without regard to its conflict of law provisions.
      </p>

      <h2>16. Contact Information</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us at:
      </p>
      <p className="contact-info">
        <strong>Email:</strong> <a href="mailto:contact@comcom.ai" className="contact-link">contact@comcom.ai</a><br />
        <strong>Website:</strong> <a href="https://comcom.ai/" target="_blank" rel="noopener noreferrer" className="contact-link">https://comcom.ai/</a>
      </p>

      <h2>17. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable or invalid, that provision will be
        limited or eliminated to the minimum extent necessary, and the remaining provisions will remain
        in full force and effect.
      </p>

      <h2>18. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy, constitute the entire agreement between you and
        AINMem regarding the use of the Service, superseding any prior agreements.
      </p>
    </LegalPageLayout>
  );
};

export default TermsOfService;
