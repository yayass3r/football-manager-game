import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles the build output automatically
  // Remove "standalone" for Vercel deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Optimize for serverless
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
