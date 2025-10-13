import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove problematic webpack configuration for production builds
  webpack: (config, { dev, isServer }) => {
    // Only apply watch options in development
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
