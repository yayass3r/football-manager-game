import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Vercel deployment: remove the 'output' option (server mode)
  // For APK build: set output: "export" for static export
  // The build script handles this automatically
  output: process.env.NEXT_BUILD_MODE === "export" ? "export" : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // For static export, images must be unoptimized
  images: {
    unoptimized: process.env.NEXT_BUILD_MODE === "export" ? true : false,
  },
};

export default nextConfig;
