import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Metadata, Viewport } from 'next';

import { Toaster } from "@/components/ui/sonner"

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
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          <Toaster />
          <div className="container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
