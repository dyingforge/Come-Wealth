import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*', // 代理的路径
        destination: 'https://fullnode.testnet.sui.io/:path*', // 目标服务器
      },
    ];
  },
};

export default nextConfig;
