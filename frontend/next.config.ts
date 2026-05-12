import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['rumor-placidly-dropout.ngrok-free.app', 'rumor-placidly-dropout.ngrok-free.dev'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
};

export default nextConfig;
