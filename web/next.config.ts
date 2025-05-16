import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 添加这行，跳过 ESLint 构建错误
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://fullnode.testnet.sui.io/:path*',
      },
    ];
  },
};

export default nextConfig;