import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },

    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.image2url.com",
      },
      {
        protocol: "https",
        hostname: "image2url.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
