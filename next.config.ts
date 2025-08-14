import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['profile.line-scdn.net'], // LINE profile images
  },
};

export default nextConfig;
