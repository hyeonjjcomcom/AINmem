import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'AINMem',
  description: 'Visualizing relationships between logical propositions',
  icons: {
    icon: '/favicon.png',
  },
};

// 뷰포트 설정을 별도로 분리
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
