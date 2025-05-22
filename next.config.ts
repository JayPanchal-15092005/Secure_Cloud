import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  "env": {
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL || 'http://localhost:3000',
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
