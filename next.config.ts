import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Vercel deployment (serverless)
  // When building APK, change to: output: "export"
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
