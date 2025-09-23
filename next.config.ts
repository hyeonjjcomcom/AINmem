import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@ainblockchain/ain-util',
      '@ainblockchain/ain-js',
      'bip39',
      'eccrypto',
      'secp256k1',
      'bn.js',
      'rlp',
      'varuint-bitcoin'
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'eccrypto': 'commonjs eccrypto',
        'secp256k1': 'commonjs secp256k1',
        'bip39': 'commonjs bip39',
        'bn.js': 'commonjs bn.js',
        'rlp': 'commonjs rlp',
        'varuint-bitcoin': 'commonjs varuint-bitcoin'
      });
    }
    return config;
  }
};

export default nextConfig;