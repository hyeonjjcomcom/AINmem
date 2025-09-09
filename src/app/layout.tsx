import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Graph',
  description: 'Visualizing relationships between logical propositions',
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
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
