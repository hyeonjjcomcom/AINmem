import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@ainblockchain/ain-util',
      'eccrypto',
      'secp256k1'
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'eccrypto': 'commonjs eccrypto',
        'secp256k1': 'commonjs secp256k1'
      });
    }
    return config;
  }
};

export default nextConfig;
