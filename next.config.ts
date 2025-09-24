import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // 🔥 클라이언트 번들에서 완전히 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'eccrypto': false,
        '@ainblockchain/ain-util': false,
        '@ainblockchain/ain-js': false,
        'crypto': false,
        'stream': false,
        'buffer': false,
        'util': false,
        'fs': false,
        'path': false,
        'os': false,
      };
    }
    
    // 서버에서는 외부 패키지로 처리
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('eccrypto');
    }
    
    return config;
  },
  
  // 서버 컴포넌트에서만 사용하도록 명시
  experimental: {
    serverComponentsExternalPackages: [
      'eccrypto',
      '@ainblockchain/ain-util', 
    ]
  }
};

export default nextConfig;