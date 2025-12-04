'use client';

import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="December 4, 2025">
      <h2>1. Introduction</h2>
      <p>
        AINMem ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use our
        decentralized memory management platform.
      </p>
      <p>
        By using AINMem, you consent to the data practices described in this policy.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Wallet Information</h3>
      <p>
        When you connect your Web3 wallet (such as AINwallet), we collect:
      </p>
      <ul>
        <li>Wallet address (public key)</li>
        <li>Network information (chain ID)</li>
        <li>Wallet signatures for authentication</li>
      </ul>
      <p>
        <strong>Important:</strong> We never have access to your private keys or seed phrases.
        You maintain full control of your wallet at all times.
      </p>

      <h3>2.2 Memory Data</h3>
      <p>
        The content you store on AINMem includes:
      </p>
      <ul>
        <li>Chat logs and conversation history</li>
        <li>Timestamps of memory creation</li>
        <li>User-generated tags and categories</li>
        <li>Session information</li>
      </ul>

      <h3>2.3 Automatically Collected Information</h3>
      <p>
        When you use our Service, we may automatically collect:
      </p>
      <ul>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>IP address (anonymized)</li>
        <li>Usage patterns and analytics</li>
        <li>Error logs and performance data</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        We use the collected information for the following purposes:
      </p>
      <ul>
        <li><strong>Service Delivery:</strong> To provide and maintain AINMem's core functionality</li>
        <li><strong>Authentication:</strong> To verify your identity via wallet signatures</li>
        <li><strong>Data Storage:</strong> To store your memories in MongoDB and memory IDs on AIN Network</li>
        <li><strong>Analytics:</strong> To understand usage patterns and improve the Service</li>
        <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security issues</li>
        <li><strong>Communication:</strong> To send service updates and notifications (with your consent)</li>
      </ul>

      <h2>4. Data Storage and Security</h2>

      <h3>4.1 Dual Storage Architecture</h3>
      <p>
        Your data is stored in two separate locations:
      </p>
      <ul>
        <li>
          <strong>MongoDB Database:</strong> Full memory content stored on secure servers with encryption
          at rest and in transit. Access is restricted and monitored.
        </li>
        <li>
          <strong>AIN Network (Blockchain):</strong> Memory ObjectIds stored on-chain for ownership proof.
          This data is public and permanent by design.
        </li>
      </ul>

      <h3>4.2 Security Measures</h3>
      <p>
        We implement industry-standard security measures including:
      </p>
      <ul>
        <li>HTTPS/TLS encryption for all data transmission</li>
        <li>Database encryption at rest</li>
        <li>Regular security audits and updates</li>
        <li>Access control and authentication mechanisms</li>
        <li>Secure API endpoints with CORS protection</li>
      </ul>

      <h2>5. Data Sharing and Disclosure</h2>

      <h3>5.1 We Do Not Sell Your Data</h3>
      <p>
        AINMem does not sell, rent, or trade your personal information to third parties for marketing
        purposes.
      </p>

      <h3>5.2 Service Providers</h3>
      <p>
        We may share your information with trusted third-party service providers who assist us in
        operating the Service:
      </p>
      <ul>
        <li>Cloud hosting providers (for database infrastructure)</li>
        <li>Analytics services (anonymized data only)</li>
        <li>Customer support tools</li>
      </ul>

      <h3>5.3 Legal Requirements</h3>
      <p>
        We may disclose your information if required by law or in response to valid requests by
        public authorities (e.g., court orders, subpoenas).
      </p>

      <h3>5.4 Blockchain Transparency</h3>
      <p>
        Please note that memory IDs stored on AIN Network are publicly visible on the blockchain.
        While the IDs themselves don't reveal memory content, they prove ownership and timestamp.
      </p>

      <h2>6. Your Rights and Choices</h2>

      <h3>6.1 Access and Control</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access all your stored memories at any time</li>
        <li>Export your data in standard formats</li>
        <li>Delete memories from MongoDB (blockchain records are permanent)</li>
        <li>Disconnect your wallet and stop using the Service</li>
      </ul>

      <h3>6.2 Data Portability</h3>
      <p>
        You can export your memory data at any time through the Service interface. We provide
        data in JSON format for easy portability.
      </p>

      <h3>6.3 Account Deletion</h3>
      <p>
        You may request account deletion by contacting us. We will delete your data from MongoDB
        within 30 days. Note that blockchain records cannot be deleted.
      </p>

      <h2>7. Cookies and Tracking</h2>
      <p>
        AINMem uses minimal cookies and tracking technologies:
      </p>
      <ul>
        <li><strong>Session Storage:</strong> To maintain login state (userName, session ID)</li>
        <li><strong>Analytics Cookies:</strong> To understand usage patterns (anonymized)</li>
        <li><strong>Performance Monitoring:</strong> To detect and fix errors</li>
      </ul>
      <p>
        You can control cookie preferences through your browser settings.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        AINMem is not intended for users under the age of 13. We do not knowingly collect personal
        information from children. If you believe we have inadvertently collected information from
        a child, please contact us immediately.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your own.
        These countries may have different data protection laws. By using AINMem, you consent
        to such transfers.
      </p>

      <h2>10. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active or as needed to provide services.
        Specific retention periods:
      </p>
      <ul>
        <li><strong>Memory Content:</strong> Until you delete it or request account deletion</li>
        <li><strong>Blockchain Records:</strong> Permanent (cannot be deleted)</li>
        <li><strong>Usage Logs:</strong> 90 days</li>
        <li><strong>Analytics Data:</strong> 1 year (anonymized)</li>
      </ul>

      <h2>11. Third-Party Services</h2>
      <p>
        AINMem integrates with third-party services:
      </p>
      <ul>
        <li><strong>AIN Network:</strong> Blockchain infrastructure for Web3 storage</li>
        <li><strong>Wallet Providers:</strong> AINwallet, MetaMask, etc.</li>
        <li><strong>AI Services:</strong> For memory classification and analysis</li>
      </ul>
      <p>
        Each third-party service has its own privacy policy. We encourage you to review them.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant
        changes by:
      </p>
      <ul>
        <li>Posting the new Privacy Policy on this page</li>
        <li>Updating the "Last Updated" date</li>
        <li>Sending an email notification (if you've provided one)</li>
      </ul>
      <p>
        Your continued use of AINMem after changes constitutes acceptance of the updated policy.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have questions or concerns about this Privacy Policy or our data practices, please
        contact us:
      </p>
      <p className="contact-info">
        <strong>Email:</strong> <a href="mailto:contact@comcom.ai" className="contact-link">contact@comcom.ai</a><br />
        <strong>Website:</strong> <a href="https://comcom.ai/" target="_blank" rel="noopener noreferrer" className="contact-link">https://comcom.ai/</a>
      </p>

      <h2>14. Your California Privacy Rights (CCPA)</h2>
      <p>
        If you are a California resident, you have additional rights under the California Consumer
        Privacy Act (CCPA):
      </p>
      <ul>
        <li>Right to know what personal information is collected</li>
        <li>Right to know if personal information is sold or disclosed</li>
        <li>Right to opt-out of sale of personal information</li>
        <li>Right to deletion of personal information</li>
        <li>Right to non-discrimination for exercising your rights</li>
      </ul>
      <p>
        To exercise these rights, contact us at privacy@ainmem.com.
      </p>

      <h2>15. European Privacy Rights (GDPR)</h2>
      <p>
        If you are in the European Economic Area (EEA), you have rights under the General Data
        Protection Regulation (GDPR):
      </p>
      <ul>
        <li>Right of access to your personal data</li>
        <li>Right to rectification of inaccurate data</li>
        <li>Right to erasure ("right to be forgotten")</li>
        <li>Right to restrict processing</li>
        <li>Right to data portability</li>
        <li>Right to object to processing</li>
      </ul>
      <p>
        To exercise these rights, contact us at contact@comcom.ai.
      </p>

      <h2>16. Commitment to Privacy</h2>
      <p>
        At AINMem, we believe in "Own Your Memory, Own Your Data." Your privacy is not just a
        legal requirement for us—it's a core principle. We're committed to transparency,
        user control, and responsible data handling.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
