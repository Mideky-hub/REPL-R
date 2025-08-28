import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes - Permissive CSP for Google OAuth
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https:",
              "frame-src https:",
              "child-src https:",
              "object-src 'none'",
              "base-uri 'self'"
            ].join("; ")
          }
        ]
      }
    ]
  }
};

export default nextConfig;
